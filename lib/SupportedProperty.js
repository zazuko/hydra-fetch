import clownface from 'clownface'
import * as ns from './namespaces.js'
import SupportedOperation from './SupportedOperation.js'

class SupportedProperty {
  constructor ({ property, type }) {
    this.ptr = clownface({ ...property })
    this.type = type
  }

  get property () {
    return this.ptr.term
  }

  get supportedOperations () {
    return new Set(this.ptr.out(ns.hydra.supportedOperation).map(supportedOperation => {
      return new SupportedOperation({ property: this.property, supportedOperation, type: this.type })
    }))
  }
}

export default SupportedProperty
