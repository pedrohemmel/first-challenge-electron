const { ipcRenderer } = require('electron')

const tltHead = document.getElementById('tltHead')
const tltHeader = document.getElementById('tltHeader')
const textEditor = document.getElementById('textEditor')


ipcRenderer.on('set-file', function(event, data) {
    tltHead.innerHTML = data.name + ' | FAWE'
    tltHeader.innerHTML = data.name
    textEditor.value = data.content

})