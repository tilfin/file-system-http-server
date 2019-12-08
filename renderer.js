// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const { remote } = require('electron')
const { browserWindow, dialog } = remote
const { startServer, stopServer } = require('./lib')

document.getElementById('folderSelect').onclick = (evt) => {
  dialog.showOpenDialog(null, {
    properties: ['openDirectory'],
    title: 'フォルダ(単独選択)',
    defaultPath: '.'
  })
  .then(result => {
    const dirPath = result.filePaths[0]
    document.getElementById('directoryPathText').value = dirPath
  })
  .catch(err => {
    console.error(err)
    document.getElementById('directoryPathText').value = ''    
  })
}

document.getElementById('serverButton').onclick = function (evt) {
  if (this.textContent === 'Start server') {
    const listenPort = document.getElementById('listenPortNumber').value
    const dirPath = document.getElementById('directoryPathText').value
    if (!listenPort || !dirPath) {
      alert('Please decide listen port and mount directory')
      return false;
    }
    this.textContent = 'Server starting...'
    this.disabled = true

    startServer(listenPort, dirPath)
    .then(() => {
      this.disabled = false
      this.textContent = 'Stop server'
    })
    .catch(err => {
      alert(err.message)
      this.disabled = false
    })
  } else {
    this.textContent = 'Server stoping...'
    this.disabled = true

    stopServer().then(() => {
      this.disabled = false
      this.textContent = 'Start server'
    })
    .catch(err => {
      alert(err.message)
      this.disabled = false
    })
  }
}
