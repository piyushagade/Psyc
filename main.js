const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
var fs = require('fs');
var firebase = require('firebase');

const Menu = electron.Menu;
const Tray = electron.Tray;
const globalShortcut = electron.globalShortcut;
const storage = require('electron-json-storage');

var lastWindowPosition;
var lastWindowState;
var docked = true;

const config = require('./config');
const tray = require('./tray');

var notes_string = "";
var ipcMain = require('electron').ipcMain;
var ipcRenderer = require('electron').ipcRenderer;

var clients_served = 0;

//Global Objects
global.note_update = {note_string: null};
global.note_retrieve = {note_string: null, id: null};
global.note_delete = {id: null};
global.sync = {note_string: null, id: null};



// Initialize Firebase
var f_config = {
	apiKey: "AIzaSyDG2Dx_VfSLg09u8yQl5Aka7WS-omoNiyk",
	authDomain: "pysc-60451.firebaseapp.com",
	databaseURL: "https://pysc-60451.firebaseio.com",
	storageBucket: "pysc-60451.appspot.com",
	messagingSenderId: "287121949870"
};
firebase.initializeApp(f_config);



var messageCount;

var reset = false;

if(reset){
	storage.set('notes', { number_notes: "0" });

}

const isAlreadyRunning = app.makeSingleInstance(() => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }

    mainWindow.show();
  }
});

if (isAlreadyRunning) {
  app.quit();
}


app.on('ready', function() {

  //Ctrl + Shift + W
  var ret_accept = globalShortcut.register('ctrl+shift+n', function() {
    createWindow();
  });
});	


function updateBadge(title) {
  // ignore `Sindre messaged you` blinking
  if (title.indexOf('WhatsApp') === -1) {
    return;
  }

  messageCount = (/\(([0-9]+)\)/).exec(title);
  messageCount = messageCount ? Number(messageCount[1]) : 0;

  if (process.platform === 'darwin' || process.platform === 'linux') {
    app.setBadgeCount(messageCount);
  }

  if (process.platform === 'linux' || process.platform === 'win32') {
    tray.setBadge(messageCount);
  }

}


var winHidden = false;
var x = 400;
var y = 100;
var count = 0;

let mainWindow;

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

  if(count < 4){
	  x = x + 60;
	  y = y + 60;
  }
  else if(count == 4){
    	x = x + 560;
    	y = y - 180;
  }
  else if(count < 8){
	  x = x - 60;
	  y = y + 60;
  }

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



// preferences
app.on('ready', function(){
	storage.get('notes', function(error, data) {

		var d = new Date();
    	var n = d.getTime();

	    if(data.number_notes === null){
	    	console.log("First run.");
	    	createWindow();
	    	var empty_note = ["0!@#empty!@#empty!@#128C7E"];

    		storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(empty_note), timestamp: n});
	    }
	    else if(parseInt(data.number_notes) == '0'){
	    	console.log("No notes found.");
	    	createWindow();
    		var empty_note = ["0!@#empty!@#empty!@#128C7E"];
    		storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(empty_note), timestamp: n});
    	}
	    else{
			console.log(parseInt(data.number_notes) + " notes found.");
	    	for(var i = 0; i < parseInt(data.number_notes); i++){
	    		setTimeout(function(){
	    			createWindow();
	    		}, 700 * i); 
	    	}

	    	notes_string = data.notes_string;
	    }  
	});
});

app.on('ready', function(){
  tray.create(mainWindow);

});


// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});


//Quit
app.on('before-quit', () => {

});


app.on('will-quit', function() {
  // Unregister a shortcut.
  globalShortcut.unregister('ctrl+shift+n');

  // Unregister all shortcuts.
  globalShortcut.unregisterAll();
 

});


// Update note data
ipcMain.on('ren_to_main_data', function(event) {
	var note_string = global.note_update.note_string;

	updateNote(note_string);
	event.sender.send('ren_to_main_data', 1);
});


function updateNote(ns){
	storage.get('notes', function(error, data) {
		var notes_array = JSON.parse(data.notes_string);
		if(ns!=null){
			var id = ns.split("!@#")[0];
			notes_array[id] = ns;


			var d = new Date();
	    	var n = d.getTime();

			storage.set('notes', {number_notes: data.number_notes, notes_string: JSON.stringify(notes_array), timestamp: n});
		}
	});
}



var fb = firebase.database().ref().child("cloud").child("piyushagade").child('notes');
var retrieve_data_array = null;
var retrieve_data = null;
var cloud_flag = true;
var cloud_timestamp = 0;
var local_timestamp = 0;
var cloud_notes_string = 0;

fb.on("value", function(snapshot) {
	cloud_timestamp = snapshot.val().split("!@!@!")[0];
	cloud_notes_string = snapshot.val().split("!@!@!")[1];

	storage.get('notes', function(error, data) {
		local_timestamp = data.timestamp;

		if(cloud_timestamp > local_timestamp){
			retrieve_data_array = JSON.parse(cloud_notes_string);
			retrieve_data = retrieve_data_array[clients_served];
			cloud_flag = true;
		}
		else{
			cloud_flag = false;
		}	
	});

	

}, function (errorObject) {
});

var isBusy = false;

// Retrieve note data
ipcMain.on('main_to_ren_data', function(event) {
	storage.get('notes', function(error, data) {

		if(isBusy){
			setTimeout(function(){
				
			}, 650);
		}
		isBusy = true;

		setTimeout(function(){

			if(!cloud_flag){				
				retrieve_data_array = JSON.parse(data.notes_string);

			}
			retrieve_data = retrieve_data_array[clients_served];

			if(retrieve_data!==undefined) global.note_retrieve = {note_string: retrieve_data, id: retrieve_data.split("!@#")[0]};
			clients_served++;

			setTimeout(function(){
				event.sender.send('main_to_ren_data', 1);
				isBusy = false;
			}, 50);
		}, 600);

  		
	});
});



// New note
ipcMain.on('new_note', function(event) {
	
	if(clients_served <= 7){
	 createWindow();
	
		storage.get('notes', function(error, data) {
			var nn = parseInt(data.number_notes) + 1;


			var empty_note = [clients_served + "!@#empty!@#empty!@#128C7E"];
			note_retrieve = {note_string: JSON.stringify(empty_note), id: clients_served};

			var notes_array = JSON.parse(data.notes_string);
			notes_array[clients_served] = empty_note[0];


			var d = new Date();
	    	var n = d.getTime();

			storage.set('notes', {number_notes: nn, notes_string: JSON.stringify(notes_array), timestamp: n});
		});
	}
});


// Delete note
ipcMain.on('delete_note', function(event) {
	
	if(clients_served + 1 !== '0'){
		storage.get('notes', function(error, data) {
			setTimeout(function(){
				var id = global.note_delete.id;
				console.log("Note deleted: " + id);

				var nn = parseInt(data.number_notes) - 1;
				var notes_array = JSON.parse(data.notes_string);

				var empty_note = [clients_served + "!@#empty!@#empty!@#128C7E"];
				notes_array.splice(id--, 1);

				storage.set('notes', {number_notes: nn, notes_string: JSON.stringify(notes_array)});

				fb.child(id).set(null);

				event.sender.send('delete_note', 1);
				note_delete = {id: null};
			}, 0);
			
		});
		
	}
});


// sync
ipcMain.on('sync', function(event) {
	
	setTimeout(function(){
		var d = new Date();
    	var n = d.getTime();

		storage.get('notes', function(error, data) {
			console.log("All notes synced.");

			fb.set(n + "!@!@!" + data.notes_string);

			event.sender.send('sync', 1);
		});
	}, 0);
		
	
	
});

