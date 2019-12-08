const http = require('http')
const URL  = require('url')
const { readFile, validateFilePath, createDirectory, writeFileStream } = require('./fs')

class HttpServer {
  constructor(dirPath) {
    this.dirPath = dirPath
  }

  listen(port) {
    this.server = http.createServer((req, res) => {
      this.requestHandler(req, res)
    })
    this.server.on('checkContinue', (req, res) => {
      res.writeContinue()
      this.requestHandler(req, res)
    })
    this.server.on('error', err => {
      console.error(err)
    })
    this.server.listen(port)
  }

  close() {
    return new Promise(resolve => {
      this.server.close(resolve)
      this.server = null
    })
  }

  requestHandler(req, res) {
    try {
      const request = URL.parse(req.url, true);
      const filePath = decodeURIComponent(request.pathname)
  
      if (req.method === 'GET') {
        this.handleGet(filePath, req, res)
      } else if (req.method === 'OPTIONS') {
        this.handleOptions(filePath, req, res)
      } else if (req.method == 'PUT') {
        this.handlePut(filePath, req, res)
      //} else if (req.method == 'DELETE') {
      } else {
        res.writeHead(405, { 'Content-Length': 0 })
        res.end()
      }
    } catch(err) {
      console.error(err)
    }
  }

  handleGet(filePath, req, res) {
    readFile(this.dirPath, filePath)
    .then(([data, contentType]) => {
      if (data === null) {
        this.respondError(404, 'File not found', res)
        return
      }

      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': data.length
      })
      res.write(data)
      res.end()
    })
    .catch(err => {
      this.respondServerError(err, res)
    })
  }

  handleOptions(filePath, req, res) {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PUT, GET, OPTIONS',
      'Access-Control-Max-Age ': 86400,
      'Content-Length': 0,
    })
    res.end()
  }

  handlePut(filePath, req, res) {
    if (!validateFilePath(filePath)) {
      this.respondError(403, 'Invalid file path', res)
      return
    }

    createDirectory(this.dirPath, filePath)
    .then(() => {
      req.setEncoding('binary')
      req.pipe(writeFileStream(this.dirPath, filePath))
      .on('close', () => {
        res.writeHead(204)
        res.end()
      })
      .on('error', err => {
        this.respondServerError(err, res)
      })
    })
  }

  respondServerError(err, res) {
    this.respondError(500, err.message, res)
  }

  respondError(status, message, res) {
    const resBody = JSON.stringify({ message })
    res.writeHead(status, { 'Content-Length': resBody.length })
    res.write(resBody)
    res.end()
  }
}

module.exports = HttpServer
