const hydraFetch = require('..')
const rdf = require('rdf-ext')
const SimpleCore = require('simplerdf-core')
const SimpleFromJSON = require('simplerdf-fromjson')

const Simple = SimpleCore.extend(SimpleFromJSON)

const ns = {
  type: rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
}

// public service
// const baseUrl = 'http://wikidata.zazuko.com/'
// const baseSchema = baseUrl

// local hydra box example
// const baseUrl = 'http://localhost:9000/'
// const baseSchema = 'http://wikidata.zazuko.com/'

// local trifid example
const baseUrl = 'http://localhost:8080/'
const baseSchema = baseUrl

const start = baseUrl + 'api'
const apiClass = rdf.namedNode(baseSchema + 'api/schema/Spaceprobes')

function iriFinder (simple) {
  return simple.graph().match(null, ns.type, apiClass).toArray().map(t => t.subject)
}

hydraFetch(start, {
  iriFinders: [iriFinder]
}).then((res) => {
  const input = Simple.fromJSON({
    from: '2000',
    to: '2010'
  }, {
    from: baseSchema + 'api/schema/property/FROM',
    to: baseSchema + 'api/schema/property/TO'
  })

  return res.get(input)
}).then((res) => {
  console.log(res.graph().toString())
}).catch((err) => {
  console.error(err.stack)
})
