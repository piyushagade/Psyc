$(document).ready(function() {
	var accent = "#128C7E"
	var object = {data : []};
	var id = null;
	var isLoggedIn = true;
	var user_id = "user@usermail.com";
	var md = require('markdown-it')();
	var link_clicked = false;
	var mode = "text";

	var storage = require('electron-json-storage');
	
	var toggle_menu = true;
	todo_object = {data: []};
	todo_count = 1;
	delete_item_mode = false;

	setTimeout(function(){
		$("#loading").fadeOut('300');
		setTimeout(function(){
			$("#loading").removeClass('hidden');
		},400);
	},1000);


	$('#expanded_menu').fadeOut(0);

	$('#todo_note').fadeOut(0);


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


	$(document).on('click', '#rendered_note ol li', function(event) {
	    link_clicked = true;
	    if(!~($(this).text().indexOf("Completed")))
	    	$(this).html('<span style="color:red; text-decoration: line-through;"><span style="color: #111">' + $(this).text() + '</span></span> <span style="float: right; opacity: 0.6; color:#aaa">Completed</font></span>');
	    else{
	    	var string = $(this).text().replace('Completed','');
	    	$(this).html('<font style="text-decoration: none;">' + string);
	    }
	});


	// get note data from main
	// Send IPC
	var remote = require('electron').remote;
	var ipcRenderer = require('electron').ipcRenderer;   
	ipcRenderer.send('main_to_ren_data');

	ipcRenderer.on('main_to_ren_data', function(event, arg) {
		if(arg == 1){
			//get note object
			object = remote.getGlobal('note_retrieve').note_string;
			//user email
			user_id = remote.getGlobal('login').email;

			setTimeout(function(){
				// get note id
				if(id === null){
					id = remote.getGlobal('note_retrieve').id;
					mode = remote.getGlobal('note_retrieve').mode;
				}

				//set ui  according to mode
				if(mode === 'text'){
					$("#rendered_note").fadeIn(0);
				}
				else if(mode === 'todo'){
					$("#todo_note").fadeIn(0);
				}

				//check if user is logged in or not
				if(remote.getGlobal('login').eemail === 'skipped') isLoggedIn = false;


				//set up ui and note
				if(id === object.id){
					var heading = object.title;

					var note = object.note;
					accent = object.accent;

					if(heading !== 'empty') $('#heading').val(heading);
					
					if(mode === 'text' && note !== 'empty') {
						$('#edit_note').val(note);


						//enable template menu
						$("#b_insert").removeClass('hidden');

						//disable todo item delete button
						$('#b_todo_delete_item').addClass('hidden');
					}
					else if(mode === 'todo'){

						//disable template menu
						$("#b_insert").addClass('hidden');

						//enable todo item delete button
						$('#b_todo_delete_item').removeClass('hidden');

						todo_object = JSON.parse(note);		//object
						l(note, "Object recieved");

						if(todo_object === null) todo_object = {data: []};

						$('#ol').html("");
						var todo_array = todo_object.data;

						for(var i = 0; i < todo_array.length; i++){
							//if(current item is not empty or deleted)
							if(todo_array[i] !== '' && todo_array[i].item.trim() !== 'empty' && todo_array[i].item.trim() !== '&deleted'){
								todo_count++;
								//if current item is unmarked
								if(!todo_array[i].marked)
									$('#ol').append('<li style="border: 1px dashed #BBB;">' + todo_array[i].item + '</li>');
								//if current item is marked
								else if(todo_array[i].marked)
									$('#ol').append('<li style="border: 1px solid' + accent +';"><span class="marked_item"><span style="color: #111">' + todo_array[i].item + '</span></span></li>');
							}
						}
						if(todo_count >1){
								$("#empty_ol").addClass('hidden');
								$("#ol").removeClass('hidden');

						}
						//if todo has no active items
						else if(todo_count <= 1){
							$("#empty_ol").removeClass('hidden');
							$("#ol").addClass('hidden');
						}
					}



					if(user_id !== 'empty' || user_id !== 'skipped') $('#user_id').text(user_id);

					if($('#edit_note').val() !== "" && mode === 'text') $('#rendered_note').html(md.render($('#edit_note').val()));

					//general ui
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
					$("th").css("color", accent);
    				$("tr:odd").css("background-color", "rgba(220,220,220, 0.5468)");
					$(".todo_button").css("background", accent);

				}
			}, 0);
		}	
	});



	// switch to text mode
	$('#b_text_mode').click(function (e) {
		if(mode !== 'text'){
			hideAllModes();


			//enable template menu
			$("#b_insert").removeClass('hidden');

			//disable todo item delete button
			$('#b_todo_delete_item').addClass('hidden');

			//switch back to main menu
			setTimeout(function() {	
				$('#edit_menu_div').fadeOut(200);
				$('#expanded_menu').fadeOut(200);
				$('#color_picker_div').fadeOut(200);
			}, 200);
			$('#menu').fadeIn(200);

			$('#rendered_note').fadeIn(200);
			mode = 'text';

			// Send IPC
		 	var remote = require('electron').remote;
			var d = new Date();
	    	var n = d.getTime();

		 	var object = {};
			object.id = id;
			object.note = $('edit_note').val();
			object.title = $('#heading').val();
			object.accent = accent;
			object.mode = mode;
			object.timestamp = n;

			remote.getGlobal('note_update').note_string = object;

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('ren_to_main_data');
		 
			var k = 0;
			ipcRenderer.on('ren_to_main_data', function(event, arg) {
				if(arg==1 && k == 0){
					popup("Switched to markdown text mode.");
					k++;
				}	
			});
		}
	});

	// switch to todo mode
	$('#b_todo_mode').click(function (e) {
		if(mode !== 'todo'){
			hideAllModes();

			//disable template menu
			$("#b_insert").addClass('hidden');
			$("#template_menu").slideUp();
			template_menu_toggle = false;

			//enable todo item delete button
			$('#b_todo_delete_item').removeClass('hidden');

			//switch back to main menu
			setTimeout(function() {	
				$('#edit_menu_div').fadeOut(200);
				$('#expanded_menu').fadeOut(200);
				$('#color_picker_div').fadeOut(200);
			}, 200);
			$('#menu').fadeIn(200);

			$("#empty_ol").removeClass('hidden');
			$("#ol").addClass('hidden');

			setTimeout(function() {	
				$('#edit_menu_div').fadeOut(200);
				$('#color_picker_div').fadeOut(200);
				$('#edit_note').fadeOut(200);
			}, 200);
			$('#menu').fadeIn(200);

			$('#ol').html("");
			todo_count = 1;

			$('#todo_note').fadeIn(200);
			mode = 'todo';

			todo_object = {data : []};


			todo_object.data.push({
				'id' : r(),
				'item' : 'empty',
				'marked' : false
			});


			// Send IPC
		 	var remote = require('electron').remote;
			var d = new Date();
	    	var n = d.getTime();

		 	var object = {};
			object.id = id;
			object.note = JSON.stringify(todo_object);
			object.title = $('#heading').val();
			object.accent = accent;
			object.mode = mode;
			object.timestamp = n;



			remote.getGlobal('note_update').note_string = object;

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('ren_to_main_data');
		 
			var k = 0;
			ipcRenderer.on('ren_to_main_data', function(event, arg) {
				if(arg==1 && k ==0){
					popup("Switched to to-do mode.");
					k++;
				}	
			});
		}
	});

	function hideAllModes(){
		$('#rendered_note').fadeOut(80);
		$('#todo_note').fadeOut(80);
	}



	// add a new list item
	$('#add_li').click(function (e) {

		var d = new Date();
    	var n = d.getTime();
    	
		// todo_object = {[]};

		//If current item to be added is not empty
		if($('#new_li').val().trim() !== '') {
			todo_count++;


			todo_object.data.push({
				'id' : r(),
				'item' : $('#new_li').val(),
				'marked' : false
			});

			l($('#new_li').val(), "New item added");

			$('#ol').append('<li>' + $('#new_li').val() + '</li>');
			$('#new_li').val('');

			$("#empty_ol").addClass('hidden');
			$("#ol").removeClass('hidden');

			// Send IPC
		 	var remote = require('electron').remote;
			var d = new Date();
	    	var n = d.getTime();

		 	var object = {};
			object.id = id;
			object.note = JSON.stringify(todo_object);
			object.title = $('#heading').val();
			object.accent = accent;
			object.mode = mode;
			object.timestamp = n;

			l(JSON.stringify(todo_object), "Object persisted");

			remote.getGlobal('note_update').note_string = object;

			var ipcRenderer = require('electron').ipcRenderer;   
			ipcRenderer.send('ren_to_main_data');
		}
	});


	// list item click action
	var clicked_once = false;
	var clicked_on = "";
	$(document).on('click', '#ol li', function(event) {
		//if current item is pending and should be marked as completed
	    if(!~($(this).text().indexOf("&Completed")) && !(~($(this).html().indexOf("marked_item"))) && !delete_item_mode){

	    	$(this).css('border', '1px solid ' + accent);

	    	$(this).html('<span class="marked_item"><span style="color: #111">' + $(this).html() + '</span><span style="width: 0px; opacity: 0.0; font-size: 0;">&Completed</font></span></span>');
			clicked_once = true;
			clicked_on = $(this).text().replace('&Completed','');

			var todo_array = todo_object.data;

			for(var i = 1; i < todo_array.length; i++){
				if(todo_array[i].item.trim() === $(this).text().replace('&Completed','').trim()){
					todo_array[i].marked = true;
				}
			}

			todo_object.data = todo_array;

	    	l(JSON.stringify(todo_object), "todo_object being sent after marking");
		}
		//delete current todo item
	  	else if(delete_item_mode){
	  		$(this).closest('li').remove();

	    	var todo_array = todo_object.data;
			for(var i = 1; i < todo_array.length; i++){
				if(todo_array[i].item.trim() === $(this).text().replace('&Completed','').trim()){
					todo_array[i].item = '&deleted';
					todo_count--;
				}
			}

	    	//check if list item count is > 0
	    	if(todo_count == 1){
	    		$("#empty_ol").removeClass('hidden');
				$("#ol").addClass('hidden');

				clicked_once = false;
				$('#b_todo_delete_item').attr("src","img/delete_item.png");
				delete_item_mode = false;

				// switch from edit menu to default menu
				setTimeout(function() {	
					$('#edit_menu_div').fadeOut(200);
					$('#color_picker_div').fadeOut(200);
					$('#edit_note').fadeOut(200);
				}, 200);
				$('#menu').fadeIn(200);
			}
	  	}
	    //item needs to be unmarked
	    else{
	    	var string = $(this).text().replace('&Completed','');

	    	$(this).css('border', '1px dashed ' + '#BBB');

	    	$(this).html('<font style="text-decoration: none;">' + string);
	    	clicked_once = false;
			clicked_on = "";


			var todo_array = todo_object.data;
			for(var i = 1; i < todo_array.length; i++){
				if(todo_array[i].item.trim() === $(this).text().replace('&Completed','').trim()){
					todo_array[i].marked = false;
				}
			}

			todo_object.data = todo_array;

	    	l(JSON.stringify(todo_object), "todo_object being sent after unmarking");
	    }
			
		// Send IPC
	 	var remote = require('electron').remote;
		var d = new Date();
    	var n = d.getTime();

	 	var object = {};
		object.id = id;
		object.note = JSON.stringify(todo_object);
		object.title = $('#heading').val();
		object.accent = accent;
		object.mode = mode;
		object.timestamp = n;


		remote.getGlobal('note_update').note_string = object;

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('ren_to_main_data');
	});

	// switch to delete item mode
	$('#b_todo_delete_item').click(function (e) {
		delete_item_mode = !delete_item_mode;
		clicked_once = true;
		if(delete_item_mode){ 
			$('#b_todo_delete_item').attr("src","img/delete_item_mode_on.png");
			popup("Click on the items you wish to delete.");
		}
		else {
			clicked_once = false;
			$('#b_todo_delete_item').attr("src","img/delete_item.png");
		}
	});

	// switch to edit mode from menu icon
	$('#b_edit').click(function (e) {
		setTimeout(function() {	
			$('#menu').fadeOut(200);
		}, 200);
		$('#edit_menu_div').fadeIn(200);
		$('#color_picker_div').fadeIn(200);
		l("Switching to edit menu", mode);
		

		if(mode === 'text'){
			$('#edit_note').removeClass('hidden'); 
			$('#edit_note').fadeOut(0);
			$('#edit_note').fadeIn(200);

			$('#b_todo_delete_item').addClass('hidden');
		}
		else if(mode === 'todo') $('#edit_note').addClass('hidden');
	});

	// switch to edit mode from menu icon
	$('#b_edit_expanded_menu').click(function (e) {
		setTimeout(function() {	
			toggle_menu = true;
			$('#menu').fadeOut(200);
			$('#expanded_menu').fadeOut(200);
		}, 200);
		$('#edit_menu_div').fadeIn(200);
		$('#color_picker_div').fadeIn(200);
		
		if(mode === 'text'){
			$('#edit_note').removeClass('hidden'); 
			$('#edit_note').fadeOut(0);
			$('#edit_note').fadeIn(200);

			$('#b_todo_delete_item').addClass('hidden');
		}
		else if(mode === 'todo') $('#edit_note').addClass('hidden');
	});


	//switch to edit mode by clicking on rendered note
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

				if(mode === 'text') $('#b_todo_delete_item').addClass('hidden');
			}
		}, 200);
		link_clicked = false;
	});



	// show more options
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

	// show more options
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


	//update text note in text mode
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
		object.mode = 'text';
		object.timestamp = n;


		remote.getGlobal('note_update').note_string = object;

		var ipcRenderer = require('electron').ipcRenderer;   
		ipcRenderer.send('ren_to_main_data');
	 
		ipcRenderer.on('ren_to_main_data', function(event, arg) {
			if(arg==1){

			}	
		});
	});

	// update title
	$('#heading').bind('input propertychange', function() {
	  	// Send IPC
	 	var remote = require('electron').remote;
		
		var d = new Date();
    	var n = d.getTime();
    	
	 	var object = {};
		
		object.id = id;
		if(mode === 'text') object.note = $('#edit_note').val();
		else if(mode === 'todo') object.note = JSON.stringify(todo_object);
		object.title = $('#heading').val();
		object.accent = accent;
		object.mode = mode;
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

		if(template_menu_toggle){
			$('#template_menu').slideUp();
			template_menu_toggle = false;
		}

		if(mode === 'todo'){
			delete_item_mode = false;
			$('#b_todo_delete_item').attr("src","img/delete_item.png");
		}
		
		$("a").css("color", accent);
		$("h1").css("color", accent);
		$("h2").css("color", accent);
		$("h3").css("color", accent);
		$("h4").css("color", accent);
		$("h5").css("color", accent);
		$("hr").css("border-color", accent);
		$("th").css("color", accent);
		$("tr:odd").css("background-color", "rgba(220,220,220, 0.5468)");
		$(".todo_button").css("background", accent);

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

		if(template_menu_toggle){
			$('#template_menu').slideUp();
			template_menu_toggle = false;
		}

		if(mode === 'todo'){
			delete_item_mode = false;
			$('#b_todo_delete_item').attr("src","img/delete_item.png");
		}
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
			$("th").css("color", accent);
			$("tr:odd").css("background-color", "rgba(220,220,220, 0.5468)");
			$(".todo_button").css("background", accent);

			$(".marked_item").css("border-color", accent);

			// Send IPC
		 	var remote = require('electron').remote;
			
			var d = new Date();
	    	var n = d.getTime();
	    	
		 	var object = {};
		
			object.id = id;
			if(mode === 'text') object.note = $('#edit_note').val();
			else if(mode === 'todo') object.note = JSON.stringify(todo_object);
			object.title = $('#heading').val();
			object.accent = accent;
			object.mode = mode;
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



	function l(data, label){
		if(remote.getGlobal('debug').on) console.log(label + ": " + typeof(data) + ": " + data);
	}

	function r(){
		return Math.floor(Math.random() * (9999999 - 1000000 + 1)) + 1000000;
	}


	var template_menu_toggle = false;
	$("#b_insert").click(function(){
		if(!template_menu_toggle) $('#template_menu').slideDown();
		else $('#template_menu').slideUp();
		template_menu_toggle = !template_menu_toggle;
	});

	$("#b_href").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('href'));
	});

	$("#b_heading").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('heading'));
	});


	$("#b_image").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('image'));
	});

	$("#b_hr").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('hr'));
	});

	$("#b_text_format").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('text_format'));
	});

	$("#b_table").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('table'));
	});

	$("#b_blockquote").click(function(){
		$('#edit_note').val($('#edit_note').val() + getTemplate('blockquote'));
	});

	$('#edit_note').click(function(){
		if(template_menu_toggle) {
			$('#template_menu').slideUp();
			template_menu_toggle = false;
		}
	})

	function getTemplate(category){
		if(category === 'table') template = `

| heading_1         | heading_2         |
| ---------------------- |:---------------------:|
| row_1_col_1     | row_1_col_2     |
`;
		else if(category === 'href') template = `
[Google](https://www.google.com)
`;
		else if(category === 'image') template = `
![alt_text](https://github.com/adam-p/markdown-here/raw/master/src/common/images/icon48.png)
`;
		else if(category === 'hr') template = `
---
`;
		else if(category === 'heading') template = `
# H1
## H2
### H3
#### H4
`;
		else if(category === 'blockquote') template = `
> In war, truth is the first casualty
> ~Anonymous
`;
		else if(category === 'text_format') template = `
*italics*
**bold**
~~striked~~
`;
		
		return template;
	}
});