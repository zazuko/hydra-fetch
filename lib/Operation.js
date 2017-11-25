const byTypeFinder = require('simplerdf-iri-finder/byType')
const currentFinder = require('simplerdf-iri-finder/current')

class Operation {
  static buildCall (hydraFetch, operation, simple) {
    return (input, options) => {
      options = options || {}
      options.method = operation.method.toLowerCase()
      options.context = options.context || (input && input.context()) || simple.context()
      options.body = input

      if (operation.returns) {
        options.iriFinders = [currentFinder(), byTypeFinder(operation.returns.iri())]
      }

      return hydraFetch(simple.iri().toString(), options)
    }
  }
}

module.exports = Operation
