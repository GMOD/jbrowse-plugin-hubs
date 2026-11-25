import { afterEach, expect, test, vi } from 'vitest'

import { describeAssemblies } from '../src/describeAssemblies'
import {
  findHostedAssembly,
  hostedAssemblyFromConfig,
} from '../src/hostedAssembly'

const ucsc = (db: string, file: string) =>
  `https://jbrowse.org/ucsc/${db}/${file}`

function hubConfig(name: string) {
  return {
    assemblies: [
      {
        name,
        aliases: [`${name}Alias`],
        sequence: { adapter: { type: 'TwoBitAdapter', uri: `${name}.2bit` } },
      },
    ],
    tracks: [
      { trackId: `${name}-refGene`, adapter: { uri: 'refGene.bb' } },
      { trackId: `${name}-ncbiRefSeq`, adapter: { uri: 'ncbiRefSeq.bb' } },
    ],
  }
}

function serve(files: Record<string, unknown>, failing: string[] = []) {
  const fetched: string[] = []
  vi.stubGlobal('fetch', async (url: string) => {
    fetched.push(url)
    return failing.includes(url)
      ? new Response('', { status: 503 })
      : url in files
        ? Response.json(files[url])
        : new Response('', { status: 404 })
  })
  return fetched
}

afterEach(() => {
  vi.unstubAllGlobals()
})

test('finds an assembly by name or alias, with the preferred gene track', () => {
  const config = hubConfig('aaa1')
  for (const name of ['aaa1', 'aaa1Alias']) {
    expect(hostedAssemblyFromConfig(config, name, 'u')).toEqual({
      configUrl: 'u',
      assembly: config.assemblies[0],
      geneAdapter: { uri: 'ncbiRefSeq.bb' },
    })
  }
})

test('a config that lacks the assembly answers undefined', () => {
  expect(hostedAssemblyFromConfig(hubConfig('aaa1'), 'bbb1', 'u')).toBe(
    undefined,
  )
})

test('falls back to config.json and resolves relative uris against it', async () => {
  const url = ucsc('ccc1', 'config.json')
  const fetched = serve({ [url]: hubConfig('ccc1') })
  const hosted = await findHostedAssembly('ccc1')
  expect(fetched).toEqual([ucsc('ccc1', 'minimal.json'), url])
  expect(hosted?.configUrl).toBe(url)
  expect(hosted?.assembly.sequence).toEqual({
    adapter: { type: 'TwoBitAdapter', uri: 'ccc1.2bit', baseUri: url },
  })
  expect(hosted?.geneAdapter).toEqual({ uri: 'ncbiRefSeq.bb', baseUri: url })
})

test('a found config and a 404 are each fetched once', async () => {
  const url = ucsc('ddd1', 'minimal.json')
  const fetched = serve({ [url]: hubConfig('ddd1') })
  await findHostedAssembly('ddd1')
  await findHostedAssembly('ddd1')
  expect(await findHostedAssembly('eee1')).toBe(undefined)
  expect(await findHostedAssembly('eee1')).toBe(undefined)
  expect(fetched).toEqual([
    url,
    ucsc('eee1', 'minimal.json'),
    ucsc('eee1', 'config.json'),
  ])
})

test('a server error is not remembered', async () => {
  const url = ucsc('fff1', 'minimal.json')
  const error = vi.spyOn(console, 'error').mockImplementation(() => {})
  serve({}, [url])
  expect(await findHostedAssembly('fff1')).toBe(undefined)
  expect(error).toHaveBeenCalledOnce()
  serve({ [url]: hubConfig('fff1') })
  expect((await findHostedAssembly('fff1'))?.configUrl).toBe(url)
  error.mockRestore()
})

test('describes only the hosted names nobody described yet', async () => {
  serve({ [ucsc('ggg1', 'minimal.json')]: hubConfig('ggg1') })
  const already = { assembly: { name: 'hhh1' } }
  const described = await describeAssemblies({ hhh1: already }, [
    'ggg1',
    'hhh1',
    'iii1',
    'not a name',
  ])
  expect(Object.keys(described).sort()).toEqual(['ggg1', 'hhh1'])
  expect(described.hhh1).toBe(already)
  expect(Object.keys(described.ggg1 ?? {}).sort()).toEqual([
    'assembly',
    'geneAdapter',
  ])
})
