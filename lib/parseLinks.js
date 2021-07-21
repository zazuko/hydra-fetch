import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'

const parseLinkRegExp = /<([^>]*)>\s*;\s*rel="([^"]*)"/

function parseLink ({ factory, str }) {
  const match = str.match(parseLinkRegExp)

  if (!match) {
    return {}
  }

  return {
    url: factory.namedNode(match[1]),
    rel: factory.namedNode(match[2])
  }
}

function parseLinks ({ factory, res, str = res && res.headers.get('link') }) {
  if (!str) {
    return new TermMap()
  }

  return str.split(',').reduce((links, str) => {
    const { rel, url } = parseLink({ factory, str })

    if (!rel || !url) {
      return links
    }

    if (!links.has(rel)) {
      links.set(rel, new TermSet())
    }

    links.get(rel).add(url)

    return links
  }, new TermMap())
}

export default parseLinks
