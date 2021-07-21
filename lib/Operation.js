import clownface from 'clownface'

class Operation {
  constructor ({ fetch, object, property, resource, supportedOperation }) {
    this.fetch = fetch
    this.object = object
    this.property = property
    this.resource = clownface({ ...resource })
    this.supportedOperation = supportedOperation
  }

  get expects () {
    return this.supportedOperation.expects
  }

  get method () {
    return this.supportedOperation.method
  }

  get returns () {
    return this.supportedOperation.returns
  }

  get target () {
    return this.object || this.resource
  }

  async invoke (input) {
    const res = await this.fetch(this.target.value, {
      method: this.method,
      body: input
    })

    res.operation = this

    return res
  }
}

export default Operation
