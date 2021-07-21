import Operation from './Operation.js'

class Property {
  constructor ({ fetch, object, resource, supportedProperty, type }) {
    this.fetch = fetch
    this.object = object
    this.resource = resource
    this.supportedProperty = supportedProperty
    this.type = type
  }

  get operations () {
    const operations = new Set()

    for (const supportedOperation of this.supportedOperations) {
      operations.add(new Operation({ fetch: this.fetch, object: this.object, property: this, resource: this.resource, supportedOperation }))
    }

    return operations
  }

  get property () {
    return this.supportedProperty.property
  }

  get supportedOperations () {
    return this.supportedProperty.supportedOperations
  }
}

export default Property
