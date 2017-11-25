const trim = require('lodash/trim')
const trimEnd = require('lodash/trimEnd')
const trimStart = require('lodash/trimStart')

class ApiHeader {
  static parseLinkHeader (link) {
    let parts = link.split(';')
    let url = trimStart(trimEnd(parts.shift(), '>'), '<')

    let properties = parts.reduce((properties, part) => {
      let pair = part.trim().split('=')

      properties[pair[0]] = trim(pair[1], '"')

      return properties
    }, {})

    return {
      url: url,
      properties: properties
    }
  }

  static parseResponse (res) {
    const links = res.headers.get('link')

    if (links) {
      return links.split(',').map(link => ApiHeader.parseLinkHeader(link.trim())).filter((link) => {
        return link.properties.rel === 'http://www.w3.org/ns/hydra/core#apiDocumentation'
      }).map(link => link.url).shift()
    }

    return undefined
  }
}

module.exports = ApiHeader
