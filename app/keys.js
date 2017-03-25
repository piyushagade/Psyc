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


	//Ctrl + alt + q
	var ret_accept = globalShortcut.register('ctrl+alt+q', function() {
		app.quit();
	});
});