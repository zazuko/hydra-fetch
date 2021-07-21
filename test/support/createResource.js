import clownface from 'clownface'
import rdf from 'rdf-ext'
import * as ns from './namespaces.js'

function createResource ({ properties = [], term = ns.ex.subject, types = [ns.ex.Type1] } = {}) {
  const resource = clownface({ dataset: rdf.dataset(), term })

  for (const type of types) {
    resource.addOut(ns.rdf.type, type)
  }

  for (const { term, value } of properties) {
    resource.addOut(term, value)
  }

  return resource
}

export default createResource
