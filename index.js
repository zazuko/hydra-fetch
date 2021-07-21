import fetch from '@rdfjs/fetch'
import rdf from 'rdf-ext'
import isDataset from './lib/isDataset.js'
import patchResponse from './lib/patchResponse.js'

const { Headers } = fetch

async function hydraFetch (url, { factory = rdf, headers, body, ...options } = {}) {
  headers = new Headers(headers)

  if (body && isDataset(body)) {
    headers.set('content-type', 'text/turtle')
    body = body.toStream()
  }

  const res = await fetch(url, { headers, body, factory, ...options })

  patchResponse({ factory, fetch: hydraFetch, res })

  return res
}

export default hydraFetch
