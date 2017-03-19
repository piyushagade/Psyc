accent = "#128C7E"
note_string = [];
id = null;


	// get note data from main
	// Send IPC
	var remote = require('electron').remote;
	var ipcRenderer = require('electron').ipcRenderer;   
	ipcRenderer.send('main_to_ren_data');

	ipcRenderer.on('main_to_ren_data', function(event, arg) {
		if(arg == 1){
			note_string = (remote.getGlobal('note_retrieve').note_string).split("!@#");
			setTimeout(function(){
				id = (remote.getGlobal('note_retrieve').id);
				remote.getGlobal('note_delete').id = id; 
				
				var heading = note_string[1];
				var note = note_string[2];
				accent = note_string[3];

				if(heading !== 'empty') $('#heading').val(heading);
				if(note !== 'empty') $('#edit_note').val(note);
				if($('#edit_note').val() !== "") $('#rendered_note').html($('#edit_note').parseAsMarkdown());

				$("#accentBar").css("background", accent);
				$("#heading").css("color", accent);
			}, 0);
		}	
	});


	// edit
	$('#b_edit').click(function (e) {
		setTimeout(function() {	
			$('#menu').fadeOut(200);
		}, 200);
		$('#edit_menu_div').fadeIn(200);
		$('#color_picker_div').fadeIn(200);
		$('#edit_note').fadeIn(200);
	});

	// for(var i = 0; i < 100000; i++)
	// setTimeout(function(){
	//   	// Send IPC
	//  	var remote = require('electron').remote;
	// 	remote.getGlobal('note_update').note_string = id + "!@#" + $('#heading').val() + "!@#" + $('#edit_note').val() + "!@#" + accent; 

	// 	var ipcRenderer = require('electron').ipcRenderer;   
	// 	ipcRenderer.send('ren_to_main_data');
	 
	// 	ipcRenderer.on('ren_to_main_data', function(event, arg) {
	// 		if(arg==2){

	// 		}	
	// 	});
	// 	if(i == 99999) i = 0;

	// }, 5000 * i);

	$('#edit_note').bind('input propertychange', function() {
	  	// Send IPC
	 	var remote = require('electron').remote;
		remote.getGlobal('note_update').note_string = id + "!@#" + $('#heading').val() + "!@#" + $('#edit_note').val() + "!@#" + accent; 

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('ren_to_main_data');
	 
		ipcRenderer.on('ren_to_main_data', function(event, arg) {
			if(arg==2){

			}	
		});
	});

	$('#heading').bind('input propertychange', function() {
	  	// Send IPC
	 	var remote = require('electron').remote;
		remote.getGlobal('note_update').note_string = id + "!@#" + $('#heading').val() + "!@#" + $('#edit_note').val() + "!@#" + accent; 

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('ren_to_main_data');
	 
		ipcRenderer.on('ren_to_main_data', function(event, arg) {
			if(arg==2){

			}	
		});
	});

	$('#rendered_note').click(function (e) {
		setTimeout(function() {	
			$('#menu').fadeOut(200);
		}, 200);
		
		setTimeout(function() {	
			$('#edit_menu_div').fadeIn(200);
			$('#color_picker_div').fadeIn(200);
			$('#edit_note').fadeIn(200);
			
		}, 200);
	});

	// save
	$('#b_edit_menu_save').click(function (e) {
		setTimeout(function() {	
			$('#edit_menu_div').fadeOut(200);
			$('#color_picker_div').fadeOut(200);
			$('#edit_note').fadeOut(200);
		}, 200);
		$('#menu').fadeIn(200);
		if($('#edit_note').val() !== "") $('#rendered_note').html($('#edit_note').parseAsMarkdown());
		else  $('#rendered_note').html("<font size='2px' color='#AAA'>To edit, you can click here, press 'Enter', or use the 'Edit' icon to enter edit mode.</font>");
	});


	// delete
	$('#b_edit_menu_delete').click(function (e) {
	  	// Send IPC
	 	var remote = require('electron').remote;
		remote.getGlobal('note_delete').id = id; 

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('delete_note');
	 
		ipcRenderer.on('delete_note', function(event, arg) {
			if(arg == 1){
				const remote = require('electron').remote;
				var window = remote.getCurrentWindow();

				window.close();
			}	
		});
	});

	//sync
	$('#b_sync').click(function (e) {
		$('#b_sync').fadeOut(400);


	  	// Send IPC
	 	var remote = require('electron').remote;
		remote.getGlobal('sync').note_string = id + "!@#" + $('#heading').val() + "!@#" + $('#edit_note').val() + "!@#" + accent; 
		remote.getGlobal('sync').id = id; 

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('sync');
	 
		ipcRenderer.on('sync', function(event, arg) {
			if(arg == 1){

				$('#b_sync').fadeIn(400);
				setTimeout(function(){	
					$('#b_sync').attr("src","img/done.png");
				}, 400);

				setTimeout(function(){
					$('#b_sync').fadeOut(400);
					
					setTimeout(function(){
						$('#b_sync').fadeIn(400);
					}, 400);

					setTimeout(function(){
						$('#b_sync').attr("src","img/sync.png");
					}, 400);

				}, 2000);
			}	
		});
	});

	$("#b_edit_menu_color").spectrum({
	    showPaletteOnly: true,
	    showPalette:true,
	    color: accent,
	    cancelText: 'Cancel',
	    showAlpha: false,
	    showButtons: true,
	    chooseText: "Select",
	    palette: [
	        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
	        ["#f00","#f90","#ff0","#0f0","#128C7E","#00f","#90f","#f0f"],
	        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
	        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
	        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
	        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
	        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
	        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
	    ],
	    change: function (color) {
	        setColor(color.toHexString());
			$("#accentBar").css("background",color);
			$("#heading").css("color",color);
			accent = color.toHexString();

			// Send IPC
		 	var remote = require('electron').remote;
			remote.getGlobal('note_update').note_string = id + "!@#" + $('#heading').val() + "!@#" + $('#edit_note').val() + "!@#" + accent; 

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('ren_to_main_data');
	    }
	});

	// add
	$('#b_add').click(function (e) {
		var remote = require('electron').remote;
		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('new_note');
	});


