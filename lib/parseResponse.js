import clownface from 'clownface'
import Api from './Api.js'
import fetchAll from './fetchAll.js'
import * as ns from './namespaces.js'
import parseLinks from './parseLinks.js'
import { multiScore, scoreStatic, scoreTypes } from './score.js'
import setGraph from './setGraph.js'

async function parseResponse ({ factory, fetch, fetchArgs, res }) {
  const types = res.operation && [...res.operation.returns]
  const graph = factory.namedNode(res.headers.get('location') || res.url)
  const dataset = res.dataset ? setGraph({ dataset: await res.dataset(), factory, graph }) : factory.dataset()
  const resource = { dataset, graph }

  if (dataset.size > 0) {
    const score = multiScore([
      [scoreStatic(graph)],
      [scoreTypes(types), { offset: 2 }]
    ])

    resource.term = score({ dataset, graph }).ordered[0].term
  }

  const links = parseLinks({ factory, res })
  const apiLinks = links.get(ns.hydra.apiDocumentation) || []

  const documentation = clownface({
    dataset: await fetchAll({
      factory,
      fetch,
      fetchArgs: {
        credentials: fetchArgs.credentials
      },
      urls: apiLinks
    })
  })

  const api = new Api({
    fetch,
    fetchArgs,
    ptr: documentation,
    resource
  })

  res._hydra = {
    api,
    resource
  }
}

export default parseResponse
