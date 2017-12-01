const rdf = require('rdf-ext')

const ns = {
  supportedOperation: rdf.namedNode('http://www.w3.org/ns/hydra/core#supportedOperation'),
  type: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

module.exports = ns
