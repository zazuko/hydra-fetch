import { strictEqual } from 'assert'
import rdfHandler from '@rdfjs/express-handler'
import fetch from '@rdfjs/fetch'
import withServer from 'express-as-promise/withServer.js'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import fetchAll from '../lib/fetchAll.js'
import isDataset from '../lib/isDataset.js'
import * as ns from './support/namespaces.js'

describe('fetchAll', () => {
  it('should be a function', () => {
    strictEqual(typeof fetchAll, 'function')
  })

  it('should return a Dataset', async () => {
    const result = await fetchAll({ factory: rdf, fetch, urls: [] })

    strictEqual(isDataset(result), true)
  })

  it('should fetch quads from all urls and combine it', async () => {
    await withServer(async server => {
      server.app.get('/1', rdfHandler(), (req, res) => {
        res.dataset(dataset1)
      })

      server.app.get('/2', rdfHandler(), (req, res) => {
        res.dataset(dataset2)
      })

      const baseUrl = await server.listen()

      const subject1 = rdf.namedNode(new URL('/1', baseUrl))
      const dataset1 = rdf.dataset([
        rdf.quad(subject1, ns.ex.predicate, rdf.literal('1'), subject1)
      ])

      const subject2 = rdf.namedNode(new URL('/2', baseUrl))
      const dataset2 = rdf.dataset([
        rdf.quad(subject2, ns.ex.predicate, rdf.literal('2'), subject2)
      ])

      const combined = rdf.dataset().addAll(dataset1).addAll(dataset2)
      const urls = [subject1.value, subject2.value]

      const result = await fetchAll({ factory: rdf, fetch, urls })

      strictEqual(result.toCanonical(), combined.toCanonical())
    })
  })
})
