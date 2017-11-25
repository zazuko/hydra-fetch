/* global describe, it */

const assert = require('assert')
const Operation = require('../lib/Operation')
const Simple = require('simplerdf-core')

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

      Operation.buildCall(fetch, {method: 'get'}, simple)()

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

      return Operation.buildCall(fetch, {method: 'get'}, simple)().then(() => {
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

      return Operation.buildCall(fetch, {method: 'get'}, simple)().then(() => {
        assert.equal(typeof calledContext.description, 'function')
        assert.equal(calledContext.description('predicate').predicate, 'http://example.org/predicate')
      })
    })

    it('should use the context of the Simple object for the Fetch call', () => {
      let calledContext = null

      const fetch = (url, options) => {
        calledContext = options.context

        return Promise.resolve()
      }

      const simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')

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
      let simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')
      const input = new Simple()

      return Operation.buildCall(fetch, {method: 'get'}, simple)(input).then(() => {
        assert.equal(calledBody, input)
      })
    })
  })
})
