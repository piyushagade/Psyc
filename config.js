
'use strict';
const Config = require('electron-config');

module.exports = new Config({
	defaults: {
		lastWindowState: {
			width: 900,
			height: 600,
		},
		lastWindowPosition: {
			x: 400,
			y: 400,
		},
		alwaysOnTop: true
	}
});