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
      const m = yaml.content.match(regex)
      let valid = 0
      m.forEach(async (match) => {
        const rx = /\(([^()]*)\)/g
        const [name, prop] = rx
          .exec(match.trim())[1]
          .split(',')
          .map((s) => s.trim())
        const value = await core[match.split('(')[0].trim()](name, prop)
        if (value) {
          yaml.content = yaml.content.replace(`{${match}}`, `"${value}"`)
          valid++
        }
        if (valid === m.length) {
          core.apply(yaml)
        }
      })
    } else {
      core.apply(yaml)
    }
  })
  logger.info('Run')
}

setInterval(main, 10000)
// main()
