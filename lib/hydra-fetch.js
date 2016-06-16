'use strict'

const hydraContext = require('./context')
const simpleFetch = require('simplerdf-fetch')
const url = require('url')
const Api = require('./Api')
const ApiHeader = require('./ApiHeader')
const Operation = require('./Operation')

function hydraApiFetch (apiUrl) {
  return simpleFetch(apiUrl, {context: hydraContext}).then((res) => {
    return res.simple
  })
}

function hydraFetch (reqUrl, options) {
  options = options || {}

  let simpleFetch = options.simpleFetch || hydraFetch.defaults.simpleFetch

  return simpleFetch(reqUrl, options).then((res) => {
    if (!res.simple) {
      return
    }

    let simple = res.simple
    let apiLink = url.resolve(reqUrl, ApiHeader.parseResponse(res))

    return hydraApiFetch(apiLink).then((api) => {
      let operationCallFactory = options.operationCallFactory || hydraFetch.defaults.operationCallFactory

      Api.attachCalls(api, simple, operationCallFactory)

      return simple
    })
  })
}

hydraFetch.defaults = {}

hydraFetch.defaults.simpleFetch = simpleFetch

hydraFetch.defaults.operationCallFactory = function (operation, simple) {
  return Operation.buildCall(hydraFetch, operation, simple)
}

module.exports = hydraFetch
