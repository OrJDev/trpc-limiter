import { defineOpts } from '../../tsup.config'

export default defineOpts({
  external: ['solid-js', 'solid-js/web', 'solid-start'],
})
