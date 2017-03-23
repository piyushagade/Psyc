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
global.note_retrieve = {note_string: null, id: null, mode: 'text'};
global.note_delete = {id: null};
global.sync = {note_string: null, id: null};
global.login = {eemail: null, email: null};
global.logout = {initiate: false};
global.open_url = {url: null};
global.debug = {on: false, reset: false};



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
	  width: debug_add + 525, 
      height: debug_add + 525, 
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

    	storage.get('notes', function(error, data) {

			var d = new Date();
	    	var n = d.getTime();

    		//if first run
		    if(data.number_notes === null || data.number_notes === undefined || user_name === "not_set"){
  				l("Welcome new user.");

		    	var object = {data: []};

				object.data.push({
					"id" : r(),
					"note" : "empty",
					"title" : "empty",
					"accent" : "#128C7E",
					"mode" : "text",
					"timestamp" : n
				});



				storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(object), timestamp: n});


    			l(data.number_notes,"Notes found");

    			if(data.number_notes > 0){
	    			for(var i = 0; i < parseInt(data.number_notes); i++){
			    		setTimeout(function(){
	  						loginWindow = null;
			    			createWindow();
			    		}, 700 * i); 
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
					"mode" : "text",
					"timestamp" : n
				});

	    		storage.set('notes', { number_notes: 1, notes_string: JSON.stringify(object), timestamp: n});
	    	}
	    	//few notes saved && logged in
		    else{
		    	for(var i = 0; i < parseInt(data.number_notes); i++){
	    			l(data.number_notes,"Notes found");

		    		setTimeout(function(){
  						loginWindow = null;
		    			createWindow();
		    		}, 700 * i); 
		    	}

		    	//Set global object
		    	notes_string = data.notes_string;
		    }  

		});

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

	    	var array = object.data;
	    	for(var i = 0; i < array.length; i++){
	    		if(array[i].id === id){
	    			array[i].note = ns.note;
	    			array[i].title = ns.title;
	    			array[i].accent = ns.accent;
	    			array[i].mode = ns.mode;
	    			array[i].timestamp = n;
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



// new note
ipcMain.on('new_note', function(event) {
	
	if(clients_served <= 7){
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
				"timestamp" : n
			});


			global.note_retrieve = {note_string: JSON.stringify(object.data[0]), id: id, mode: 'text'};

			storage.set('notes', {number_notes: nn, notes_string: JSON.stringify(object), timestamp: n});

		});
	}
});


// delete note
ipcMain.on('delete_note', function(event) {
	
	if(clients_served + 1 !== '0'){
		storage.get('notes', function(error, data) {
			setTimeout(function(){
				var id = global.note_delete.id;

				l("Note deleted: " + id);

				var nn = parseInt(data.number_notes) - 1;
				var object = JSON.parse(data.notes_string);
				object.data.splice(id--, 1);

				storage.set('notes', {number_notes: nn, notes_string: JSON.stringify(object)});

				fb.child(id).set(null);
				event.sender.send('delete_note', 1);
				note_delete = {id: null};
			}, 0);
			
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
});