import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import * as ns from './namespaces.js'

function multiScore (callbacks) {
  return ({ dataset, graph, term }) => {
    return new Scorings(...callbacks.flatMap(([map, { factor = 1, offset = 0 } = {}]) => {
      return (new Scorings(...map({ dataset, graph, term }))).map(({ score, ...others }) => {
        return { ...others, score: score * factor + offset }
      })
    }))
  }
}

function scoreOutgoing ({ dataset, graph, term }) {
  const matches = dataset.match(term, null, null, graph)
  const terms = new TermMap()

  for (const quad of matches) {
    let meta = { count: 0 }

    if (terms.has(quad.subject)) {
      meta = terms.get(quad.subject)
    } else {
      terms.set(quad.subject, meta)
    }

    meta.count++
  }

  const scores = new Scorings()

  for (const [term, meta] of terms) {
    scores.push({ dataset, graph, term, score: meta.count / matches.size })
  }

  return scores
}

function scoreStatic (staticTerm) {
  return ({ dataset, graph, term }) => {
    if ((!term || term.equals(staticTerm)) && dataset.match(staticTerm).length >= 1) {
      return new Scorings({ dataset, graph, term: staticTerm, score: 1 })
    }

    return new Scorings()
  }
}

function scoreTypes (types) {
  return ({ dataset, graph, term }) => {
    const terms = new TermSet()

    for (const type of (types || [])) {
      for (const quad of dataset.match(term, ns.rdf.type, type, graph)) {
        terms.add(quad.subject)
      }
    }

    const scores = new Scorings()

    for (const term of terms) {
      scores.push({ dataset, graph, term, score: 1 })
    }

    return scores
  }
}

class Scorings extends Array {
  get ordered () {
    return new Scorings(...this.sort((a, b) => b.score - a.score))
  }
}

export {
  multiScore,
  scoreOutgoing,
  scoreStatic,
  scoreTypes,
  Scorings
}
