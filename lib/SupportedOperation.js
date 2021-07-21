import clownface from 'clownface'
import distinct from './distinct.js'
import * as ns from './namespaces.js'

class SupportedOperation {
  constructor ({ property, supportedOperation, type }) {
    this.ptr = clownface({ ...supportedOperation })
    this.property = property
    this.type = type
  }

  get expects () {
    return new Set(distinct(this.ptr.out(ns.hydra.expects)))
  }

  get method () {
    return this.ptr.out(ns.hydra.method).value
  }

  get returns () {
    return new Set(distinct(this.ptr.out(ns.hydra.returns)))
  }
}

export default SupportedOperation
