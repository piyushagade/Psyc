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
const storage = require('electron-json-storage');
const globalShortcut = electron.globalShortcut;
const clockStateKeeper = require('electron-window-state');
const pomoStateKeeper = require('electron-window-state');
const wikiStateKeeper = require('electron-window-state');
const digitalStateKeeper = require('electron-window-state');

var lastWindowPosition;
var lastWindowState;
var docked = true;

const config = require('./config');
// const tray = require('./tray');

var notes_string = "";
var ipcMain = require('electron').ipcMain;
var ipcRenderer = require('electron').ipcRenderer;

var clients_served = 0;

//Global Objects
require('./app/global');

var width = global.dimensions.width;
var height = global.dimensions.height;


// Initialize Firebase
var f_config = {
	apiKey: "AIzaSyDG2Dx_VfSLg09u8yQl5Aka7WS-omoNiyk",
	authDomain: "pysc-60451.firebaseapp.com",
	databaseURL: "https://pysc-60451.firebaseio.com",
	storageBucket: "pysc-60451.appspot.com",
	messagingSenderId: "287121949870"
};
firebase.initializeApp(f_config);

var fb = firebase.database().ref().child("cloud");
var fb_user = null;
var fb_notes = null;
var retrieve_data_array = null;
var retrieve_data = null;
var cloud_flag = true;
var cloud_timestamp = 0;
var local_timestamp = 0;
var cloud_notes_string = 0;

var isLoggedIn = false;
var isBusy = false;

var pomo = false;
var clock = false;
var digital = false;
var wiki = false;
var dict = false;

var messageCount;

var reset = global.debug.reset;
var debug = global.debug.on;
var verbose = global.debug.on;

var debug_add = 0;
if(debug) debug_add = 300;

if(reset){
	storage.set('notes', { number_notes: null, notes_string: null, timestamp: null });

	storage.set('user', { user_name : null, eemail: null, email: null});

}



function updateBadge(title) {
  // ignore `Sindre messaged you` blinking
  if (title.indexOf('WhatsApp') === -1) {
    return;
  }

  messageCount = (/\(([0-9]+)\)/).exec(title);
  messageCount = messageCount ? Number(messageCount[1]) : 0;

  if (process.platform === 'darwin' || process.platform === 'linux') {
    // app.setBadgeCount(messageCount);
  }

  if (process.platform === 'linux' || process.platform === 'win32') {
    // tray.setBadge(messageCount);
  }

}



app.on('ready', function(){
	  var path = require('path');

	  const Tray = electron.Tray;
	  appIcon = new Tray(path.join(__dirname, 'img/icon_20.png'));

	  contextMenu = Menu.buildFromTemplate([
	  	{
			label: 'Dictionary',
			type: 'checkbox',
			checked: dict,
			click() {
				if(!dict) {
					createDictWidget();
					dict = true;
				}else{
					dictWidget.close();
					dict = false;
					dictWidget = null;
				}
			}
		},
	  	{
			label: 'Analog clock widget',
			type: 'checkbox',
			checked: clock,
			click() {
				if(!clock) {
					createClockWidget();
					clock = true;
				}else{
					clockWidget.close();
					clock = false;
					clockWidget = null;
				}
			}
		},
		{
			label: 'Digital clock widget',
			type: 'checkbox',
			checked: digital,
			click() {
				if(!digital) {
					createDigitalWidget();
					digital = true;
				}else{
					digitalWidget.close();
					digital = false;
					digitalWidget = null;
				}
			}
		},
		{
			label: 'Pomodoro timer',
			type: 'checkbox',
			checked: pomo,
			click() {
				if(!pomo) {
					createPomoWidget();
					pomo = true;
				}else{
					pomoWidget.close();
					pomo = false;
					pomoWidget == null;
				}
			}
		},
		{
			label: 'Wikitionary',
			type: 'checkbox',
			checked: wiki,
			click() {
				if(!wiki) {
					createWikiWidget();
					wiki = true;
				}else{
					wikiWidget.close();
					wiki = false;
					wikiWidget == null;
				}
			}
		},
		{
			type: 'separator'
		},
		{
			role: 'quit'
		}
	    ]);
	    appIcon.setToolTip('Pysc');
	    appIcon.setContextMenu(contextMenu);

});


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
	  width: debug_add + width, 
      height: height, 
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

  mainWindow.on('close', (e, cmd) => {
     // if(mainWindow !== null) config.set('lastWindowState', mainWindow.getBounds());
  });

}




