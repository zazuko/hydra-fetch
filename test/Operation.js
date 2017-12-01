/* global describe, it */

const assert = require('assert')
const context = require('../lib/context')
const Operation = require('../lib/Operation')
const SimpleCore = require('simplerdf-core')
const SimpleFromJSON = require('simplerdf-fromjson')

const Simple = SimpleCore.extend(SimpleFromJSON)

describe('Operation', () => {
  describe('buildCall', () => {
    it('should be a function', () => {
      assert.equal(typeof Operation.buildCall, 'function')
    })

    it('should return a function', () => {
      let operation = Operation.buildCall()

      assert.equal(typeof operation, 'function')
    })

    it('should use the given hydraFetch function', () => {
      let touched = false
      let fetch = () => {
        touched = true

        return Promise.resolve()
      }
      let simple = new Simple()

      Operation.buildCall(fetch, Simple.fromJSON({method: 'get'}, context), simple)()

      assert.equal(touched, true)
    })

    it('should use the given method', () => {
      let calledMethod = null
      let fetch = (url, options) => {
        calledMethod = options.method

        return Promise.resolve()
      }
      let simple = new Simple()

      Operation.buildCall(fetch, {method: 'post'}, simple)()

      assert.equal(calledMethod, 'post')
    })

    it('should use the IRI of the Simple object for the Fetch call', () => {
      let calledUrl = null
      let fetch = (url) => {
        calledUrl = url

        return Promise.resolve()
      }
      let simple = new Simple({}, 'http://example.org/subject')

      return Operation.buildCall(fetch, Simple.fromJSON({method: 'get'}, context), simple)().then(() => {
        assert.equal(calledUrl, 'http://example.org/subject')
      })
    })

    it('should use the context of the Simple object for the Fetch call', () => {
      let calledContext = null
      let fetch = (url, options) => {
        calledContext = options.context

        return Promise.resolve()
      }
      let simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')

      return Operation.buildCall(fetch, Simple.fromJSON({method: 'get'}, context), simple)().then(() => {
        assert.equal(typeof calledContext.description, 'function')
        assert.equal(calledContext.description('predicate').predicate, 'http://example.org/predicate')
      })
    })

    it('should use the given argument and assign it to body', () => {
      let calledBody = null
      let fetch = (url, options) => {
        calledBody = options.body

        return Promise.resolve()
      }
      let simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')
      const input = new Simple()

      return Operation.buildCall(fetch, Simple.fromJSON({method: 'post'}, context), simple)(input).then(() => {
        assert.equal(calledBody, input)
      })
    })

    it('should use buildSearchUrl to create the request URL for GET requests', () => {
      let requestUrl

      const fetch = (url) => {
        requestUrl = url

        return Promise.resolve()
      }

      const classIri = 'http://example.org/Class'
      const operationIri = 'http://example.org/operation/get'

      const api = {
        '@id': classIri,
        search: {
          template: '/api/{?from,to}',
          mapping: [{
            variable: 'from',
            property: {
              '@id': 'http://example.org/property/FROM'
            }
          }, {
            variable: 'to',
            property: {
              '@id': 'http://example.org/property/TO'
            }
          }]
        },
        supportedOperation: [{
          '@id': operationIri,
          method: 'GET'
        }]
      }

      const operation = Simple.fromJSON(api, context).child(operationIri)

      const simple = Simple.fromJSON({
        '@id': 'http://example.org/api/',
        '@type': classIri
      })

      const input = Simple.fromJSON({
        from: '2000',
        to: '2010'
      }, {
        from: 'http://example.org/property/FROM',
        to: 'http://example.org/property/TO'
      })

      return Operation.buildCall(fetch, operation, simple)(input).then(() => {
        assert.equal(requestUrl, 'http://example.org/api/?from=2000&to=2010')
      })
    })
  })

  describe('buildSearchUrl', () => {
    it('should be a function', () => {
      assert.equal(typeof Operation.buildSearchUrl, 'function')
    })

    it('should return undefined if no search property is given in the API', () => {
      const operation = new Simple()
      const input = new Simple()

      assert.equal(Operation.buildSearchUrl(operation, input), undefined)
    })

    it('should build a IRI based on the template and the input', () => {
      const classIri = 'http://example.org/Class'
      const operationIri = 'http://example.org/operation/get'

      const api = {
        '@id': classIri,
        search: {
          template: '/api/{?from,to}',
          mapping: [{
            variable: 'from',
            property: {
              '@id': 'http://example.org/property/FROM'
            }
          }, {
            variable: 'to',
            property: {
              '@id': 'http://example.org/property/TO'
            }
          }]
        },
        supportedOperation: [{
          '@id': operationIri,
          method: 'GET'
        }]
      }

      const operation = Simple.fromJSON(api, context).child(operationIri)

      const input = Simple.fromJSON({
        from: '2000',
        to: '2010'
      }, {
        from: 'http://example.org/property/FROM',
        to: 'http://example.org/property/TO'
      })

      const result = Operation.buildSearchUrl(operation, input)

      assert.equal(result, '/api/?from=2000&to=2010')
    })
  })
})
