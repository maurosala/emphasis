const fs = require('fs')
const path = require('path')
const core = require('./core')
const logger = require('./logger')

const main = async () => {
  const yamlList = []
  fs.readdirSync('./magic').forEach((file) => {
    if (path.extname(file) === '.yaml') {
      yamlList.push({
        name: file,
        content: fs.readFileSync(`./magic/${file}`, 'utf8')
      })
    }
  })

  const regex = /[^{}]+(?=})/gm
  yamlList.forEach((yaml) => {
    if (regex.test(yaml.content)) {
      yaml.content.match(regex).forEach(async (match) => {
        const rx = /\(([^()]*)\)/g
        const [name, prop] = rx
          .exec(match.trim())[1]
          .split(',')
          .map((s) => s.trim())
        const value = await core[match.split('(')[0].trim()](name, prop)
        if (value) {
          if (parseInt(value)) {
            yaml.content = yaml.content.replace(`{${match}}`, `"${value}"`)
          } else {
            yaml.content = yaml.content.replace(`{${match}}`, value)
          }
          core.apply(yaml)
        } else {
          logger.error(
            `Missing requirement for ${yaml.name}: ${name} (${prop})`
          )
        }
      })
    } else {
      core.apply(yaml)
    }
  })
  console.log('---')
}

// setInterval(main, 10000)
main()
