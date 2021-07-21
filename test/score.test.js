import { strictEqual } from 'assert'
import TermSet from '@rdfjs/term-set'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { multiScore, scoreOutgoing, scoreStatic, scoreTypes, Scorings } from '../lib/score.js'
import * as ns from './support/namespaces.js'

describe('score', () => {
  describe('multiScore', () => {
    it('should be a function', () => {
      strictEqual(typeof multiScore, 'function')
    })

    // TODO:
  })

  describe('scoreOutgoing', () => {
    it('should be a function', () => {
      strictEqual(typeof scoreOutgoing, 'function')
    })

    it('should return Scorings', () => {
      const result = scoreOutgoing({ dataset: rdf.dataset() })

      strictEqual(result instanceof Scorings, true)
    })

    it('should score subjects with more outgoing links higher', () => {
      const dataset = rdf.dataset([
        rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object1),
        rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object2),
        rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object3),
        rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object4)
      ])

      const result = scoreOutgoing({ dataset }).ordered

      strictEqual(result.length, 2)
      strictEqual(result[0].dataset, dataset)
      strictEqual(result[0].term.equals(ns.ex.subject2), true)
      strictEqual(result[0].score, 0.75)
      strictEqual(result[1].dataset, dataset)
      strictEqual(result[1].term.equals(ns.ex.subject1), true)
      strictEqual(result[1].score, 0.25)
    })

    it('should return an empty scoring of the dataset is empty', () => {
      const dataset = rdf.dataset()

      const result = scoreOutgoing({ dataset }).ordered

      strictEqual(result.length, 0)
    })
  })

  describe('scoreStatic', () => {
    it('should be a factory function', () => {
      strictEqual(typeof scoreStatic, 'function')
    })

    it('should build a score function', () => {
      const score = scoreStatic(ns.ex.subject)

      strictEqual(typeof score, 'function')
      strictEqual(score.length, 1)
    })

    it('should return Scorings', () => {
      const score = scoreStatic(ns.ex.subject1)

      const result = score({ dataset: rdf.dataset() })

      strictEqual(result instanceof Scorings, true)
    })

    it('should return a static scoring for the given term', () => {
      const dataset = rdf.dataset([
        rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object1),
        rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object2)
      ])
      const term = ns.ex.subject2
      const score = scoreStatic(term)

      const result = score({ dataset })

      strictEqual(result.length, 1)
      strictEqual(result[0].dataset, dataset)
      strictEqual(result[0].term.equals(term), true)
      strictEqual(result[0].score, 1)
    })

    it('should generate an empty scoring if the subject is not used in the dataset', () => {
      const dataset = rdf.dataset([
        rdf.quad(ns.ex.subject1, ns.ex.predicate, ns.ex.object1),
        rdf.quad(ns.ex.subject2, ns.ex.predicate, ns.ex.object2)
      ])
      const term = ns.ex.subject3
      const score = scoreStatic(term)

      const result = score({ dataset })

      strictEqual(result.length, 0)
    })
  })

  describe('scoreTypes', () => {
    it('should be a function', () => {
      strictEqual(typeof scoreTypes, 'function')
    })

    it('should build a score function', () => {
      const score = scoreTypes([ns.ex.Type])

      strictEqual(typeof score, 'function')
      strictEqual(score.length, 1)
    })

    it('should return Scorings', () => {
      const score = scoreTypes([ns.ex.Type])

      const result = score({ dataset: rdf.dataset() })

      strictEqual(result instanceof Scorings, true)
    })

    it('should score subjects with a matching type with 1', () => {
      const dataset = rdf.dataset([
        rdf.quad(ns.ex.subject1, ns.rdf.type, ns.ex.Type1),
        rdf.quad(ns.ex.subject2, ns.rdf.type, ns.ex.Type2),
        rdf.quad(ns.ex.subject3, ns.rdf.type, ns.ex.Type3)
      ])
      const score = scoreTypes([ns.ex.Type1, ns.ex.Type3])

      const result = score({ dataset })

      strictEqual(result.length, 2)
      strictEqual(result[0].dataset, dataset)
      strictEqual(result[0].score, 1)

      const terms = new TermSet(result.map(({ term }) => term))
      strictEqual(terms.has(ns.ex.subject1), true)
      strictEqual(terms.has(ns.ex.subject3), true)
    })

    it('should return an empty scoring of there are no matching types', () => {
      const dataset = rdf.dataset([
        rdf.quad(ns.ex.subject1, ns.rdf.type, ns.ex.Type1),
        rdf.quad(ns.ex.subject2, ns.rdf.type, ns.ex.Type2),
        rdf.quad(ns.ex.subject3, ns.rdf.type, ns.ex.Type3)
      ])
      const score = scoreTypes([ns.ex.Type4, ns.ex.Type5])

      const result = score({ dataset })

      strictEqual(result.length, 0)
    })
  })

  describe('Scorings', () => {
    it('should be a constructor', () => {
      strictEqual(typeof Scorings, 'function')
    })

    // TODO:
  })
})
