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