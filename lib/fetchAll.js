import setGraph from './setGraph.js'

async function fetchAll ({ factory, fetch, fetchArgs, urls }) {
  const all = factory.dataset()

  await Promise.all([...urls].map(async url => {
    const graph = factory.namedNode(url.value || url.toString())
    const res = await fetch(graph.value, { factory, ...fetchArgs })

    all.addAll(setGraph({ dataset: await res.dataset(), factory, graph }))
  }))

  return all
}

export default fetchAll
