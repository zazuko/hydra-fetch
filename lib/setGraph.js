function setGraph ({ dataset, factory, graph }) {
  const result = factory.dataset()

  for (const quad of dataset) {
    result.add(factory.quad(quad.subject, quad.predicate, quad.object, graph))
  }

  return result
}

export default setGraph
