#!/usr/bin/env node

import program from 'commander'
import hydraFetch from '../index.js'

function listOperations (operations) {
  for (const operation of operations) {
    console.log(`${operation.method} ${operation.target.value}`)

    if (operation.expects.size > 0) {
      console.log('  expects:')
      for (const type of operation.expects) {
        console.log(`    - ${type.value}`)
      }
    }

    if (operation.returns.size > 0) {
      console.log('  returns:')
      for (const type of operation.returns) {
        console.log(`    - ${type.value}`)
      }
    }
  }
}

function listProperties (properties) {
  for (const property of properties) {
    console.log(`${property.property.value} ${property.object.value}`)

    listOperations(property.operations)
  }
}

program
  .command('get <url>')
  .option('-v, --verbose', 'enable diagnostic console output', (v, total) => ++total, 0)
  .action(async (url, { verbose } = {}) => {
    try {
      const res = await hydraFetch(url)

      console.log('resource headers:')
      for (const [name, value] of res.headers) {
        console.log(`  ${name}: ${value}`)
      }

      const { term, dataset, graph } = await res.resource()

      console.log(`resource location: ${graph.value}`)
      console.log(`resource root: ${term && term.value}`)
      console.log('resource content:')
      console.log(dataset.toString())

      const api = await res.api()

      /* console.log(`api content:`)
      console.log(api.ptr.dataset.toString()) */

      listOperations(api.operations)
      listProperties(api.properties)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

program.parse(process.argv)
