$(document).ready(function(){
     // get focus to text box
    Mousetrap.bind('alt+r', function() { 
        //request focus
		window.setTimeout(function ()
    	{
    		window.location.reload()
    	},0);
    });


    $(document).on('click', 'a[href^="http"]', function(event) {
	    event.preventDefault();
	    link_clicked = true;
	    
	    var remote = require('electron').remote;
		var ipcRenderer = require('electron').ipcRenderer; 
		remote.getGlobal('open_url').url = this.href;

		ipcRenderer.send('open_url');
		ipcRenderer.on('open_url', function(event, arg) {
			if(arg == 1){
			}	
		});
	});


	$('#accentBar').mouseover(function() {
	  $('#accentBarMover').slideDown();
	});

	$('#accentBar').mouseout(function() {
	  $('#accentBarMover').slideUp();
	});

});