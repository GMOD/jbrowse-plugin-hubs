#!/usr/bin/env node
//
// Boots a candidate build on hosted JBrowse 5 releases and fails if any of
// them cannot load it, or cannot resolve a hosted genome through it.
//
// This plugin is named by `jbrowse.org/ucsc/*` configs at permanent urls, and
// the store serves its newest release to every JBrowse 5 host that opens one,
// so a publish is a live change with no staging step. A bundle that throws
// from configure() takes the whole session to the error page, which tsc,
// eslint and a url check cannot see: 1.0.9 did that on every hosted release.
//
// JBrowse 4 hosts ignore the store and load the config's
// `latest/dist/jbrowse-plugin-hubs.umd.production.min.js`, which is 1.0.18 for
// good because no later release carries a file of that name
// (jbrowse-plugin-list ADR 0009). FROZEN_UMD guards that.
//
// Usage:
//   node scripts/host-compat-probe.mjs --bundle dist/jbrowse-plugin-hubs.esm.js
//   node scripts/host-compat-probe.mjs --bundle … --versions main
//
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { launch } from 'puppeteer-core'

import { FLOOR, NEWEST_RELEASE } from './hosts.mjs'

const DEFAULT_VERSIONS = [FLOOR, NEWEST_RELEASE, 'main']

// A real shipped config that names this plugin by `storePlugin`, which a
// JBrowse 5 host resolves through the store manifest rewritten below
const CONFIG = 'https://jbrowse.org/ucsc/hg38/config.json'
const UNKNOWN_HOSTED_GENOME = 'mm39'
const STORE_NAME = 'Hubs'
const PLUGIN_CLASS_NAME = 'HubsViewerPlugin'
const PACKAGE_PATH = '/jbrowse-plugin-hubs/'
const FROZEN_UMD = 'jbrowse-plugin-hubs.umd.production.min.js'

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ...fs
      .globSync(
        path.join(os.homedir(), '.cache/puppeteer/chrome/*/chrome-*/chrome'),
      )
      .sort()
      .reverse(),
  ].filter(Boolean)
  const found = candidates.find(c => fs.existsSync(c))
  if (!found) {
    throw new Error(
      `no browser found; set CHROME_PATH. Looked in: ${candidates.join(', ')}`,
    )
  }
  return found
}

const { values } = parseArgs({
  options: {
    bundle: { type: 'string' },
    versions: { type: 'string' },
    timeout: { type: 'string', default: '90000' },
    json: { type: 'string' },
  },
})
if (!values.bundle) {
  throw new Error('--bundle <path to the built ESM entry> is required')
}
const versions = values.versions?.split(',') ?? DEFAULT_VERSIONS
const timeout = Number(values.timeout)
const entryPath = values.bundle
const entryName = path.basename(entryPath)
const dist = path.dirname(entryPath)
const candidateUrl = `https://jbrowse.org/plugins/@cmdcolin${PACKAGE_PATH}latest/dist/${entryName}`

if (fs.existsSync(path.join(dist, FROZEN_UMD))) {
  throw new Error(
    `${dist} holds ${FROZEN_UMD}: publishing it replaces the 1.0.18 build every JBrowse 4 host loads from latest/`,
  )
}

let entryRequests = 0
let manifestPromise

// Every build of this plugin becomes the ESM entry at its store path, the
// shape the store publishes for an `esmPath` plugin
function rewrittenStoreManifest(url) {
  manifestPromise ??= (async () => {
    const manifest = await (await fetch(url)).json()
    for (const plugin of manifest.plugins ?? []) {
      if (plugin.name === STORE_NAME) {
        for (const build of [plugin, ...(plugin.versions ?? [])]) {
          delete build.url
          delete build.umdUrl
          delete build.integrity
          build.esmUrl = candidateUrl
        }
      }
    }
    return JSON.stringify(manifest)
  })()
  return manifestPromise
}

function candidateFile(url) {
  const rel = new URL(url).pathname.split('/dist/').slice(1).join('/dist/')
  const local = path.join(dist, rel)
  if (rel === entryName) {
    entryRequests += 1
  }
  return rel.endsWith('.js') && fs.existsSync(local) ? local : undefined
}

