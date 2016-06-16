'use strict'

class Operation {
  static buildCall (hydraFetch, operation, simple) {
    return (body) => {
      return hydraFetch(simple.iri().toString(), {
        method: operation.method.toLowerCase(),
        context: simple.context(),
        body: body
      })
    }
  }
}

module.exports = Operation
