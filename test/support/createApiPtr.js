import TermSet from '@rdfjs/term-set'
import clownface from 'clownface'
import rdf from 'rdf-ext'
import * as ns from './namespaces.js'

function createOperation ({ expects = [], method, ptr, returns = [] }) {
  ptr.addOut(ns.hydra.supportedOperation, supportedOperation => {
    for (const type of expects) {
      supportedOperation.addOut(ns.hydra.expects, type)
    }

    if (method) {
      supportedOperation.addOut(ns.hydra.method, method)
    }

    for (const type of returns) {
      supportedOperation.addOut(ns.hydra.returns, type)
    }
  })
}

function createOperations ({ operations, ptr }) {
  for (const operation of operations) {
    createOperation({ ...operation, ptr })
  }
}

function createApiPtr ({ term = ns.ex.api, types = [] } = {}) {
  const ptr = clownface({ dataset: rdf.dataset(), term })

  for (const { operations = [], properties = [], term } of types) {
    createOperations({ operations, ptr: ptr.node(term) })

    for (const { operations, term: property } of properties) {
      createOperations({ operations, ptr: ptr.node(property) })
    }

    for (const property of new TermSet([...properties].map(p => p.term))) {
      ptr.node(term).addOut(ns.hydra.supportedProperty, supportedProperty => {
        supportedProperty.addOut(ns.hydra.property, property)
      })
    }
  }

  return ptr
}

export default createApiPtr