// Fetch patterns rather than page.setRequestInterception: the latter pauses
// every request, including the RPC workers' own, which puppeteer never sees
// and so never resumes
async function serveCandidate(page) {
  const client = await page.createCDPSession()
  client.on('Fetch.requestPaused', async ({ requestId, request }) => {
    try {
      const isManifest = /\/plugin-store\/.*plugins\.json/.test(request.url)
      const file = isManifest ? undefined : candidateFile(request.url)
      const body = isManifest
        ? await rewrittenStoreManifest(request.url)
        : file && fs.readFileSync(file, 'utf8')
      await (body === undefined
        ? client.send('Fetch.continueRequest', { requestId })
        : client.send('Fetch.fulfillRequest', {
            requestId,
            responseCode: 200,
            responseHeaders: [
              {
                name: 'Content-Type',
                value: isManifest
                  ? 'application/json'
                  : 'application/javascript',
              },
              { name: 'Access-Control-Allow-Origin', value: '*' },
            ],
            body: Buffer.from(body).toString('base64'),
          }))
    } catch {
      await client.send('Fetch.continueRequest', { requestId }).catch(() => {})
    }
  })
  await client.send('Fetch.enable', {
    patterns: [
      { urlPattern: `*${PACKAGE_PATH}*` },
      { urlPattern: '*/plugin-store/*plugins.json*' },
    ],
  })
}

async function probeOne(browser, version) {
  const page = await browser.newPage()
  await serveCandidate(page)
  const consoleErrors = []
  page.on('console', m => {
    if (m.type() === 'error') {
      consoleErrors.push(m.text().slice(0, 300))
    }
  })
  page.on('pageerror', e => {
    consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`)
  })

  const result = { version, consoleErrors }
  const entryRequestsBefore = entryRequests
  try {
    const url = `https://jbrowse.org/code/jb2/${version}/?config=${encodeURIComponent(CONFIG)}`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })

    // Readiness is the session global or the error page. Do NOT wait on markup:
    // the loading spinner is an svg, so an element-presence wait returns before
    // plugins have loaded and reads every host as broken.
    result.settled = await page
      .waitForFunction(
        () =>
          !!(window.JBrowseSession ?? window.__jbrowse_session) ||
          /JBrowse Error|Fatal error/.test(document.body.innerText),
        { timeout },
      )
      .then(() => true)
      .catch(() => false)

    result.appError = await page.evaluate(() => {
      const t = document.body.innerText
      return t.includes('JBrowse Error') || t.includes('Fatal error')
        ? t.split('\n').slice(0, 4).join(' | ').slice(0, 300)
        : undefined
    })

    result.registered = await page.evaluate(
      name =>
        !!window.JBrowseRootModel?.pluginManager?.plugins?.some(
          p => p.name === name,
        ),
      PLUGIN_CLASS_NAME,
    )
    result.candidateServed = entryRequests > entryRequestsBefore

    // The plugin's whole job, and every request it makes is to jbrowse.org,
    // the origin this page already depends on
    result.resolved =
      result.registered &&
      (await page
        .waitForFunction(
          name => {
            const { assemblyManager } =
              window.JBrowseSession ?? window.__jbrowse_session
            assemblyManager.get(name)
            return assemblyManager.has(name)
          },
          { timeout: 30_000 },
          UNKNOWN_HOSTED_GENOME,
        )
        .then(() => true)
        .catch(() => false))
  } catch (e) {
    result.threw = String(e).slice(0, 300)
  }
  await page.close()
  return result
}

function failure(r) {
  return r.appError
    ? `SESSION FAILED: ${r.appError}`
    : r.threw
      ? `probe threw: ${r.threw}`
      : !r.settled
        ? 'never settled (no session and no error page)'
        : !r.candidateServed
          ? 'the host never requested the candidate entry (did the store ref resolve?)'
          : !r.registered
            ? `${PLUGIN_CLASS_NAME} is not registered (the bundle threw while evaluating)`
            : r.resolved
              ? undefined
              : `${UNKNOWN_HOSTED_GENOME} never joined the session`
}

const browser = await launch({
  headless: true,
  executablePath: findChrome(),
  args: ['--no-sandbox'],
  defaultViewport: { width: 1400, height: 900 },
})

console.log(
  `serving ${entryPath} as ${STORE_NAME} to ${CONFIG}\n` +
    `hosts: ${versions.join(', ')}\n`,
)

const results = []
for (const version of versions) {
  const r = await probeOne(browser, version)
  results.push(r)
  const bad = failure(r)
  console.log(`${version.padEnd(16)} ${bad ?? 'ok'}`)
  if (bad) {
    for (const e of [...new Set(r.consoleErrors)].slice(0, 4)) {
      console.log(`                 · ${e}`)
    }
  }
}
await browser.close()

if (values.json) {
  fs.writeFileSync(values.json, JSON.stringify(results, null, 2))
}

const broken = results.filter(r => failure(r)).map(r => r.version)
if (broken.length > 0) {
  console.error(`\nFailed on: ${broken.join(', ')}`)
  process.exit(1)
}
console.log(
  '\nAll probed hosts loaded the bundle and resolved a hosted genome.',
)
