'use strict';
const path = require('path');
const electron = require('electron');

const app = electron.app;
let tray = null;

exports.create = win => {
	if (process.platform === 'darwin' || tray) {
		return;
	}

	const iconPath = path.join(__dirname, 'img/icon_20.png');

	const toggleWin = () => {
		if (win.isVisible()) {
			win.hide();
		} else {
			win.show();
		}
	};

	const contextMenu = electron.Menu.buildFromTemplate([
		{
			label: 'Show/Hide',
			click() {
				toggleWin();
			}
		},
		{
			type: 'separator'
		},
		{
			role: 'quit'
		}
	]);

	tray = new electron.Tray(iconPath);
	tray.setToolTip(`${app.getName()}`);
	tray.setContextMenu(contextMenu);
	tray.on('click', toggleWin);
};

exports.setBadge = shouldDisplayUnread => {
	if (process.platform === 'darwin' || !tray) {
		return;
	}

	const icon = shouldDisplayUnread ? 'icon_unread.png' : 'icon_20.png';
	const iconPath = path.join(__dirname, `img/${icon}`);
	tray.setImage(iconPath);
};