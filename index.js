const bySubjectCountFinder = require('simplerdf-iri-finder/bySubjectCount')
const context = require('./lib/context')
const merge = require('lodash/merge')
const ns = require('./lib/namespace')
const simpleFetch = require('simplerdf-fetch')
const url = require('url')
const Api = require('./lib/Api')
const ApiHeader = require('./lib/ApiHeader')
const Operation = require('./lib/Operation')
const Simple = require('simplerdf-core')
const SimpleIriFinder = require('simplerdf-iri-finder')

function hydraApiFetch (fetch, apiUrl, options) {
  options = merge({}, options, {context: context})

  return fetch(apiUrl, options).then((res) => {
    return res.body
  })
}

function hydraFetch (reqUrl, options) {
  options = options || {}
  options.Simple = options.Simple || Simple

  const simpleFetch = options.fetch || hydraFetch.defaults.simpleFetch

  return simpleFetch(reqUrl, options).then((res) => {
    const simple = res.body || new options.Simple(options.context)
    const apiLink = ApiHeader.parseResponse(res)

    if (!apiLink) {
      return res
    }

    SimpleIriFinder.assignIri(simple, null, options.iriFinders)

    return hydraApiFetch(simpleFetch, url.resolve(reqUrl, apiLink)).then((api) => {
      const types = simple.graph().match(simple.iri(), ns.type).toArray().map(quad => quad.object)

      // search for matching type in API
      if (api && types.length) {
        SimpleIriFinder.assignIri(api, types, [bySubjectCountFinder()])
      }

      // attach api interface
      simple.api = () => {
        return api
      }

      const operationCallFactory = options.operationCallFactory || hydraFetch.defaults.operationCallFactory

      Api.attachCalls(api, simple, operationCallFactory)

      return res
    })
  }).then((res) => {
    if (options.fullResponse) {
      return res
    } else {
      return res.body
    }
  })
}

hydraFetch.defaults = {}

hydraFetch.defaults.simpleFetch = simpleFetch.fetch

hydraFetch.defaults.operationCallFactory = function (operation, simple) {
  return Operation.buildCall(hydraFetch, operation, simple)
}

module.exports = hydraFetch
