import { strictEqual } from 'assert'
import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import parseLinks from '../lib/parseLinks.js'
import * as ns from './support/namespaces.js'

describe('parseLinks', () => {
  it('should be a function', () => {
    strictEqual(typeof parseLinks, 'function')
  })

  it('should return a TermMap', () => {
    const result = parseLinks({ factory: rdf, str: null })

    strictEqual(result instanceof TermMap, true)
  })

  it('should return an empty TermMap if the string is null', () => {
    const result = parseLinks({ factory: rdf, str: null })

    strictEqual(result.size, 0)
  })

  it('should parse the link header string', () => {
    const str = [
      `<${ns.ex.url1.value}>; rel="${ns.ex.rel1.value}"`,
      `<${ns.ex.url2.value}>; rel="${ns.ex.rel2.value}"`,
      `<${ns.ex.url3.value}>; rel="${ns.ex.rel1.value}"`
    ].join(', ')

    const result = parseLinks({ factory: rdf, str })

    strictEqual(result.size, 2)

    const rel1 = result.get(ns.ex.rel1)
    const rel2 = result.get(ns.ex.rel2)

    strictEqual(rel1 instanceof TermSet, true)
    strictEqual(rel1.size, 2)
    strictEqual(rel1.has(ns.ex.url1), true)
    strictEqual(rel1.has(ns.ex.url3), true)

    strictEqual(rel2 instanceof TermSet, true)
    strictEqual(rel2.size, 1)
    strictEqual(rel2.has(ns.ex.url2), true)
  })

  it('should ignore malformed links', () => {
    const str = [
      `<${ns.ex.url1.value}>; rel="${ns.ex.rel1.value}"`,
      `${ns.ex.url2.value}: rel="${ns.ex.rel2.value}"`
    ].join(', ')

    const result = parseLinks({ factory: rdf, str })

    strictEqual(result.size, 1)

    const rel1 = result.get(ns.ex.rel1)

    strictEqual(rel1.size, 1)
    strictEqual(rel1.has(ns.ex.url1), true)
  })

  it('should use response headers if no string is given', () => {
    const str = [
      `<${ns.ex.url1.value}>; rel="${ns.ex.rel1.value}"`,
      `<${ns.ex.url2.value}>; rel="${ns.ex.rel2.value}"`,
      `<${ns.ex.url3.value}>; rel="${ns.ex.rel1.value}"`
    ].join(', ')
    const res = { headers: new Map([['link', str]]) }

    const result = parseLinks({ factory: rdf, res })

    strictEqual(result.size, 2)

    const rel1 = result.get(ns.ex.rel1)
    const rel2 = result.get(ns.ex.rel2)

    strictEqual(rel1 instanceof TermSet, true)
    strictEqual(rel1.size, 2)
    strictEqual(rel1.has(ns.ex.url1), true)
    strictEqual(rel1.has(ns.ex.url3), true)

    strictEqual(rel2 instanceof TermSet, true)
    strictEqual(rel2.size, 1)
    strictEqual(rel2.has(ns.ex.url2), true)
  })
})
