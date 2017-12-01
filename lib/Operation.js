const byTypeFinder = require('simplerdf-iri-finder/byType')
const currentFinder = require('simplerdf-iri-finder/current')
const ns = require('./namespace')
const uriTemplate = require('uri-templates')
const url = require('url')

class Operation {
  static buildCall (hydraFetch, operation, simple) {
    return (input, options) => {
      options = options || {}
      options.method = operation.method.toLowerCase()
      options.context = options.context || (input && input.context()) || simple.context()

      if (operation.returns) {
        options.iriFinders = [currentFinder(), byTypeFinder(operation.returns.iri())]
      }

      let requestUrl = simple.iri().toString()

      if (operation.method.toLowerCase() === 'get') {
        requestUrl = url.resolve(requestUrl, Operation.buildSearchUrl(operation, input) || '')
      } else {
        options.body = input
      }

      return hydraFetch(requestUrl, options)
    }
  }

  static buildSearchUrl (operation, simple) {
    const apiClassIri = operation.graph().match(null, ns.supportedOperation, operation.iri()).toArray().map(t => t.subject).shift()
    const apiClass = operation.child(apiClassIri)

    if (!apiClass.search || !apiClass.search.mapping || !apiClass.search.template) {
      return
    }

    const variables = apiClass.search.mapping.reduce((variables, mapping) => {
      const matches = simple.graph().match(simple.iri(), mapping.property.iri())

      if (matches.length > 0) {
        variables[mapping.variable] = matches.toArray().map(t => t.object.value).join(',')
      }

      return variables
    }, {})

    return uriTemplate(apiClass.search.template).fill(variables)
  }
}

module.exports = Operation