// login window
let loginWindow;

function createLoginWindow () {

  // Create the browser window.
  loginWindow = new BrowserWindow({
      x: x, 
      y: y, 
	  width: 330, 
      height: 330, 
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


// const PaneBrowserwindow = require('electron-pane-window');
 
// win = new PaneBrowserWindow({
//  side: 'left',
//  'always-on-top': false,
//  width: 600
// });


// dictionary window
let dictWidget;

dictWidget = null;

function createDictWidget () {
  let dictWidgetState = new clockStateKeeper({
    defaultWidth: 325,
    defaultHeight: 325
  });

  // Create the browser window.
  dictWidget = new BrowserWindow({
      x: dictWidgetState.x, 
      y: dictWidgetState.y, 
	  width: 900, 
      height: 500, 
      minWidth: 330,
      minHeight: 330,
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

  
  if(debug) dictWidget.webContents.openDevTools();
  dictWidget.setMenu(null);
  dictWidget.loadURL('file://'+__dirname+'/widgets/dictionary/dictionary.html');

  dictWidget.on('close', (e, cmd) => {
  });

  dictWidgetState.manage(dictWidget);

}


// clock window
let clockWidget;

function createClockWidget () {
  let clockWidgetState = new clockStateKeeper({
    defaultWidth: 325,
    defaultHeight: 325
  });

  // Create the browser window.
  clockWidget = new BrowserWindow({
      x: clockWidgetState.x, 
      y: clockWidgetState.y, 
	  width: 330, 
      height: 330, 
      minWidth: 330,
      minHeight: 330,
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

  
  if(debug) clockWidget.webContents.openDevTools();
  clockWidget.setMenu(null);
  clockWidget.loadURL('file://'+__dirname+'/widgets/clock/index.html');

  clockWidget.on('close', (e, cmd) => {
  });

  clockWidgetState.manage(clockWidget);

}

// digital clock window
let digitalWidget;

function createDigitalWidget () {

  let digitalWidgetState = new digitalStateKeeper({
    defaultWidth: 330,
    defaultHeight: 80
  });


  // Create the browser window.
  digitalWidget = new BrowserWindow({
      x: digitalWidgetState.x, 
      y: digitalWidgetState.y, 
	  width: 330, 
      height: 80, 
      minWidth: 330,
      minHeight: 80,
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

  
  if(debug) digitalWidget.webContents.openDevTools();
  digitalWidget.setMenu(null);
  digitalWidget.loadURL('file://'+__dirname+'/widgets/digital_clock/digital.html');

  digitalWidget.on('close', (e, cmd) => {
  });

  digitalWidgetState.manage(digitalWidget);
}


// pomo window
let pomoWidget;

function createPomoWidget () {


  let pomoWidgetState = new pomoStateKeeper();


  // Create the browser window.
  pomoWidget = new BrowserWindow({
      x: pomoWidgetState.x, 
      y: pomoWidgetState.y, 
	  width: 330, 
      height: 220, 
      minWidth: 330,
      minHeight: 220,
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

  
  if(debug) pomoWidget.webContents.openDevTools();
  pomoWidget.setMenu(null);
  pomoWidget.loadURL('file://'+__dirname+'/widgets/pomodoro/pomo.html');

  pomoWidget.on('close', (e, cmd) => {
  });

  pomoWidgetState.manage(pomoWidget);

}



// wiki window
let wikiWidget;

function createWikiWidget () {


  let wikiWidgetState = new wikiStateKeeper({
  	width: 820,
  	height: 520
  });

  // Create the browser window.
  wikiWidget = new BrowserWindow({
      x: wikiWidgetState.x, 
      y: wikiWidgetState.y, 
	  width: wikiWidgetState.width, 
      height: wikiWidgetState.height, 
      minWidth: 820,
      minHeight: 520,
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

  
  if(debug) wikiWidget.webContents.openDevTools();
  wikiWidget.setMenu(null);
  wikiWidget.loadURL('file://'+__dirname+'/widgets/wikitionary/wikitionary.html');

  wikiWidget.on('close', (e, cmd) => {
  });

	

 // clockWidgetState.manage(clockWidget);
 // pomoWidgetState.manage(pomoWidget);
 // digitalWidgetState.manage(digitalWidget);
 wikiWidgetState.manage(wikiWidget);
}


var user_name = "";

// preferences
app.on('ready', function(){



	storage.get('user', function(error, data) {

		//if not logged in or logged out
	    if(data.eemail === null || data.eemail === undefined){
	    	user_name = "not_set";
			global.login = {eemail: "not_set", email: "not_set"};	    	
	    }
	    //if login skipped
	    else if(data.eemail === 'skipped'){
	    	user_name = 'skipped';
			global.login = {eemail: "skipped", email: "skipped"};
	    }
	    //if logged in
	    else{
	    	user_name = data.eemail;
	    	isLoggedIn = true;
    		storage.set('user', { user_name : data.eemail, eemail : data.eemail, email : data.email});

			global.login = {eemail:  data.eemail, email: data.email};
    		fb_user = fb.child(data.eemail);
    	} 


    	//create notes instances
    	storage.get('notes', function(error, data) {

			var d = new Date();
	    	var n = d.getTime();

    		//if first run
		    if(data.number_notes === null || data.number_notes === undefined || user_name === "not_set"){
  				l("New user");

		    	var object = {data: []};

				object.data.push({
					"id" : r(),
					"note" : "empty",
					"title" : "empty",
					"accent" : "#128C7E",
					"mode" : "text",
					"grid" : false,
					"protected" : false,
					"width" : width,
					"height" : height,
					"alarm" : true,
					"pin" : "",
					"timestamp" : n
				});



				storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(object), timestamp: n});


    			l(data.number_notes,"Notes found");

    			if(data.number_notes > 0){
	    			for(var i = 0; i < parseInt(data.number_notes); i++){
			    		setTimeout(function(){
	  						loginWindow = null;

	  						setTimeout(function(){
	  							createWindow();
	  						}, 100);
			    			
			    		}, 600 * i); 
			    	}
			    }


	    		//show login window
	    		if(user_name !== 'skipped'){
			    	setTimeout(function(){
				    	mainWindow = null;
				    	createLoginWindow();
			    	}, 700 * data.number_notes);
		    	}
	    		


		    	//Set global object
		    	global.notes_string = data.notes_string;
	    		
		    }
		    //if no notes saved
		    else if(parseInt(data.number_notes) == '0'){
		    	l("No notes found.");
  				loginWindow = null;
		    	createWindow();
				var object = {data: []};

				object.data.push({
					"id" : r(),
					"note" : "empty",
					"title" : "empty",
					"accent" : "#128C7E",
					"protected" : false,
					"width" : width,
					"height" : height,
					"pin" : "0000",
					"mode" : "text",
					"alarm" : true,
					"grid" : false,
					"timestamp" : n
				});

	    		storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(object), timestamp: n});
	    	}
	    	//few notes saved && logged in
		    else{
		    	var counter = 0;
		    	for(var i = 0; i < parseInt(data.number_notes); i++){
	    			l(data.number_notes,"Notes found"); 						

		    		setTimeout(function(){
		    			if(JSON.parse(data.notes_string).data[counter] !== undefined) width = JSON.parse(data.notes_string).data[counter].width;
						if(JSON.parse(data.notes_string).data[counter] !== undefined) height = JSON.parse(data.notes_string).data[counter].height;

						l(height, width);

						counter++;

  						loginWindow = null;
	    				createWindow();

		    		}, 700 * i); 

		    	}

		    	//Set global object
		    	notes_string = data.notes_string;
		    	global.stats.number_notes = data.number_notes;
		    }  

		});

	});


	
});

app.on('ready', function(){
  // tray.create(mainWindow);

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
  	loginWindow = null;
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


// update note data
ipcMain.on('ren_to_main_data', function(event) {
	var note_string = global.note_update.note_string;

	updateNote(note_string);
	event.sender.send('ren_to_main_data', 1);
});


function updateNote(ns){
	storage.get('notes', function(error, data) {
		if(ns!=null){

			var d = new Date();
	    	var n = d.getTime();
	    	var object = JSON.parse(data.notes_string);

	    	var id = ns.id;
	    	l(id, "Note updated");
	    	l(data.notes_string, "Note string after latest update");

	    	var array = object.data;
	    	for(var i = 0; i < array.length; i++){
	    		if(array[i].id === id){
	    			array[i].note = ns.note;
	    			array[i].title = ns.title;
	    			array[i].accent = ns.accent;
	    			array[i].protected = ns.protected;
	    			array[i].pin = ns.pin;
	    			array[i].mode = ns.mode;
	    			array[i].grid = ns.grid;
	    			array[i].width = ns.width;
	    			array[i].alarm = ns.alarm;
	    			array[i].height = ns.height;
	    			array[i].timestamp = ns.timestamp;
	    		}
	    	}

			storage.set('notes', {number_notes: data.number_notes, notes_string: JSON.stringify(object), timestamp: n});

		}
	});
}





// retrieve note data
ipcMain.on('main_to_ren_data', function(event) {
	storage.get('notes', function(error, data) {
		storage.get('user', function(error, data) {
			global.login = {eemail:  data.eemail, email: data.email};
		});

		
  		// retrieve locally
		
		if(isBusy){
			setTimeout(function(){
				
			}, 650);
		}
		isBusy = true;

		setTimeout(function(){
			var object = JSON.parse(data.notes_string);

			if(object !== undefined || object !== null){
				 retrieve_data = object.data[clients_served++];
			}

			if(retrieve_data!==undefined  && retrieve_data !== null) 
				global.note_retrieve = {note_string: retrieve_data, id: retrieve_data.id, mode: retrieve_data.mode};
			
			

			setTimeout(function(){
				event.sender.send('main_to_ren_data', 1);
				isBusy = false;
			}, 50);
		}, 600);
  		
	});
});

function retreive_from_cloud(){
	// retrieve from cloud
		if(isLoggedIn){
			fb_notes = fb_user.child("notes");
			
			fb_notes.on("value", function(snapshot) {
				cloud_timestamp = (snapshot.val()).toString().split("!@!@!")[0];
				cloud_notes_string = (snapshot.val()).toString().split("!@!@!")[1];

				var object = JSON.parse(cloud_notes_string);

				storage.get('notes', function(error, data) {
					local_timestamp = data.timestamp;

					if(cloud_timestamp > local_timestamp){
						retrieve_data = retrieve_data_array[clients_served];

						if(retrieve_data!==undefined && retrieve_data !== null) {
							global.note_retrieve = {note_string: retrieve_data, id: retrieve_data.split("!@#")[0]};
							clients_served++;
						}


						l("Note: " + retrieve_data);

						setTimeout(function(){
							event.sender.send('main_to_ren_data', 1);
							isBusy = false;
						}, 50);

						cloud_flag = true;
					}
					else{
						cloud_flag = false;
					}	
				});

			}, function (errorObject) {
			});

			if(isBusy){
				setTimeout(function(){
					
				}, 650);
			}
			isBusy = true;

			setTimeout(function(){

				if(!cloud_flag){				
					retrieve_data_array = JSON.parse(data.notes_string);
					l("Local notes: " + retrieve_data_array);
					

					if(retrieve_data_array !== undefined || retrieve_data_array !== null){
						retrieve_data = retrieve_data_array[clients_served];
						clients_served++;
					}

					if(retrieve_data!==undefined && retrieve_data !== null) 
						global.note_retrieve = {note_string: retrieve_data, id: retrieve_data.split("!@#")[0]};
					

					setTimeout(function(){
						event.sender.send('main_to_ren_data', 1);
						isBusy = false;
					}, 50);
				
				}
			}, 600);

  		}
}



// new note / add note
ipcMain.on('new_note', function(event) {
	
	if(clients_served <= global.settings.max_notes){
		loginWindow = null;
		createWindow();
	
		storage.get('notes', function(error, data) {
			var nn = parseInt(data.number_notes) + 1;


			var object = JSON.parse(data.notes_string);
			
			var d = new Date();
	    	var n = d.getTime();

	    	var id = r();
			object.data.push({
				"id" : id,
				"note" : "empty",
				"title" : "empty",
				"accent" : "#128C7E",
				"mode" : "text",
				"grid" : false,
				"protected" : false,
				"width" : global.dimensions.width,
				"height" : global.dimensions.height,
				"alarm" : true,
				"pin" : "0000",
				"timestamp" : n
			});

			width = global.dimensions.width;
			height = global.dimensions.height;


			global.note_retrieve = {note_string: JSON.stringify(object.data[0]), id: id, mode: 'text'};

			storage.set('notes', {number_notes: nn, notes_string: JSON.stringify(object), timestamp: n});

			global.stats.number_notes = nn;

		});
	}
});


// delete note
ipcMain.on('delete_note', function(event) {
	
	if(clients_served + 1 !== '0'){
		storage.get('notes', function(error, data) {
			setTimeout(function(){
				var id = global.note_delete.id;

				l(id, "Note deleted");

				clients_served--;

				var nn = parseInt(data.number_notes) - 1;
				var object = JSON.parse(data.notes_string);
				
				var array = object.data;

				for(var j = 0; j < array.length; j++){
					if(array[j].id === id){
						array.splice(j, 1);
					}
				}
				array.data = object.data;

	    		l('\n\n' + JSON.stringify(object), "Note string after latest delete");



				storage.set('notes', {number_notes: nn, notes_string: JSON.stringify(object)});

				global.stats.number_notes = nn;

				fb.child(id).set(null);
				event.sender.send('delete_note', 1);
				note_delete = {id: null};
			}, 0);

			//reset position for new window
			x = x - 80;
			
		});
		
	}
});




var cloud_flag = false;

var cloud_array = [];
var cloud_string = "";

var cloud_listener_active = false;

function cloud_listener(id, ns, ls){
	storage.get('user', function(error, data) {
		if(data.eemail !== null && data.eemail !== undefined) {
			fb_notes = fb.child(data.eemail).child('notes');
		}
		else 
			cloud_listener_active = false;


		fb_notes.on("value", function(snapshot) {

			if(snapshot.exists() && snapshot.val().toString !== '' && cloud_listener_active){

				cloud_string = (snapshot.val()).toString();
				cloud_array = JSON.parse(cloud_string);
				var found = false;
				for(var i = 0; i < cloud_array.data.length; i++){
		    		//replace if note backup already existed
		    		if(cloud_array.data[i].id === id){
		    			cloud_array.data[i].timestamp = ns.timestamp;
		    			cloud_array.data[i].note = ns.note;
		    			cloud_array.data[i].title = ns.title;
		    			cloud_array.data[i].accent = ns.accent;
		    			cloud_array.data[i].protected = ns.protected;
		    			cloud_array.data[i].pin = ns.pin;
		    			cloud_array.data[i].width = ns.width;
		    			cloud_array.data[i].height = ns.height;
		    			cloud_array.data[i].alarm = ns.alarm;
	    				cloud_array.data[i].grid = ns.grid;
		    			cloud_array.data[i].mode = ns.mode;
		    			found = true;

		    			l("Cloud entry replaced.");
		    		}
		    	}

		    	//node backup not present in the cloud
				if(!found){    	
    				cloud_array.data.push({
						"id" : id,
						"note" : ns.note,
						"title" : ns.title,
						"accent" : ns.accent,
						"timestamp" : ns.timestamp,
						"pin" : ns.pin,
						"protected" : false,
						"width" : width,
						"alarm" : true,
						"height" : height,
						"mode" : ns.mode
					});

	    			l("New cloud entry created.");
	    		}
	    	
				cloud_string = JSON.stringify(cloud_array);
				cloud_flag = true;


				if(cloud_flag && cloud_listener_active){
					cloud_listener_active = false;
					setTimeout(function(){
						fb_notes.set(cloud_string);
					},300);
				}

				//first cloud backup
			    else {
			    	fb_notes.set(ls);
			    	l("Local copy uploaded to cloud");
			    }
			}

		});

		

		cloud_flag = false;

	});

}


// sync
ipcMain.on('sync', function(event) {
	storage.get('user', function(error, data) {
		var d = new Date();
    	var n = d.getTime();


		storage.get('notes', function(error, data) {
			var ns = global.sync.note_string;
			var id = global.sync.id;

			cloud_listener_active = true;
			cloud_listener(id, ns, data.notes_string);

			event.sender.send('sync', 1);

		});
		
		
	});
	
	
});


// login
ipcMain.on('login', function(event) {
	fb_user = fb.child(global.login.eemail);
	fb_notes = fb_user.child("notes");
	setTimeout(function(){
		storage.set('user', {eemail: global.login.eemail, email: global.login.email});
		l("Logged in as: " + global.login.eemail);

		event.sender.send('login', 1);
		
		loginWindow = null;

		storage.get('notes', function(error, data) {
			if(data.number_notes == 0) createWindow();
		});

		fb_notes.on("value", function(snapshot) {
			if(snapshot.exists()){
				cloud_timestamp = (snapshot.val()).toString().split("!@!@!")[0];
				cloud_notes_string = (snapshot.val()).toString().split("!@!@!")[1];

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
			}

			

		}, function (errorObject) {
		});
	}, 500);
});


// skip login
ipcMain.on('skip_login', function(event) {
	cloud_listener_active = false;
	setTimeout(function(){
		storage.set('user', {user_name: "skipped", eemail: "skipped", email: "skipped"});
		l("Log in skipped");

		var d = new Date();
    	var n = d.getTime();

		event.sender.send('skip_login', 1);

		loginWindow = null;
		storage.get('notes', function(error, data) {
			if(data.number_notes == 0) {
				createWindow();
			
				var object = {data: []};
				var id = r();
				object.data.push({
					"id" : id,
					"note" : "empty",
					"title" : "empty",
					"accent" : "#128C7E",
					"mode" : "text",
					"grid" : false,
					"pin" : "0000",
					"protected" : false,
					"width" : width,
					"alarm" : true,
					"height" : height,
					"timestamp" : n
				});

				global.note_retrieve = {note_string: JSON.stringify(object.data[0]), id: id, mode: 'text'};


				storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(object), timestamp: n});
			}
		});

	}, 500);

});


// login post
ipcMain.on('login_post', function(event) {
	mainWindow = null;
	if(loginWindow === null || loginWindow === undefined) createLoginWindow();
	else {
		loginWindow.restore();
        loginWindow.show();
        loginWindow.focus();
	}

	storage.set('user', {user_name: null, eemail: null, email: null});
	global.login = {eemail: null, email: null};


});

// logout
ipcMain.on('logout', function(event) {
	if(global.logout.initiate){

		// mainWindow = null;
		// createLoginWindow();
		storage.set('user', {user_name: null, eemail: null, email: null});
		global.login = {eemail: null, email: null};
		cloud_listener_active = false;

		event.sender.send('logout', 1);
		l("Logout successful.");
	}

});

// open url
ipcMain.on('open_url', function(event) {
	if(global.open_url.url !== ''){
		require('child_process').exec('xdg-open ' + global.open_url.url);

		global.open_url = {url: null};

		event.sender.send('open_url', 1);
	}

});

function l(data, label){
	if(verbose) console.log(label + ": " + data);
}

function r(){
	return Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
}




app.on('ready', function() {
	//Ctrl + Shift + a
	var ret_accept = globalShortcut.register('ctrl+shift+a', function() {
		if(mainWindow !== undefined && mainWindow !== null){
			mainWindow.restore();
	        mainWindow.show();
	        mainWindow.focus();
    	}
    	if(loginWindow !== undefined && loginWindow !== null){
			loginWindow.restore();
	        loginWindow.show();
	        loginWindow.focus();
    	}
	});

	//Ctrl + alt + d
	var ret_accept = globalShortcut.register('ctrl+alt+d', function() {
		if(dictWidget === null) {
			createDictWidget();
			dict = true;
		}

		dictWidget.show();
		dictWidget.focus();
	});


	//Ctrl + alt + q
	var ret_accept = globalShortcut.register('ctrl+alt+q', function() {
		app.quit();
	});
});




// prevent multiple instances
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
