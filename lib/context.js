const context = {
  ApiDocumentation: 'http://www.w3.org/ns/hydra/core#ApiDocumentation',
  Collection: 'http://www.w3.org/ns/hydra/core#Collection',
  comment: 'http://www.w3.org/2000/01/rdf-schema#comment',
  description: 'http://www.w3.org/ns/hydra/core#description',
  expects: 'http://www.w3.org/ns/hydra/core#expects',
  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  member: 'http://www.w3.org/ns/hydra/core#member',
  method: 'http://www.w3.org/ns/hydra/core#method',
  property: 'http://www.w3.org/ns/hydra/core#property',
  readonly: 'http://www.w3.org/ns/hydra/core#readonly',
  returns: 'http://www.w3.org/ns/hydra/core#returns',
  statusCode: 'http://www.w3.org/ns/hydra/core#statusCode',
  statusCodes: 'http://www.w3.org/ns/hydra/core#statusCodes',
  supportedClass: {
    '@id': 'http://www.w3.org/ns/hydra/core#supportedClass',
    '@array': true
  },
  supportedOperation: {
    '@id': 'http://www.w3.org/ns/hydra/core#supportedOperation',
    '@array': true
  },
  supportedProperty: {
    '@id': 'http://www.w3.org/ns/hydra/core#supportedProperty',
    '@array': true
  },
  title: 'http://www.w3.org/ns/hydra/core#title',
  type: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  writeonly: 'http://www.w3.org/ns/hydra/core#writeonly'
}

module.exports = context
