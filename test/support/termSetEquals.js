function termSetEquals (a, b) {
  return [...a].every(term => b.has(term))
}

export default termSetEquals
