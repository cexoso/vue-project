const indexOf = process.argv.findIndex((item) => item === '--config-file')
const configPath = process.argv[indexOf + 1]

if (configPath === undefined) {
  process.exit(-1)
}
const config = require(configPath).default()
process.send?.(config)
