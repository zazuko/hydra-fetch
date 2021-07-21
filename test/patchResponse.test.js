import { strictEqual } from 'assert'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import patchResponse from '../lib/patchResponse.js'
import mockResponse from './support/mockResponse.js'
import * as ns from './support/namespaces.js'

describe('patchResponse', () => {
  it('should be a function', () => {
    strictEqual(typeof patchResponse, 'function')
  })

  describe('.dataset', () => {
    it('should be a method', () => {
      const res = mockResponse()

      patchResponse({ res })

      strictEqual(typeof res.dataset, 'function')
    })

    it('should return the result of the wrapped .dataset() method', async () => {
      const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object1)
      const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object2)
      const res = mockResponse({
        dataset: [quad1, quad2]
      })

      patchResponse({ res })
      const result = await res.dataset()

      strictEqual(result.has(quad1), true)
      strictEqual(result.has(quad2), true)
    })

    it('should cache the result of the wrapped .dataset() method', async () => {
      const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object1)
      const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object2)
      const res = mockResponse({
        dataset: [quad1, quad2]
      })

      patchResponse({ res })
      await res.dataset()
      await res.dataset()
      const result = await res.dataset()

      strictEqual(result.has(quad1), true)
      strictEqual(result.has(quad2), true)
    })
  })

  describe('.resource', () => {
    it('should be a method', () => {
      const res = mockResponse()

      patchResponse({ factory: rdf, res })

      strictEqual(typeof res.resource, 'function')
    })

    it('should return a graph pointer with term undefined if the dataset is empty', async () => {
      const res = mockResponse()

      patchResponse({ factory: rdf, res })

      const resource = await res.resource()

      strictEqual(typeof resource.term, 'undefined')
      strictEqual(typeof resource.dataset, 'object')
      strictEqual(typeof resource.graph, 'object')
    })

    it('should return a graph pointer that contains the request URL as graph', async () => {
      const res = mockResponse()

      patchResponse({ factory: rdf, res })

      const resource = await res.resource()

      strictEqual(resource.graph.termType, 'NamedNode')
      strictEqual(resource.graph.value, res.url)
    })

    it('should return a graph pointer that contains the response dataset', async () => {
      const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object1)
      const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object2)
      const res = mockResponse({
        dataset: [quad1, quad2],
        url: quad1.subject.value
      })

      patchResponse({ factory: rdf, res })

      const resource = await res.resource()

      const graphQuad1 = rdf.quad(quad1.subject, quad1.predicate, quad1.object, resource.graph)
      const graphQuad2 = rdf.quad(quad2.subject, quad2.predicate, quad2.object, resource.graph)

      strictEqual(resource.dataset.has(graphQuad1), true)
      strictEqual(resource.dataset.has(graphQuad2), true)
    })

    it('should return a graph pointer that contains the root of the dataset as term', async () => {
      const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object1)
      const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object2)
      const res = mockResponse({
        dataset: [quad1, quad2],
        url: quad1.subject.value
      })

      patchResponse({ factory: rdf, res })

      const resource = await res.resource()

      strictEqual(resource.term.equals(quad1.subject), true)
    })
  })
})
