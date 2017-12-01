const context = {
  ApiDocumentation: 'http://www.w3.org/ns/hydra/core#ApiDocumentation',
  Collection: 'http://www.w3.org/ns/hydra/core#Collection',
  comment: 'http://www.w3.org/2000/01/rdf-schema#comment',
  description: 'http://www.w3.org/ns/hydra/core#description',
  expects: 'http://www.w3.org/ns/hydra/core#expects',
  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  mapping: {
    '@id': 'http://www.w3.org/ns/hydra/core#mapping',
    '@container': '@set'
  },
  member: 'http://www.w3.org/ns/hydra/core#member',
  method: 'http://www.w3.org/ns/hydra/core#method',
  property: 'http://www.w3.org/ns/hydra/core#property',
  readonly: 'http://www.w3.org/ns/hydra/core#readonly',
  returns: 'http://www.w3.org/ns/hydra/core#returns',
  search: 'http://www.w3.org/ns/hydra/core#search',
  statusCode: 'http://www.w3.org/ns/hydra/core#statusCode',
  statusCodes: 'http://www.w3.org/ns/hydra/core#statusCodes',
  supportedClass: {
    '@id': 'http://www.w3.org/ns/hydra/core#supportedClass',
    '@container': '@set'
  },
  supportedOperation: {
    '@id': 'http://www.w3.org/ns/hydra/core#supportedOperation',
    '@container': '@set'
  },
  supportedProperty: {
    '@id': 'http://www.w3.org/ns/hydra/core#supportedProperty',
    '@container': '@set'
  },
  template: 'http://www.w3.org/ns/hydra/core#template',
  title: 'http://www.w3.org/ns/hydra/core#title',
  type: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  variable: 'http://www.w3.org/ns/hydra/core#variable',
  variableRepresentation: 'http://www.w3.org/ns/hydra/core#variableRepresentation',
  writeonly: 'http://www.w3.org/ns/hydra/core#writeonly'
}

module.exports = context
