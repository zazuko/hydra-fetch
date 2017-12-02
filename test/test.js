/* global describe, it */

const assert = require('assert')
const context = require('../lib/context')
const hydraFetch = require('..')
const merge = require('lodash/merge')
const nock = require('nock')
const SimpleCore = require('simplerdf-core')
const SimpleFromJSON = require('simplerdf-fromjson')

const Simple = SimpleCore.extend(SimpleFromJSON)

describe('hydra-fetch', () => {
  it('should fetch from the given URL', () => {
    const key = 'fetch'

    let touched = false

    nock('http://example.org').get('/' + key + '-resource').reply(() => {
      touched = true

      return [204, '', {
        'content-type': 'application/ld+json'
      }]
    })

    return hydraFetch('http://example.org/fetch-resource').then(() => {
      assert(touched)
    })
  })

  it('should fetch the API documentation from the given link header', () => {
    const key = 'fetch-api'

    let touched = false

    nock('http://example.org').get('/' + key + '-resource').reply(200, '{}', {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    nock('http://example.org').get('/' + key + '-api').reply(() => {
      touched = true

      return [200, '{}', {
        'content-type': 'application/ld+json',
        link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
      }]
    })

    return hydraFetch('http://example.org/fetch-api-resource').then(() => {
      assert(touched)
    })
  })

  it('should attach the class methods defined in the API documentation', () => {
    const key = 'attach-class-methods'

    const resource = {
      '@context': context,
      '@id': 'http://example.org/' + key + '-resource',
      '@type': 'http://example.org/Custom',
      'http://example.org/predicate': 'test'
    }

    const api = {
      '@context': context,
      '@id': 'http://example.org/Custom',
      supportedOperation: [{
        method: 'GET',
        returns: {
          '@id': 'http://example.org/Custom'
        }
      }, {
        method: 'POST',
        expects: {
          '@id': 'http://example.org/Custom'
        },
        returns: {
          '@id': 'http://example.org/Custom'
        }
      }]
    }

    nock('http://example.org').get('/' + key + '-resource').reply(200, resource, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    nock('http://example.org').get('/' + key + '-api').reply(200, api, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    return hydraFetch('http://example.org/' + key + '-resource', {
      context: context
    }).then((result) => {
      assert.equal(typeof result.get, 'function')
      assert.equal(typeof result.post, 'function')
    })
  })

  it('should use fetch call operation', () => {
    const key = 'call-op'

    const customContext = merge(context, {
      customProperty: 'http://example.org/custom-property'
    })

    const resource = {
      '@context': context,
      '@id': 'http://example.org/' + key + '-resource',
      '@type': 'http://example.org/Custom',
      'http://example.org/predicate': 'test'
    }

    const input = Simple.fromJSON({
      '@type': 'http://example.org/Custom',
      'customProperty': 'input'
    }, customContext)

    const output = {
      '@context': customContext,
      '@type': 'http://example.org/Custom',
      'customProperty': 'output'
    }

    const api = {
      '@context': context,
      '@id': 'http://example.org/Custom',
      supportedOperation: [{
        method: 'POST',
        expects: {
          '@id': 'http://example.org/Custom'
        },
        returns: {
          '@id': 'http://example.org/Custom'
        }
      }]
    }

    nock('http://example.org').get('/' + key + '-resource').reply(200, JSON.stringify(resource), {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    nock('http://example.org').post('/' + key + '-resource').reply(function (url, body) {
      assert(JSON.parse(body).filter((t) => {
        return t['@graph']['http://example.org/custom-property'] &&
          t['@graph']['http://example.org/custom-property'] === 'input'
      }))

      return [200, JSON.stringify(output), {
        'content-type': 'application/ld+json',
        link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
      }]
    })

    for (let i = 0; i < 2; i++) {
      nock('http://example.org').get('/' + key + '-api').reply(200, api, {
        'content-type': 'application/ld+json',
        link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
      })
    }

    return hydraFetch('http://example.org/' + key + '-resource', {
      context: customContext
    }).then((result) => {
      return result.post(input)
    }).then((result) => {
      assert.equal(result.customProperty, 'output')
    })
  })

  it('should attach the property methods defined in the API documentation', () => {
    const key = 'attach-property-methods'

    const customContext = merge(context, {
      customProperty: 'http://example.org/custom-property'
    })

    const resource = {
      '@context': customContext,
      '@id': 'http://example.org/',
      '@type': 'http://example.org/Custom',
      'http://example.org/custom-property': {
        '@id': 'http://example.org/custom-resource'
      }
    }

    const api = {
      '@context': context,
      '@id': 'http://example.org/Custom',
      supportedProperty: [{
        property: {
          '@id': 'http://example.org/custom-property',
          supportedOperation: [{
            method: 'GET',
            returns: {
              '@id': 'http://example.org/Custom'
            }
          }, {
            method: 'POST',
            expects: {
              '@id': 'http://example.org/Custom'
            },
            returns: {
              '@id': 'http://example.org/Custom'
            }
          }]
        }
      }]
    }

    nock('http://example.org').get('/' + key + '-resource').reply(200, resource, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    nock('http://example.org').get('/' + key + '-api').reply(200, api, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    return hydraFetch('http://example.org/' + key + '-resource', {
      context: context
    }).then((result) => {
      assert.equal(typeof result.customProperty.get, 'function')
      assert.equal(typeof result.customProperty.post, 'function')
    })
  })

  it('should return API class documentation with .api', () => {
    const key = 'api-class-interface'

    const resource = {
      '@context': context,
      '@id': 'http://example.org/' + key + '-resource',
      '@type': 'http://example.org/Custom',
      'http://example.org/predicate': 'test'
    }

    const api = {
      '@context': context,
      '@id': 'http://example.org/Custom',
      supportedOperation: [{
        method: 'GET',
        returns: {
          '@id': 'http://example.org/Custom'
        }
      }, {
        method: 'POST',
        expects: {
          '@id': 'http://example.org/Custom'
        },
        returns: {
          '@id': 'http://example.org/Custom'
        }
      }]
    }

    nock('http://example.org').get('/' + key + '-resource').reply(200, resource, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    nock('http://example.org').get('/' + key + '-api').reply(200, api, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    return hydraFetch('http://example.org/' + key + '-resource', {
      context: context
    }).then((result) => {
      assert.equal(typeof result.api, 'function')
      assert.equal(result.api().iri(), 'http://example.org/Custom')
      assert.equal(result.api().supportedOperation.length, 2)
    })
  })

  it('should return API documentation with .api if no linked class was found', () => {
    const key = 'api-documentation-interface'

    const resource = {}

    const api = {
      '@context': context,
      '@id': 'http://example.org/api',
      '@type': 'http://www.w3.org/ns/hydra/core#ApiDocumentation',
      supportedClass: [{
        '@id': 'http://example.org/Custom'
      }]
    }

    nock('http://example.org').get('/' + key + '-resource').reply(200, resource, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    nock('http://example.org').get('/' + key + '-api').reply(200, api, {
      'content-type': 'application/ld+json',
      link: '<http://example.org/' + key + '-api>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"'
    })

    return hydraFetch('http://example.org/' + key + '-resource', {
      context: context
    }).then((result) => {
      assert.equal(typeof result.api, 'function')
      assert.equal(result.api().iri(), 'http://example.org/api')
      assert.equal(result.api().supportedClass.length, 1)
    })
  })
})
