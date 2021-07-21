import TermSet from '@rdfjs/term-set'
import clownface from 'clownface'

function distinct (ptr) {
  return [...new TermSet(ptr.terms)].map(term => clownface({ term, dataset: ptr.dataset, graph: ptr.graph }))
}

export default distinct
