/* global describe, it */

const assert = require('assert')
const ApiHeader = require('../lib/ApiHeader')

function buildResponse (headers) {
  return {
    headers: {
      get: (key) => {
        return headers[key]
      }
    }
  }
}

describe('ApiHeader', () => {
  describe('parseLinkHeader', () => {
    it('should be a function', () => {
      assert.equal(typeof ApiHeader.parseLinkHeader, 'function')
    })

    it('should return an object with url and properties properties', () => {
      let result = ApiHeader.parseLinkHeader('')

      assert.equal(typeof result, 'object')
      assert.equal(typeof result.url, 'string')
      assert.equal(typeof result.properties, 'object')
    })

    it('should parse the rel property and trim quotes', () => {
      let result = ApiHeader.parseLinkHeader('</api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"')

      assert.equal(result.properties.rel, 'http://www.w3.org/ns/hydra/core#apiDocumentation')
    })

    it('should parse the url and trim angle brackets', () => {
      let result = ApiHeader.parseLinkHeader('</api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"')

      assert.equal(result.url, '/api')
    })
  })

  describe('parseResponse', () => {
    it('should evaluate the link headers', () => {
      let touched = false

      const res = {
        headers: {
          get: () => {
            touched = true

            return ''
          }
        }
      }

      ApiHeader.parseResponse(res)

      assert.equal(touched, true)
    })

    it('should ignore other properties', () => {
      const res = buildResponse({link: '</api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"; title="title"'})

      assert.equal(ApiHeader.parseResponse(res), '/api')
    })

    it('should return undefined if there is no link header', () => {
      const res = buildResponse({})

      assert.equal(ApiHeader.parseResponse(res), undefined)
    })

    it('should return undefined if there is no hydra#apiDocumentation link header', () => {
      const res = buildResponse({
        link: '<example.css>; rel="stylesheet"; title="example"'
      })

      assert.equal(ApiHeader.parseResponse(res), undefined)
    })

    it('should return the hydra#apiDocumentation link header', () => {
      const res = buildResponse({link: [
        '</context>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"',
        '</api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"; title="title"'
      ].join(', ')})

      assert.equal(ApiHeader.parseResponse(res), '/api')
    })
  })
})
