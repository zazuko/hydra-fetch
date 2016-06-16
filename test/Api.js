/* global describe, it */

'use strict'

const assert = require('assert')
// const context = require('../lib/context')
const Api = require('../lib/Api')
// const SimpleRDF = require('simplerdf/lite')

function operationCallFactory (value) {
  return function () {
    return value
  }
}

describe('Api', () => {
  describe('attachOperationsCalls', () => {
    it('should be a function', () => {
      assert.equal(typeof Api.attachOperationsCalls, 'function')
    })

    it('should use the lower case method as property', () => {
      let operations = [{method: 'GET'}]
      let simple = {}

      Api.attachOperationsCalls(operations, simple, operationCallFactory('test'))

      assert.notEqual(typeof simple.get, undefined)
    })

    it('should attach the result of the factory', () => {
      let operations = [{method: 'GET'}]
      let simple = {}

      Api.attachOperationsCalls(operations, simple, operationCallFactory('test'))

      assert.equal(simple.get, 'test')
    })

    it('should attach all operations', () => {
      let operations = [{method: 'GET'}, {method: 'POST'}]
      let simple = {}

      Api.attachOperationsCalls(operations, simple, operationCallFactory('test'))

      assert.equal(simple.get, 'test')
      assert.equal(simple.post, 'test')
    })
  })

  describe('attachPropertiesOperationsCalls', () => {
    it('should be a function', () => {
      assert.equal(typeof Api.attachPropertiesOperationsCalls, 'function')
    })

    it('should use .property.iri() to get the full namespace of the property', () => {
      let touched = false
      let properties = [{property: {
        iri: () => {
          touched = true

          return 'http://example.org/property'
        }
      }}]
      let simple = {}

      Api.attachPropertiesOperationsCalls(properties, simple, operationCallFactory('test'))

      assert.equal(touched, true)
    })

    it('should attach the operations in supportedOperation', () => {
      let properties = [{property: {
        iri: () => {
          return 'http://example.org/property'
        },
        supportedOperation: [{
          method: 'GET'
        }]
      }}]
      let simple = {
        'http://example.org/property': {}
      }

      Api.attachPropertiesOperationsCalls(properties, simple, operationCallFactory('test'))

      assert.equal(simple['http://example.org/property'].get, 'test')
    })
  })

  describe('attachCalls', () => {
    it('should be a function', () => {
      assert.equal(typeof Api.attachCalls, 'function')
    })

    /* it('should attach operations defined in API object', () => {
      let api = new SimpleRDF(context)
      let simple = new SimpleRDF({type: context.type}, 'http://example.org/subject')

      let supportedClass = api.child('http://example.org/Class')
      api.supportedClass.push(supportedClass)

      let supportedOperation = api.child()
      supportedOperation.method = 'GET'
      supportedClass.supportedOperation.push(supportedOperation)

      simple.type = 'http://example.org/Class'

      Api.attachCalls(api, simple, operationCallFactory('test'))

      console.log(simple)
    }) */
  })
})
