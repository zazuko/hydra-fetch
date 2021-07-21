import { deepStrictEqual, strictEqual } from 'assert'
import TermSet from '@rdfjs/term-set'
import { describe, it } from 'mocha'
import Api from '../lib/Api.js'
import createApiPtr from './support/createApiPtr.js'
import createResource from './support/createResource.js'
import * as ns from './support/namespaces.js'
import termSetEquals from './support/termSetEquals.js'

describe('Api', () => {
  it('should be a constructor', () => {
    strictEqual(typeof Api, 'function')
  })

  it('should attach the given graph pointer to .ptr', () => {
    const ptr = createApiPtr()

    const api = new Api({ ptr })

    strictEqual(api.ptr.term.equals(ptr.term), true)
    strictEqual(api.ptr.dataset, ptr.dataset)
  })

  describe('.types', () => {
    it('should be an iterable property', () => {
      const ptr = createApiPtr()
      const types = [ns.ex.Type1, ns.ex.Type2]
      const resource = createResource({ types })

      const api = new Api({ ptr, resource })

      strictEqual(typeof api.types[Symbol.iterator], 'function')
    })

    it('should return the types from the given resource', () => {
      const ptr = createApiPtr()
      const types = [ns.ex.Type1, ns.ex.Type2]
      const resource = createResource({ types })

      const api = new Api({ ptr, resource })

      strictEqual(api.types.has(ns.ex.Type1), true)
      strictEqual(api.types.has(ns.ex.Type2), true)
    })
  })

  describe('.operations', () => {
    it('should be an iterable property', () => {
      const ptr = createApiPtr()
      const resource = createResource()

      const api = new Api({ ptr, resource })

      strictEqual(typeof api.operations[Symbol.iterator], 'function')
    })

    it('should return a Set of all operations', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }, {
            method: 'POST'
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'GET'
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const operations = api.operations

      strictEqual(operations.size, 2)
      deepStrictEqual([...operations].map(o => o.method).sort(), ['GET', 'POST'])
    })

    it('should forward the given resource', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const operations = api.operations
      const operationResource = [...operations][0].resource

      strictEqual(operationResource.term.equals(resource.term), true)
      strictEqual(operationResource.dataset.toCanonical(), resource.dataset.toCanonical())
    })

    it('should forward the given fetch', () => {
      const fetch = () => {}
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ fetch, ptr, resource })
      const operations = api.operations

      strictEqual([...operations][0].fetch, fetch)
    })
  })

  describe('.properties', () => {
    it('should be an iterable property', () => {
      const ptr = createApiPtr()
      const resource = createResource()

      const api = new Api({ ptr, resource })

      strictEqual(typeof api.properties[Symbol.iterator], 'function')
    })

    it('should return a Set of all properties', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          properties: [{
            term: ns.ex.property1,
            operations: [{
              method: 'GET'
            }]
          }, {
            term: ns.ex.property1,
            operations: [{
              method: 'POST'
            }]
          }, {
            term: ns.ex.property2,
            operations: [{
              method: 'DELETE'
            }]
          }]
        }, {
          term: ns.ex.Type2,
          properties: [{
            term: ns.ex.property3,
            operations: [{
              method: 'GET'
            }]
          }]
        }]
      })
      const resource = createResource({
        properties: [{
          term: ns.ex.property1,
          value: ns.ex.value1
        }, {
          term: ns.ex.property2,
          value: ns.ex.value2
        }]
      })

      const api = new Api({ ptr, resource })
      const properties = api.properties

      strictEqual(properties.size, 2)
      strictEqual([...properties].some(p => p.property.equals(ns.ex.property1)), true)
      strictEqual([...properties].some(p => p.property.equals(ns.ex.property2)), true)
      deepStrictEqual([...properties].flatMap(p => [...p.operations].map(o => o.method)).sort(), ['DELETE', 'GET', 'POST'])
    })

    it('should forward the given resource', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          properties: [{
            term: ns.ex.property1,
            operations: [{
              method: 'GET'
            }]
          }]
        }]
      })
      const resource = createResource({
        properties: [{
          term: ns.ex.property1,
          value: ns.ex.value1
        }]
      })

      const api = new Api({ ptr, resource })
      const properties = api.properties
      const propertyResource = [...properties][0].resource

      strictEqual(propertyResource.term.equals(resource.term), true)
      strictEqual(propertyResource.dataset.toCanonical(), resource.dataset.toCanonical())
    })

    it('should forward the given fetch', () => {
      const fetch = () => {}
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          properties: [{
            term: ns.ex.property1,
            operations: [{
              method: 'GET'
            }]
          }]
        }]
      })
      const resource = createResource({
        properties: [{
          term: ns.ex.property1,
          value: ns.ex.value1
        }]
      })

      const api = new Api({ fetch, ptr, resource })
      const properties = api.properties

      strictEqual([...properties][0].fetch, fetch)
    })
  })

  describe('.findOperation', () => {
    it('should be a method', () => {
      const ptr = createApiPtr()

      const api = new Api({ ptr })

      strictEqual(typeof api.findOperation, 'function')
    })

    it('should return null if no matching operation was found', () => {
      const resource = createResource()
      const ptr = createApiPtr()

      const api = new Api({ ptr, resource })
      const result = api.findOperation({})

      strictEqual(result, null)
    })

    it('should return the matching operation', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }, {
            method: 'POST',
            expects: [ns.ex.Type3, ns.ex.Type4]
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'POST',
            expects: [ns.ex.Type1]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperation({ expects: ns.ex.Type4 })

      strictEqual(result.method, 'POST')

      const expects = new TermSet([...result.expects].map(ptr => ptr.term))
      strictEqual(termSetEquals([ns.ex.Type3, ns.ex.Type4], expects), true)
    })

    it('should return null if multiple operations would match', () => {
      const resource = createResource()
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          properties: [{
            term: ns.ex.property1,
            operations: [{
              method: 'GET'
            }]
          }, {
            term: ns.ex.property1,
            operations: [{
              method: 'POST'
            }]
          }, {
            term: ns.ex.property2,
            operations: [{
              method: 'DELETE'
            }]
          }]
        }, {
          term: ns.ex.Type2,
          properties: [{
            term: ns.ex.property3,
            operations: [{
              method: 'GET'
            }]
          }]
        }]
      })

      const api = new Api({ ptr, resource })
      const result = api.findOperation({ property: ns.ex.property1 })

      strictEqual(result, null)
    })
  })

  describe('.findOperations', () => {
    it('should be a method', () => {
      const ptr = createApiPtr()

      const api = new Api({ ptr })

      strictEqual(typeof api.findOperations, 'function')
    })

    it('should return a Set', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET',
            returns: [ns.ex.Type1]
          }, {
            method: 'POST'
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'GET',
            returns: [ns.ex.Type2]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ method: 'GET' })

      strictEqual(result instanceof Set, true)
    })

    it('should return operations with a matching method', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET',
            returns: [ns.ex.Type1]
          }, {
            method: 'POST'
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'GET',
            returns: [ns.ex.Type2]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ method: 'GET' })

      strictEqual(result.size, 1)

      const returns = new TermSet([...[...result][0].returns].map(ptr => ptr.term))
      strictEqual(termSetEquals([ns.ex.Type1], returns), true)
    })

    it('should return operations with a matching expects', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }, {
            method: 'POST',
            expects: [ns.ex.Type3, ns.ex.Type4]
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'POST',
            expects: [ns.ex.Type1]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ expects: ns.ex.Type4 })

      strictEqual(result.size, 1)

      const expects = new TermSet([...[...result][0].expects].map(ptr => ptr.term))
      strictEqual(termSetEquals([ns.ex.Type3, ns.ex.Type4], expects), true)
    })

    it('should return operations matching at least one expects', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }, {
            method: 'POST',
            expects: [ns.ex.Type3]
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'POST',
            expects: [ns.ex.Type1]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ expects: [ns.ex.Type2, ns.ex.Type3] })

      strictEqual(result.size, 1)

      const expects = new TermSet([...[...result][0].expects].map(ptr => ptr.term))
      strictEqual(termSetEquals([ns.ex.Type3], expects), true)
    })

    it('should return operations with a matching property', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          properties: [{
            term: ns.ex.property1,
            operations: [{
              method: 'GET'
            }]
          }, {
            term: ns.ex.property1,
            operations: [{
              method: 'POST'
            }]
          }, {
            term: ns.ex.property2,
            operations: [{
              method: 'DELETE'
            }]
          }]
        }, {
          term: ns.ex.Type2,
          properties: [{
            term: ns.ex.property3,
            operations: [{
              method: 'GET'
            }]
          }]
        }]
      })
      const resource = createResource({
        properties: [{
          term: ns.ex.property1,
          value: ns.ex.value1
        }, {
          term: ns.ex.property2,
          value: ns.ex.value2
        }]
      })

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ property: ns.ex.property1 })

      strictEqual(result.size, 2)
      strictEqual([...result].some(o => o.property.property.equals(ns.ex.property1)), true)
      deepStrictEqual([...result].map(o => o.method).sort(), ['GET', 'POST'])
    })

    it('should return operations with a matching returns', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }, {
            method: 'POST',
            returns: [ns.ex.Type3, ns.ex.Type4]
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'POST',
            returns: [ns.ex.Type1]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ returns: ns.ex.Type4 })

      strictEqual(result.size, 1)

      const returns = new TermSet([...[...result][0].returns].map(ptr => ptr.term))
      strictEqual(termSetEquals([ns.ex.Type3, ns.ex.Type4], returns), true)
    })

    it('should return operations matching at least one returns', () => {
      const ptr = createApiPtr({
        types: [{
          term: ns.ex.Type1,
          operations: [{
            method: 'GET'
          }, {
            method: 'POST',
            returns: [ns.ex.Type3]
          }]
        }, {
          term: ns.ex.Type2,
          operations: [{
            method: 'POST',
            returns: [ns.ex.Type1]
          }]
        }]
      })
      const resource = createResource()

      const api = new Api({ ptr, resource })
      const result = api.findOperations({ returns: [ns.ex.Type2, ns.ex.Type3] })

      strictEqual(result.size, 1)

      const returns = new TermSet([...[...result][0].returns].map(ptr => ptr.term))
      strictEqual(termSetEquals([ns.ex.Type3], returns), true)
    })
  })
})
