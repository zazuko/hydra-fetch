import { strictEqual } from 'assert'
import rdfHandler from '@rdfjs/express-handler'
import fetch from '@rdfjs/fetch'
import withServer from 'express-as-promise/withServer.js'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import parseResponse from '../lib/parseResponse.js'
import mockResponse from './support/mockResponse.js'
import * as ns from './support/namespaces.js'

describe('parseResponse', () => {
  it('should be a function', () => {
    strictEqual(typeof parseResponse, 'function')
  })

  it('should attach the result as an object to res._hydra', async () => {
    const res = mockResponse()

    await parseResponse({ factory: rdf, res })

    strictEqual(typeof res._hydra, 'object')
  })

  describe('resource', () => {
    it('should return a graph pointer with term undefined if the dataset is empty', async () => {
      const res = mockResponse()

      await parseResponse({ factory: rdf, res })

      const resource = res._hydra.resource

      strictEqual(typeof resource.term, 'undefined')
      strictEqual(typeof resource.dataset, 'object')
      strictEqual(typeof resource.graph, 'object')
    })

    it('should return a graph pointer that contains the request URL as graph', async () => {
      const res = mockResponse()

      await parseResponse({ factory: rdf, res })

      const resource = res._hydra.resource

      strictEqual(resource.graph.termType, 'NamedNode')
      strictEqual(resource.graph.value, res.url)
    })

    it('should return a graph pointer that contains the response location header URL as graph', async () => {
      const res = mockResponse({ location: ns.ex.location.value })

      await parseResponse({ factory: rdf, res })

      const resource = res._hydra.resource

      strictEqual(resource.graph.termType, 'NamedNode')
      strictEqual(resource.graph.value, ns.ex.location.value)
    })

    it('should return a graph pointer that contains the response dataset', async () => {
      const quad1 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object1)
      const quad2 = rdf.quad(ns.ex.subject, ns.ex.predicate, ns.ex.object2)
      const res = mockResponse({
        dataset: [quad1, quad2],
        url: quad1.subject.value
      })

      await parseResponse({ factory: rdf, res })

      const resource = res._hydra.resource

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

      await parseResponse({ factory: rdf, res })

      const resource = res._hydra.resource

      strictEqual(resource.term.equals(quad1.subject), true)
    })
  })

  describe('api', () => {
    it('should be an API object', async () => {
      // TODO
    })

    // TODO
    it('should contain data from all links', async () => {
      await withServer(async server => {
        const quad1 = rdf.quad(ns.ex.subject1, ns.ex.predicate, rdf.literal('1'))
        const quad2 = rdf.quad(ns.ex.subject2, ns.ex.predicate, rdf.literal('2'))

        server.app.get('/1', rdfHandler(), (req, res) => {
          res.dataset(rdf.dataset([quad1]))
        })

        server.app.get('/2', rdfHandler(), (req, res) => {
          res.dataset(rdf.dataset([quad2]))
        })

        const baseUrl = await server.listen()

        // const combined = rdf.dataset().addAll(dataset1).addAll(dataset2)

        const res = mockResponse({
          api: [new URL('/1', baseUrl), new URL('/2', baseUrl)]
        })

        await parseResponse({ factory: rdf, fetch, res })

        // const resource = res._hydra.resource

        // strictEqual(resource.term.equals(quad1.subject), true)
      })
    })
  })
})
