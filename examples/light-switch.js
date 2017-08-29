const hydraFetch = require('..')
const SimpleRDF = require('simplerdf-core')

let context = {
  LightSwitch: 'http://example.org/LightSwitch',
  Status: 'http://example.org/Status',
  label: 'http://www.w3.org/2000/01/rdf-schema#label',
  on: 'http://example.org/on',
  off: 'http://example.org/off',
  power: {
    '@id': 'http://example.org/power',
    '@type': '@id'
  },
  status: 'http://example.org/status',
  type: {
    '@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    '@type': '@id'
  }
}

function switchOnOff (status, onOff) {
  let newStatus = new SimpleRDF(context, status.iri())
  newStatus.power = newStatus.child(onOff)

  return status.put(newStatus)
}

hydraFetch('http://localhost:8080/', {context: context}).then((lightSwitch) => {
  console.log('label: ' + lightSwitch.label)

  return lightSwitch.status.get().then((status) => {
    console.log('current power status: ' + status.power)

    console.log('switch on')
    return switchOnOff(lightSwitch.status, context.on)
  }).then(() => {
    return lightSwitch.status.get()
  }).then((status) => {
    console.log('new power status: ' + status.power)

    console.log('switch off')
    return switchOnOff(lightSwitch.status, context.off)
  }).then(() => {
    return lightSwitch.status.get()
  }).then((status) => {
    console.log('new power status: ' + status.power)
  })
}).catch((err) => {
  console.error(err.stack || err.message)
})
