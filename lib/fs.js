const fs = require('fs')
const path = require('path')

exports.pathJoin = function (...paths) {
  return path.join(...paths)
}

exports.validateFilePath = function (filePath) {
  const parts = filePath.split('/')
  for (const pt of parts) {
    if (pt === '..' || pt === '.') {
      return false
    }
  }
  return true
}

exports.readFile = async function (rootDirPath, filePath) {
  const absFilePath = path.join(rootDirPath, filePath)
  const fileKind = await getPathKind(absFilePath)
  if (fileKind === 'dir') {
    const items = await fs.promises.readdir(absFilePath)
    return [Buffer.from(JSON.stringify({ items }), 'utf8'), 'text/json']
  } else if (fileKind === 'file') {
    const data = await fs.promises.readFile(absFilePath)
    return [data, 'application/octet-stream']
  } else {
    return [null, null]
  }
}

exports.createDirectory = async function (rootDirPath, filePath) {
  const pathParts = filePath.split('/')
  pathParts.pop() // drop filename

  let dirPath = rootDirPath
  for (const dirname of pathParts) {
    if (dirname === '..' || dirname === '.') {
      throw new Error('Invalid file path')
    }

    dirPath = path.join(dirPath, dirname)
    const fileKind = await getPathKind(dirPath)
    if (fileKind === 'dir') {
      continue
    } else if (fileKind === 'file') {
      throw new Error('Invalid file path')
    } else {
      await fs.promises.mkdir(dirPath)
    }
  }
}

exports.writeFileStream = function (dirPath, filePath) {
  const absFilePath = path.join(dirPath, filePath)
  return fs.createWriteStream(absFilePath, { encoding: 'binary' })
}

async function getPathKind(filePath) {
  try {
    const stat = await fs.promises.stat(filePath)
    if (stat.isDirectory()) return 'dir'
    if (stat.isFile()) return 'file'
  } catch(err) {
  }
  return null
}
