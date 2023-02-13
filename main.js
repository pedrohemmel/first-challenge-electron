const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron')
const fs = require('fs')
const path = require('path')

//Global variables
var mainWindow 
var file = {}


//--Functions here
//Main Window
const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        //This is to allow the requirement of electron in another js file
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    await mainWindow.loadFile('src/pages/editor/index.html')
    // mainWindow.webContents.openDevTools()
    createNewFile()

    ipcMain.on('update-content', function(event, data) {
        file.content = data
    })
}

//Create new file
function createNewFile() {
    file = {
        name: 'novo-arquivo.txt',
        content: '',
        saved: false,
        path: app.getPath('documents') + '/novo-arquivo.txt'
    }
    // console.log(file)
    mainWindow.webContents.send('set-file', file)
}

function writeFile(filePath) {
    try {
        fs.writeFile(filePath, file.content, function(error) {
            if (error) throw error

            //Saving file
            file.path = filePath
            file.saved = true 
            file.name = path.basename(filePath)

            mainWindow.webContents.send('set-file', file)
        }) 
    } catch(e) {
        console.log(e)
    }
}
//Save the current file where the user wants
async function saveFileAs() {
    //Dialog
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    })

    //Verify if it is canceled
    if (dialogFile.canceled) {
        return false
    }

    writeFile(dialogFile.filePath)
    // console.log(dialogFile)
}

//Save content even if the file is already saved or not
function saveFile() {
    console.log(file)
    if (file.saved) {
        return writeFile(file.path)
    }
    return saveFileAs()
}

function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8')
    } catch(e) {
        console.log(e)
        return ''
    }
}

async function openFile() {
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    })

    if (dialogFile.canceled) return false

    mainWindow.webContents.send('set-file', file)

    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }

    mainWindow.webContents.send('set-file', file)
}

//Template Menu
const templateMenu = [
    {label: ''},
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Novo',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    createNewFile()
                }
            },
            {
                label: 'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    openFile()
                }
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    saveFile()
                }
            },
            {
                label: 'Salvar como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    saveFileAs()
                }
            },
            {
                label: 'Fechar',
                //darwin is MacOS
                role:process.platform === 'darwin' ? 'close' : 'quit'
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {

                label: 'Cortar',
                role: 'cut'
            },
            {
                label: 'Colar',
                role: 'Paste'
            }
        ]
    },
    {
        label: 'Ajuda',
        submenu: [
            {
                label: 'teste',
                click() {
                    shell.openExternal('https://stackoverflow.com/questions/31790677/how-to-check-if-a-string-contains-an-int-swift')
                }
            }
        ]
        
    }
]

//Menu
const menu = Menu.buildFromTemplate(templateMenu)
Menu.setApplicationMenu(menu)

//On ready
app.whenReady().then(() => {
    createWindow()
})  
//Security activate of main window
app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})