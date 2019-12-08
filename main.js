const { startServer, stopServer} = require('./lib')

let isRunning = false

process.on('SIGINT', () => {
  if (isRunning) {
    stopServer().catch(err => console.error(err))
    .then(() => {
      console.info('Server stopped.')
      isRunning = false
    })
  }
})

const [_, main, port, dirPath] = process.argv
const svrPort = Number(port)

if (!svrPort || !dirPath) {
  console.info(`Useage: ${main} port dir_path`)
  process.exit(0)
} else {
  startServer(svrPort, dirPath).then(() => {
    console.info(`Server listening on port: ${svrPort}`)
    isRunning = true
  }).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
