accent = "#128C7E"
object = {data : []};
id = null;
isLoggedIn = true;
user_id = "user@usermail.com";
md = require('markdown-it')();
link_clicked = false;


var toggle_menu = true;

	$("#loading").removeClass('hidden');
	setTimeout(function(){
		$("#loading").fadeOut('300');
	},1000);


	$('#expanded_menu').fadeOut(0);


	$(document).on('click', 'a[href^="http"]', function(event) {
	    event.preventDefault();
	    link_clicked = true;
	    
	    var remote = require('electron').remote;
		var ipcRenderer = require('electron').ipcRenderer; 
		remote.getGlobal('open_url').url = this.href;

		ipcRenderer.send('open_url');
		ipcRenderer.on('open_url', function(event, arg) {
			if(arg == 1){
				popup("URL opened in your default browser.");
			}	
		});
	});


	// get note data from main
	// Send IPC
	var remote = require('electron').remote;
	var ipcRenderer = require('electron').ipcRenderer;   
	ipcRenderer.send('main_to_ren_data');

	ipcRenderer.on('main_to_ren_data', function(event, arg) {
		if(arg == 1){
			object = remote.getGlobal('note_retrieve').note_string;
			user_id = remote.getGlobal('login').email;

			setTimeout(function(){
				if(id === null) id = remote.getGlobal('note_retrieve').id;
				remote.getGlobal('note_delete').id = id; 

				if(remote.getGlobal('login').eemail === 'skipped') isLoggedIn = false;

				if(id === object.id){
					var heading = object.title;
					var note = object.note;
					accent = object.accent;

					if(heading !== 'empty') $('#heading').val(heading);
					if(note !== 'empty') $('#edit_note').val(note);
					if(user_id !== 'empty' || user_id !== 'skipped') $('#user_id').text(user_id);




					if($('#edit_note').val() !== "") $('#rendered_note').html(md.render($('#edit_note').val()));

					$("#accentBar").css("background", accent);
					$("#accentBarMover").css("background", accent);
					$("#heading").css("color", accent);
					$("a").css("color", accent);
					$("h1").css("color", accent);
					$("h2").css("color", accent);
					$("h3").css("color", accent);
					$("h4").css("color", accent);
					$("h5").css("color", accent);
					$("hr").css("border-color", accent);

				}
				// if($('#edit_note').val() !== "") $('#rendered_note').html($('#edit_note').parseAsMarkdown());

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

	// edit
	$('#b_edit_expanded_menu').click(function (e) {
		setTimeout(function() {	
			toggle_menu = true;
			$('#menu').fadeOut(200);
			$('#expanded_menu').fadeOut(200);
		}, 200);
		$('#edit_menu_div').fadeIn(200);
		$('#color_picker_div').fadeIn(200);
		$('#edit_note').fadeIn(200);
	});


	//switch to edit mode
	$('#rendered_note').click(function (e) {
		setTimeout(function() {	
			if(!link_clicked){	
				setTimeout(function() {	
					$('#menu').fadeOut(200);
					$('#expanded_menu').fadeOut(200);
					toggle_menu = true;
				}, 200);
				
				setTimeout(function() {	
					$('#edit_menu_div').fadeIn(200);
					$('#color_picker_div').fadeIn(200);
					$('#edit_note').fadeIn(200);
					
				}, 200);
			}
		}, 200);
		link_clicked = false;
	});



	// more
	$('#b_more').click(function (e) {
		if(toggle_menu){
			setTimeout(function() {	
				$('#expanded_menu').fadeIn(200);
			}, 200);
			$('#color_picker_div').fadeIn(200);
		}
		else{
			setTimeout(function() {	
				$('#expanded_menu').fadeOut(200);
			}, 200);
			$('#color_picker_div').fadeOut(200);
		}
		toggle_menu = !toggle_menu;
	});

	// more
	$('#b_more_expanded_menu').click(function (e) {
		if(toggle_menu){
			setTimeout(function() {	
				$('#expanded_menu').fadeIn(200);
			}, 200);
			$('#color_picker_div').fadeIn(200);
		}
		else{
			setTimeout(function() {	
				$('#expanded_menu').fadeOut(200);
			}, 200);
			$('#color_picker_div').fadeOut(200);
		}
		toggle_menu = !toggle_menu;
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


	//update note body
	$('#edit_note').bind('input propertychange', function() {
	  	// Send IPC
	 	var remote = require('electron').remote;

		var d = new Date();
    	var n = d.getTime();

	 	var object = {};
		
		object.id = id;
		object.note = $('#edit_note').val();
		object.title = $('#heading').val();
		object.accent = accent;
		object.timestamp = n;

		remote.getGlobal('note_update').note_string = object;

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('ren_to_main_data');
	 
		ipcRenderer.on('ren_to_main_data', function(event, arg) {
			if(arg==1){

			}	
		});
	});

	$('#heading').bind('input propertychange', function() {
	  	// Send IPC
	 	var remote = require('electron').remote;
		
		var d = new Date();
    	var n = d.getTime();
    	
	 	var object = {};
		
		object.id = id;
		object.note = $('#edit_note').val();
		object.title = $('#heading').val();
		object.accent = accent;
		object.timestamp = n;

		remote.getGlobal('note_update').note_string = object;

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('ren_to_main_data');
	 
		ipcRenderer.on('ren_to_main_data', function(event, arg) {
			if(arg==2){

			}	
		});
	});

	// save
	$('#b_edit_menu_save').click(function (e) {
		setTimeout(function() {	
			$('#edit_menu_div').fadeOut(200);
			$('#color_picker_div').fadeOut(200);
			$('#edit_note').fadeOut(200);
		}, 200);
		$('#menu').fadeIn(200);
		if($('#edit_note').val() !== "") $('#rendered_note').html(md.render($('#edit_note').val()));
		else  $('#rendered_note').html("<font size='2px' color='#AAA'>To edit, you can click here, or use the 'Edit' icon to enter edit mode.</font>");

		
		$("a").css("color", accent);
		$("h1").css("color", accent);
		$("h2").css("color", accent);
		$("h3").css("color", accent);
		$("h4").css("color", accent);
		$("h5").css("color", accent);
		$("hr").css("border-color", accent);

	});

	// save
	$('#b_edit_menu_save_expanded_menu').click(function (e) {
		setTimeout(function() {	
			toggle_menu = true;
			$('#expanded_menu').fadeOut(200);
			$('#edit_menu_div').fadeOut(200);
			$('#color_picker_div').fadeOut(200);
			$('#edit_note').fadeOut(200);
		}, 200);
		$('#menu').fadeIn(200);
		if($('#edit_note').val() !== "") $('#rendered_note').html(md.render($('#edit_note').val()));
		else  $('#rendered_note').html("<font size='2px' color='#AAA'>To edit, you can click here, or use the 'Edit' icon to enter edit mode.</font>");


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

	// delete
	$('#b_edit_menu_delete_expanded_menu').click(function (e) {
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
	 	var remote = require('electron').remote;
		if(remote.getGlobal('login').eemail === 'skipped' || remote.getGlobal('login').eemail === null) isLoggedIn = false;
		else isLoggedIn = true;

		if(isLoggedIn){
			$('#b_sync').fadeOut(400);

				$('#b_sync').attr("src","img/busy.png");
				$('#b_sync').fadeIn(100);

		  	// Send IPC
		 	var remote = require('electron').remote;
		 	var object = {};
			
			var d = new Date();
	    	var n = d.getTime();

			object.id = id;
			object.note = $('#edit_note').val();
			object.title = $('#heading').val();
			object.accent = accent;
			object.timestamp = n;

			remote.getGlobal('sync').note_string = object; 
			remote.getGlobal('sync').id = id; 

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('sync');
		 
			ipcRenderer.on('sync', function(event, arg) {
				if(arg == 1){

					popup("Note synced to cloud.");

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
		}
		else{

			setTimeout(function(){
				$('#b_sync').attr("src","img/sync.png");
			}, 400);

			popup("You should be signed in to be able to sync.");

			$('#user_login_menu').removeClass('hidden');
			$('#user_login_menu').fadeOut(0);
			setTimeout(function(){
				$('#user_login_menu').fadeIn(200);
			}, 300);
		}
	});

	//sync
	$('#b_sync_expanded_menu').click(function (e) {
	 	var remote = require('electron').remote;
		if(remote.getGlobal('login').eemail === 'skipped' || remote.getGlobal('login').eemail === null) isLoggedIn = false;
		else isLoggedIn = true;

		if(isLoggedIn){
			$('#b_sync_expanded_menu').fadeOut(400);

				$('#b_sync_expanded_menu').attr("src","img/busy.png");
				$('#b_sync_expanded_menu').fadeIn(100);

		  	// Send IPC
		 	var remote = require('electron').remote;
		 	var object = {};
			
			var d = new Date();
	    	var n = d.getTime();

			object.id = id;
			object.note = $('#edit_note').val();
			object.title = $('#heading').val();
			object.accent = accent;
			object.timestamp = n;

			remote.getGlobal('sync').note_string = object; 
			remote.getGlobal('sync').id = id; 

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('sync');
		 
			ipcRenderer.on('sync', function(event, arg) {
				if(arg == 1){

					popup("Note synced to cloud.");

					$('#b_sync_expanded_menu').fadeIn(400);
					setTimeout(function(){	
						$('#b_sync_expanded_menu').attr("src","img/done.png");
					}, 400);

					setTimeout(function(){
						$('#b_sync_expanded_menu').fadeOut(400);
						
						setTimeout(function(){
							$('#b_sync_expanded_menu').fadeIn(400);
						}, 400);

						setTimeout(function(){
							$('#b_sync_expanded_menu').attr("src","img/sync.png");

							setTimeout(function(){
								$('#expanded_menu').fadeOut(200);
								toggle_menu = true;
							}, 1200);

						}, 400);

					}, 2000);
				}	
			});
		}
		else{

			setTimeout(function(){
				$('#b_sync_expanded_menu').attr("src","img/sync.png");
			}, 400);

			popup("You should be signed in to be able to sync.");

			$('#user_login_menu').removeClass('hidden');
			$('#user_login_menu').fadeOut(0);
			setTimeout(function(){
				$('#user_login_menu').fadeIn(200);
			}, 300);
		}
	});

	//user menu
	$('#b_edit_menu_user').click(function (e) {
		if(remote.getGlobal('login').eemail === 'skipped' || remote.getGlobal('login').eemail === null) isLoggedIn = false;
		else isLoggedIn = true;

		if(isLoggedIn){
			if(user_id !== 'empty') $('#user_id').text(user_id);

			$('#user_menu').removeClass('hidden');
			$('#user_menu').fadeOut(0);

			$('#user_menu').fadeIn(200);
		}
		else{
			$('#user_login_menu').removeClass('hidden');
			$('#user_login_menu').fadeOut(0);

			$('#user_login_menu').fadeIn(200);
		}
	});

	//user menu back
	$('#b_user_menu_back').click(function (e) {
		$('#user_menu').fadeOut(200);

		if(user_id !== 'empty') $('#user_id').text(user_id);

		setTimeout(function(){
			$('#user_menu').addClass('hidden');
		}, 200);
	});

	//user login menu back
	$('#b_user_login_menu_back').click(function (e) {
		$('#user_login_menu').fadeOut(200);
		setTimeout(function(){
			$('#user_login_menu').addClass('hidden');
		}, 200);
	});

	//user menu log out
	$('#b_user_menu_log_out').click(function (e) {
		$('#user_menu').fadeOut(200);
		setTimeout(function(){
			// Send IPC
		 	var remote = require('electron').remote;

			remote.getGlobal('logout').initiate = true;
			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('logout');

		}, 200);
	});

	//user login menu log in
	$('#b_user_login_menu_log_in').click(function (e) {
		$('#user_login_menu').fadeOut(200);
		setTimeout(function(){
			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('login_post');

			// const remote = require('electron').remote;
			// var window = remote.getCurrentWindow();
			// window.close();
		}, 200);
	});

	//listen for logout initiation
	var ipcRenderer = require('electron').ipcRenderer;   
 
	ipcRenderer.on('logout', function(event, arg) {
		if(arg == 1 && remote.getGlobal('logout').initiate){
			popup("Successfully logged out.")
			
			isLoggedIn = false;
			// const remote = require('electron').remote;
			// var window = remote.getCurrentWindow();
			// window.close();
		}	
	});

	$("#b_edit_menu_color").spectrum({
	    showPaletteOnly: true,
	    showPalette:true,
	    cancelText: 'Cancel',
	    showAlpha: false,
	    showButtons: true,
	    chooseText: "Select",
	    palette: [
	        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
	        ["#f00","#f90","#ff0","#0f0","#128C7E","#00f","#90f","#f0f"],
	        // ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
	        // ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
	        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
	        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
	        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
	        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
	    ],
	    change: function (color) {
	        setColor(color.toHexString());
			$("#accentBar").css("background",color);
			$("#accentBarMover").css("background",color);
			$("#heading").css("color",color);
			accent = color.toHexString();

			$("a").css("color", accent);
			$("h1").css("color", accent);
			$("h2").css("color", accent);
			$("h3").css("color", accent);
			$("h4").css("color", accent);
			$("h5").css("color", accent);
			$("hr").css("border-color", accent);

			// Send IPC
		 	var remote = require('electron').remote;
			
			var d = new Date();
	    	var n = d.getTime();
	    	
		 	var object = {};
		
			object.id = id;
			object.note = $('#edit_note').val();
			object.title = $('#heading').val();
			object.accent = accent;
			object.timestamp = n;

			remote.getGlobal('note_update').note_string = object;

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('ren_to_main_data');
	    }
	});

	// add note
	$('#b_add').click(function (e) {
		var remote = require('electron').remote;
		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('new_note');
	});

	// add note
	$('#b_add_expanded_menu').click(function (e) {
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



$('#accentBar').mouseover(function() {
  $('#accentBarMover').slideDown();
});

$('#accentBar').mouseout(function() {
  $('#accentBarMover').slideUp();
});


function popup(data){
	$("#popup").html(data);
	$("#popup").slideDown().delay(1500).slideUp();

}





remote = require('electron').remote;
win = remote.getCurrentWindow();


// electronLocalshortcut.register(win, 'Ctrl+S');

// alert(electronLocalshortcut.isRegistered(win, 'ctrl+s'));


