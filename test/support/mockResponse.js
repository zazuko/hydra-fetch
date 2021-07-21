import fetch from '@rdfjs/fetch'
import rdf from 'rdf-ext'
import * as ns from './namespaces.js'

const { Headers } = fetch

function mockResponse ({ api, dataset, location, url } = {}) {
  const headers = new Headers({ 'content-length': 1 })

  if (api) {
    api = Array.isArray(api) ? api : [api]

    headers.set('link', api.map(url => `<${url}>; rel="${ns.hydra.apiDocumentation.value}"`).join(', '))
  }

  if (location) {
    headers.set('location', location)
  }

  return {
    dataset: async () => rdf.dataset(dataset),
    headers,
    url: url || 'http://example.org/'
  }
}

export default mockResponse
