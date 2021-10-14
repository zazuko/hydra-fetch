import TermSet from '@rdfjs/term-set'
import clownface from 'clownface'
import * as ns from './namespaces.js'
import Operation from './Operation.js'
import Property from './Property.js'
import SupportedOperation from './SupportedOperation.js'
import SupportedProperty from './SupportedProperty.js'

function toArray (obj) {
  if (obj[Symbol.iterator]) {
    return [...obj]
  }

  return [obj]
}

function hasAny (ptrs, terms) {
  return toArray(terms).some(term => {
    return [...ptrs].some(ptr => ptr.term.equals(term))
  })
}

class Api {
  constructor ({ fetch, fetchArgs, ptr, resource }) {
    this.fetch = fetch
    this.fetchArgs = fetchArgs
    this.ptr = clownface({ ...ptr })
    this.resource = resource && clownface({ ...resource })
  }

  get types () {
    return new TermSet(this.resource.out(ns.rdf.type).terms)
  }

  get supportedOperations () {
    const supportedOperations = new Set()

    for (const type of this.types) {
      const supportedClass = this.ptr.node(type)

      supportedClass.out(ns.hydra.supportedOperation).forEach(supportedOperation => {
        supportedOperations.add(new SupportedOperation({ supportedOperation, type }))
      })
    }

    return supportedOperations
  }

  get operations () {
    const operations = new Set()

    for (const supportedOperation of this.supportedOperations) {
      operations.add(new Operation({
        fetch: this.fetch,
        fetchArgs: this.fetchArgs,
        resource: this.resource,
        supportedOperation
      }))
    }

    return operations
  }

  get supportedProperties () {
    const supportedProperties = new Set()

    for (const type of this.types) {
      const supportedClass = this.ptr.node(type)

      supportedClass.out(ns.hydra.supportedProperty).out(ns.hydra.property).forEach(property => {
        supportedProperties.add(new SupportedProperty({ property, type }))
      })
    }

    return supportedProperties
  }

  get properties () {
    const properties = new Set()

    for (const supportedProperty of this.supportedProperties) {
      this.resource.out(supportedProperty.property).forEach(object => {
        properties.add(new Property({ fetch: this.fetch, object, resource: this.resource, supportedProperty }))
      })
    }

    return properties
  }

  clone (term) {
    return new Api({
      fetch: this.fetch,
      ptr: this.ptr,
      resource: {
        term: term || this.resource.term,
        dataset: this.resource.dataset,
        graph: this.resource.graph
      }
    })
  }

  findOperation ({ expects, method, property, returns }) {
    const operations = this.findOperations({ expects, method, property, returns })

    if (operations.size === 1) {
      return [...operations][0]
    }

    return null
  }

  findOperations ({ expects, method, property, returns }) {
    const matches = operation => {
      if (method && operation.method !== method) {
        return false
      }

      if (expects && !hasAny(operation.expects, expects)) {
        return false
      }

      if (typeof property !== 'undefined') {
        if (property === null && operation.property) {
          return false
        }

        if (property && !property.equals(operation.property && operation.property.property)) {
          return false
        }
      }

      if (returns && !hasAny(operation.returns, returns)) {
        return false
      }

      return true
    }

    return new Set([
      ...[...this.operations].filter(matches),
      ...[...this.properties].flatMap(property => [...property.operations].filter(matches))
    ])
  }
}

export default Api
