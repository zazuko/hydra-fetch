function isDataset (obj) {
  return typeof obj.size === 'number' &&
    typeof obj.add === 'function' &&
    typeof obj.delete === 'function' &&
    typeof obj.has === 'function'
}

export default isDataset
