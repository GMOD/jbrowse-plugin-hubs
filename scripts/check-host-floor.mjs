/**
 * Builds the bundle against what the oldest supported host serves, so an
 * import only a newer JBrowse provides fails here rather than as a throw in a
 * reader's browser.
 */
import { fetchHostNames } from '@jbrowse/core/ReExports/hostShim'
import * as esbuild from 'esbuild'

import { buildOptions } from './buildOptions.mjs'
import { FLOOR } from './hosts.mjs'

const names = await fetchHostNames(FLOOR)
try {
  await esbuild.build({
    ...buildOptions({ names, host: FLOOR }),
    write: false,
    logLevel: 'silent',
  })
  console.log(`builds against ${FLOOR}`)
} catch (error) {
  if (error instanceof Error && 'errors' in error) {
    for (const { text, location } of error.errors) {
      console.error(
        location ? `${location.file}:${location.line}: ${text}` : text,
      )
    }
    console.error(
      `The bundle imports what ${FLOOR} does not serve. Drop the import, or raise FLOOR and say which hosts lose the plugin.`,
    )
    process.exit(1)
  } else {
    throw error
  }
}
