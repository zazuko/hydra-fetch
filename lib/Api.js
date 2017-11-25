const context = require('./context')
const rdf = require('rdf-ext')

class Api {
  static attachOperationsCalls (operations, simple, operationCallFactory) {
    operations.forEach((operation) => {
      const method = operation.method.toLowerCase()

      simple[method] = operationCallFactory(operation, simple)
    })
  }

  static attachPropertiesOperationsCalls (properties, simple, operationCallFactory) {
    properties.forEach((supportedProperty) => {
      const property = supportedProperty.property
      const simpleProperty = simple[property.iri()]

      if (typeof simpleProperty === 'object' && property.supportedOperation) {
        if (typeof simpleProperty.forEach !== 'function') {
          Api.attachOperationsCalls(property.supportedOperation, simpleProperty, operationCallFactory)
        } else {
          simpleProperty.forEach((item) => {
            Api.attachOperationsCalls(property.supportedOperation, item, operationCallFactory)
          })
        }

        simple[property.iri()] = simpleProperty
      }
    })
  }

  static attachCalls (api, simple, operationCallFactory) {
    let supportedClasses = simple.graph().match(simple.iri(), rdf.namedNode(context.type)).toArray().map((triple) => {
      return api.child(triple.object)
    })

    supportedClasses.forEach((supportedClass) => {
      Api.attachOperationsCalls(supportedClass.supportedOperation, simple, operationCallFactory)
      Api.attachPropertiesOperationsCalls(supportedClass.supportedProperty, simple, operationCallFactory)
    })

    simple.graph().match(simple.iri()).toArray().map((triple) => {
      let child = simple[triple.predicate]

      if (typeof child === 'object' && typeof child.graph === 'function') {
        Api.attachCalls(api, child, operationCallFactory)
      }

      if (typeof child === 'object' && typeof child.forEach === 'function') {
        child.forEach((item) => {
          Api.attachCalls(api, item, operationCallFactory)
        })
      }
    })

    return simple
  }
}

module.exports = Api
