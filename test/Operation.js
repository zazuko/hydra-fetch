/* global describe, it */

const assert = require('assert')
const Operation = require('../lib/Operation')
const SimpleRDF = require('simplerdf')

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
      }
      let simple = new SimpleRDF()

      Operation.buildCall(fetch, {method: 'get'}, simple)()

      assert.equal(touched, true)
    })

    it('should use the given method', () => {
      let calledMethod = null
      let fetch = (url, options) => {
        calledMethod = options.method
      }
      let simple = new SimpleRDF()

      Operation.buildCall(fetch, {method: 'post'}, simple)()

      assert.equal(calledMethod, 'post')
    })

    it('should use the IRI of the SimpleRDF object for the Fetch call', () => {
      let calledUrl = null
      let fetch = (url) => {
        calledUrl = url

        return Promise.resolve()
      }
      let simple = new SimpleRDF({}, 'http://example.org/subject')

      return Operation.buildCall(fetch, {method: 'get'}, simple)().then(() => {
        assert.equal(calledUrl, 'http://example.org/subject')
      })
    })

    it('should use the context of the SimpleRDF object for the Fetch call', () => {
      let calledContext = null
      let fetch = (url, options) => {
        calledContext = options.context

        return Promise.resolve()
      }
      let simple = new SimpleRDF({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')

      return Operation.buildCall(fetch, {method: 'get'}, simple)().then(() => {
        assert.equal(typeof calledContext.description, 'function')
        assert.equal(calledContext.description('predicate').predicate, 'http://example.org/predicate')
      })
    })

    it('should use the context of the SimpleRDF object for the Fetch call', () => {
      let calledContext = null
      let fetch = (url, options) => {
        calledContext = options.context

        return Promise.resolve()
      }
      let simple = new SimpleRDF({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')

      return Operation.buildCall(fetch, {method: 'get'}, simple)().then(() => {
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
      let simple = new SimpleRDF({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')

      return Operation.buildCall(fetch, {method: 'get'}, simple)('test').then(() => {
        assert.equal(calledBody, 'test')
      })
    })
  })
})
