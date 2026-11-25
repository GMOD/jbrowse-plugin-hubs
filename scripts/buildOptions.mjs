/**
 * The ESM bundle a JBrowse 5 host loads. core's `hostShim` binds every import
 * the host re-exports to the host's copy on `globalThis.JBrowseExports`, and
 * fails the build on a name the host does not serve. `pluginName` is the
 * config's plugins-entry name, quoted in the error a host lacking an export
 * throws.
 */
import { hostShim } from '@jbrowse/core/ReExports/hostShim'

export function buildOptions(shim = {}) {
  return {
    entryPoints: ['src/index.ts'],
    bundle: true,
    format: 'esm',
    metafile: true,
    plugins: [hostShim({ pluginName: 'Hubs', ...shim })],
  }
}
