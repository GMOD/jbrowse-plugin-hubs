import { expect, test } from 'vitest'

import { toDesktopSnapshot } from '../src/util'

test('session tracks and assemblies become config entries, the rest the default session', () => {
  expect(
    toDesktopSnapshot(
      {
        plugins: [{ name: 'Hubs' }],
        assemblies: [{ name: 'hg38' }],
        tracks: [{ trackId: 'genes' }, { trackId: 'mine', name: 'config' }],
      },
      {
        name: 'My session',
        views: [{ id: 'main' }],
        sessionAssemblies: [{ name: 'mm39' }],
        sessionTracks: [{ trackId: 'mine', name: 'session' }],
      },
    ),
  ).toEqual({
    plugins: [{ name: 'Hubs' }],
    assemblies: [{ name: 'hg38' }, { name: 'mm39' }],
    tracks: [{ trackId: 'genes' }, { trackId: 'mine', name: 'session' }],
    defaultSession: { name: 'My session', views: [{ id: 'main' }] },
  })
})

test('a config and session with no tracks or assemblies still make a snapshot', () => {
  expect(toDesktopSnapshot({}, { name: 'Empty' })).toEqual({
    tracks: [],
    assemblies: [],
    defaultSession: { name: 'Empty' },
  })
})
