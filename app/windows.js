

function createWindow () {
  count++;

  const {s_width, s_height} = electron.screen.getPrimaryDisplay().workAreaSize;
  lastWindowState = config.get('lastWindowState');
  lastWindowPosition = config.get('lastWindowPosition');

  // Create the browser window.
  mainWindow = new BrowserWindow({width: lastWindowState.width, 
      height: lastWindowState.height, 
      x: x, 
      y: y, 
	  width: debug_add + width, 
      height: debug_add + height, 
      minWidth: 330,
      minHeight: 490,
      frame: false, 
      'titleBarStyle': 'hidden', 
      resizable: true, 
      alwaysOnTop: false, 
      fullscreenable: false,
      fullscreen: false, 
      skipTaskbar: true,
      title: 'Psyc',
      icon : __dirname + '/img/icon_color.png', movable: true,
      maximizable: false,
    });

  // v shaped
  // if(count < 4){
	 //  x = x + 60;
	 //  y = y + 60;
  // }
  // else if(count == 4){
  //   	x = x + 560;
  //   	y = y - 180;
  // }
  // else if(count < 8){
	 //  x = x - 60;
	 //  y = y + 60;
  // }

  // linear horizontal
  x = x + 80;

  if(debug) mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null);
  mainWindow.loadURL('file://'+__dirname+'/index.html');


  mainWindow.on('page-title-updated', (e, title) => {
    e.preventDefault();
    updateBadge(title);
  });

  // mainWindow.on('close', (e, cmd) => {
  //   if(mainWindow !== null) config.set('lastWindowState', mainWindow.getBounds());
  // });

}




// login window
let loginWindow;

function createLoginWindow () {

  // Create the browser window.
  loginWindow = new BrowserWindow({
      x: x, 
      y: y, 
	  width: 325, 
      height: 325, 
      frame: false, 
      'titleBarStyle': 'hidden', 
      resizable: false, 
      alwaysOnTop: false, 
      fullscreenable: false,
      fullscreen: false, 
      skipTaskbar: true,
      title: 'Psyc', 
      icon : __dirname + '/img/icon_color.png', movable: true,
      maximizable: false,
    });

  
  // loginWindow.webContents.openDevTools();
  loginWindow.setMenu(null);
  loginWindow.loadURL('file://'+__dirname+'/login.html');

  loginWindow.on('close', (e, cmd) => {
    // createWindow();
  });

}