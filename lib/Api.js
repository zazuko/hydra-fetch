'use strict'

const context = require('./context')

class Api {
  static attachOperationsCalls (operations, simple, operationCallFactory) {
    operations.forEach((operation) => {
      let method = operation.method.toLowerCase()

      simple[method] = operationCallFactory(operation, simple)
    })
  }

  static attachPropertiesOperationsCalls (properties, simple, operationCallFactory) {
    properties.forEach((supportedProperty) => {
      let property = supportedProperty.property
      let simpleProperty = simple[property.iri()]

      if (simpleProperty && property.supportedOperation) {
        if (typeof simpleProperty === 'object' && typeof simpleProperty.forEach !== 'function') {
          Api.attachOperationsCalls(property.supportedOperation, simpleProperty, operationCallFactory)
        } else {
          simpleProperty.forEach((item) => {
            Api.attachOperationsCalls(property.supportedOperation, item, operationCallFactory)
          })
        }
      }
    })
  }

  static attachCalls (api, simple, operationCallFactory) {
    let supportedClasses = simple.graph().match(simple.iri(), context.type).map((triple) => {
      return api.child(triple.object)
    })

    supportedClasses.forEach((supportedClass) => {
      Api.attachOperationsCalls(supportedClass.supportedOperation, simple, operationCallFactory)
      Api.attachPropertiesOperationsCalls(supportedClass.supportedProperty, simple, operationCallFactory)
    })

    simple.graph().match(simple.iri()).map((triple) => {
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