// var edit_toggle = false;
// $(document).ready(function() {
//     $(this).on('keypress', function(event) {
//         if (event.keyCode == 13) {
//         	if(!edit_toggle){
// 	            setTimeout(function() {	
// 					$('#menu').fadeOut(200);
// 				}, 200);
// 				$('#edit_menu_div').fadeIn(200);
// 				$('#color_picker_div').fadeIn(200);
// 				$('#edit_note').fadeIn(200);
// 			}
// 			else{
// 				setTimeout(function() {	
// 					$('#edit_menu_div').fadeOut(200);
// 					$('#color_picker_div').fadeOut(200);
// 					$('#edit_note').fadeOut(200);
// 				}, 200);
// 				$('#menu').fadeIn(200);
// 				if($('#edit_note').val() !== "") $('#rendered_note').html($('#edit_note').parseAsMarkdown());
// 				else  $('#rendered_note').html("<font size='2px' color='#AAA'>To edit, you can click here, press 'Enter', or use the 'Edit' icon to enter edit mode.</font>");
		
// 			}
// 			edit_toggle = !edit_toggle;
//         }
//     });

//     $(this).on('keypress', function(event) {
//         if (event.keyCode == 115) {
//         	$('#b_sync').fadeOut(400);


// 		  	// Send IPC
// 		 	var remote = require('electron').remote;
// 			remote.getGlobal('sync').note_string = id + "!@#" + $('#heading').val() + "!@#" + $('#edit_note').val() + "!@#" + accent; 
// 			remote.getGlobal('sync').id = id; 

// 			var ipcRenderer = require('electron').ipcRenderer;   
// 			ipcRenderer.send('sync');
		 
// 			ipcRenderer.on('sync', function(event, arg) {
// 				if(arg == 1){

// 					$('#b_sync').fadeIn(400);
// 					setTimeout(function(){	
// 						$('#b_sync').attr("src","img/done.png");
// 					}, 400);

// 					setTimeout(function(){
// 						$('#b_sync').fadeOut(400);
						
// 						setTimeout(function(){
// 							$('#b_sync').fadeIn(400);
// 						}, 400);

// 						setTimeout(function(){
// 							$('#b_sync').attr("src","img/sync.png");
// 						}, 400);

// 					}, 2000);
// 				}	
// 			});
//         }
//     });



//     $(this).on('keypress', function(event) {
//         if (event.keyCode == 110) {
// 			var remote = require('electron').remote;
// 			var ipcRenderer = require('electron').ipcRenderer;   
// 			ipcRenderer.send('new_note');
//         }
//     });
// })