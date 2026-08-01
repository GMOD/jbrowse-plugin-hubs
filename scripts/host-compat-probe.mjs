#!/usr/bin/env node
//
// Boots a candidate umd build on hosted JBrowse releases and fails if any of
// them cannot load it.
//
// This plugin is named by `jbrowse.org/ucsc/*` configs, which live at permanent
// urls that published links and old desktop installs keep loading, and the store
// serves `latest/` with no-cache. So a publish is a live change to configs
// shipped months ago, with no staging step in between.
//
// `plugins[].url` is also the only config field that can kill a whole session
// rather than one track: PluginLoader runs Promise.all over the plugin list, so
// a bundle that throws while loading or configuring never defines its global,
// the promise rejects, and every config naming it shows the app's error page.
//
// 1.0.9 shipped `appendToMenu('File', …)`, which every released core from v4.0.0
// to latest rejects because it defines the File menu as a thunk and appends via
// `menu.menuItems.push()`. hg38, hg19, mm39 and hs1 were error pages on every
// hosted release until 1.0.11, and nothing here reported it -- a throw out of
// configure() is invisible to tsc, eslint, and a url reachability check. This
// makes it a build failure instead.
//
// Uses puppeteer-core rather than puppeteer so the repo does not carry a ~150MB
// Chromium download for one check. Point CHROME_PATH at a browser, or let it
// find a system Chrome or a puppeteer cache one.
//
// Usage:
//   node scripts/host-compat-probe.mjs --bundle dist/jbrowse-plugin-hubs.umd.production.min.js
//   node scripts/host-compat-probe.mjs --bundle … --versions v4.0.0,main
//
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { launch } from 'puppeteer-core'

// The oldest entry is the support floor. `main` is included because a core
// change lands there first, so an export a plugin depends on disappearing shows
// up here before any release carries it.
const DEFAULT_VERSIONS = ['v4.0.0', 'v4.3.0', 'latest', 'main']

// Real shipped configs that name this plugin, rather than a fixture: the point
// is to reproduce what a user's url actually loads.
const CONFIGS = {
  hg38: 'https://jbrowse.org/ucsc/hg38/config.json',
  hg19: 'https://jbrowse.org/ucsc/hg19/config.json',
}
const PLUGIN_GLOBAL = 'JBrowsePluginHubs'
const PACKAGE_PATH = '/jbrowse-plugin-hubs/'

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
    configs: { type: 'string' },
    timeout: { type: 'string', default: '90000' },
    json: { type: 'string' },
  },
})
if (!values.bundle) {
  throw new Error('--bundle <path to built umd> is required')
}
const versions = values.versions?.split(',') ?? DEFAULT_VERSIONS
const configNames = values.configs?.split(',') ?? Object.keys(CONFIGS)
const timeout = Number(values.timeout)
const bundle = fs.readFileSync(values.bundle, 'utf8')
const bundleDir = path.dirname(values.bundle)
const mainName = path.basename(values.bundle)

// Serves the whole local dist for the plugin's store path, not just the one
// file: a build that code-splits fetches sibling chunks by their own hashed
// names, and answering those with the main bundle produces a failure that looks
// like a host incompatibility but is a probe bug.
async function serveCandidate(page) {
  await page.setRequestInterception(true)
  page.on('request', req => {
    const url = req.url()
    const name = path.basename(new URL(url).pathname)
    const sibling = path.join(bundleDir, name)
    const isPluginAsset = url.includes(PACKAGE_PATH) && name.endsWith('.js')
    const body = !isPluginAsset
      ? undefined
      : name !== mainName && fs.existsSync(sibling)
        ? fs.readFileSync(sibling, 'utf8')
        : bundle
    if (body === undefined) {
      req.continue().catch(() => {})
    } else {
      req
        .respond({
          status: 200,
          contentType: 'application/javascript',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body,
        })
        .catch(() => {})
    }
  })
}

async function probeOne(browser, version, configName) {
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

  const result = { version, config: configName, consoleErrors }
  try {
    const config = CONFIGS[configName]
    const url = `https://jbrowse.org/code/jb2/${version}/?config=${encodeURIComponent(config)}`
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

    result.globalDefined = await page.evaluate(
      name => name in window,
      PLUGIN_GLOBAL,
    )
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
      : r.settled
        ? r.globalDefined
          ? undefined
          : `${PLUGIN_GLOBAL} is undefined (the bundle threw while evaluating)`
        : 'never settled (no session and no error page)'
}

const browser = await launch({
  headless: true,
  executablePath: findChrome(),
  args: ['--no-sandbox'],
  defaultViewport: { width: 1400, height: 900 },
})

console.log(`serving ${values.bundle} as the Hubs plugin`)
const results = []
for (const configName of configNames) {
  console.log(`\n${configName}: ${CONFIGS[configName]}`)
  for (const version of versions) {
    const r = await probeOne(browser, version, configName)
    results.push(r)
    const bad = failure(r)
    console.log(`  ${version.padEnd(10)} ${bad ?? 'ok'}`)
    if (bad) {
      for (const e of [...new Set(r.consoleErrors)].slice(0, 4)) {
        console.log(`             · ${e}`)
      }
    }
  }
}
await browser.close()

if (values.json) {
  fs.writeFileSync(values.json, JSON.stringify(results, null, 2))
}

const broken = results.filter(r => failure(r))
if (broken.length > 0) {
  console.error(
    `\nFailed on: ${broken.map(r => `${r.config}@${r.version}`).join(', ')}`,
  )
  process.exit(1)
}
console.log('\nAll probed hosts loaded the bundle.')
