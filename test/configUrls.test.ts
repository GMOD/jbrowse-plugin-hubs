import { expect, test } from 'vitest'

import { getConfigUrls } from '../src/configUrls'

test('a UCSC db tries minimal.json before config.json', () => {
  expect(getConfigUrls('hg38')).toEqual([
    'https://jbrowse.org/ucsc/hg38/minimal.json',
    'https://jbrowse.org/ucsc/hg38/config.json',
  ])
})

test('a GenArk accession names its sharded config', () => {
  expect(getConfigUrls('GCF_000298275.1')).toEqual([
    'https://jbrowse.org/hubs/genark/GCF/000/298/275/GCF_000298275.1/config.json',
  ])
})

test('a name that could not be a path segment has no urls', () => {
  expect(getConfigUrls('../hg38')).toEqual([])
  expect(getConfigUrls('hg 38')).toEqual([])
  expect(getConfigUrls('GCA_12')).toEqual([])
})
