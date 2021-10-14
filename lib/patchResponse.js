import once from 'lodash/once.js'
import parseResponse from './parseResponse.js'

function patchResponse ({ factory, fetch, fetchArgs, res }) {
  res.api = once(async () => {
    if (!res._hydra) {
      await parseResponse({ factory, fetch, fetchArgs, res })
    }

    return res._hydra.api
  })

  res.resource = once(async () => {
    if (!res._hydra) {
      await parseResponse({ factory, fetch, fetchArgs, res })
    }

    return res._hydra.resource
  })

  if (res.dataset && res.quadStream) {
    res.dataset = once(res.dataset.bind(res))
  }
}

export default patchResponse
