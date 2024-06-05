// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('node:path')

let selectedPortInfo = null;
let mainWindow = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 450,
    height: 300,
    // // ウィンドウサイズの最小
    // minWidth: 450,
    // minHeight: 300,

    // // ウィンドウサイズの最大
    // maxWidth: 450,
    // maxHeight: 520,

    // frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  // デバッグツールをつかう
  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
    // console.log('SELECT-SERIAL-PORT FIRED WITH', portList);

    //レンダラープロセスに、送信
    webContents.send('get_serialport_p5', JSON.stringify(portList));
    event.preventDefault();

    let selectedPort = portList.find((device) => {
      //ipcRendererから送られてきた、
      //選択したポートのJSONをチェックする
      //シリアル番号、USBベンダーID、プロダクトIDが一致するものがあれば、true
      if (selectedPortInfo != null) {
        if (device.serialNumber == selectedPortInfo.serialNumber &&
          device.vendorId == selectedPortInfo.vendorId &&
          device.productId == selectedPortInfo.productId) {
          return true
        }
      }
    });
    if (!selectedPort) {
      // 何もコールバックしない
      callback('')
    } else {
      // シリアルポートのIDをコールバック
      callback(selectedPort.portId)
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  mainWindow.setResizable(false);
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') 
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
const { ipcMain } = require('electron')
const { Server, Client, Message } = require('node-osc');

// OSCサーバー設定
const oscServer = new Server(3333, '0.0.0.0');
// OSCクライアント設定
const client1 = new Client('127.0.0.1', 4560);
const client2 = new Client('127.0.0.1', 9999);

ipcMain.on("set_serialport_p5", (event, arg) => {
  // console.log(arg)
  selectedPortInfo = arg;
});

ipcMain.handle("osc-send", async (event, arg) => {
  const _address = arg.address;
  const _data = arg.data;
  const message = new Message(_address);
  for (let i = 0; i < _data.length; i++) {
    message.append(_data[i]);
  }
  client1.send(message);
  client2.send(message);
});
ipcMain.on("set_for_microbit", (event, arg) =>{
  mainWindow.setBounds({height:arg});
  mainWindow.setResizable(false);
})
// OSC受信時に呼ばれる関数
oscServer.on('message', function (msg) {
  mainWindow.webContents.send('get_osc_receive_p5', msg);
  // console.log(msg);
});