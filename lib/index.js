const HttpServer = require('./server')

let server;

exports.startServer = async function(port, dirPath) {
  server = new HttpServer(dirPath)
  server.listen(port)
}

exports.stopServer = async function() {
  await server.close()
  server = null
}
