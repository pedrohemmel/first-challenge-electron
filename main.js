const { app, BrowserWindow, Menu } = require('electron')

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

//Template Menu
const templateMenu = [
    {label: ''},
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Novo',
                click() {
                    createNewFile()
                }
            },
            {
                label: 'Abrir'
            },
            {
                label: 'Salvar'
            },
            {
                label: 'Salvar como'
            },
            {
                label: 'Fechar',
                //darwin is MacOS
                role:process.platform === 'darwin' ? 'close' : 'quit'
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