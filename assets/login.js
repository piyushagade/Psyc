const firebase = require("firebase");

  var config = {
    apiKey: "AIzaSyDG2Dx_VfSLg09u8yQl5Aka7WS-omoNiyk",
    authDomain: "pysc-60451.firebaseapp.com",
    databaseURL: "https://pysc-60451.firebaseio.com",
    storageBucket: "pysc-60451.appspot.com",
    messagingSenderId: "287121949870"
  };
  firebase.initializeApp(config);


fb = firebase.database().ref().child("cloud");

$("#popup").addClass('hidden');

// sign_up
$('#b_sign_up').click(function (e) {
	setTimeout(function() {	
		$('#login_div').fadeOut(200);
	}, 200);
	$('#sign_up_div').fadeIn(200);
	
});

// back to login div
$('#b_back').click(function (e) {
	setTimeout(function() {	
		$('#sign_up_div').fadeOut(200);
	}, 200);
	$('#login_div').fadeIn(200);
	
});

// login
$('#b_login').click(function (e) {
	var email = $('#login_email').val();
	var password = $('#login_password').val();
	var eemail = email.replace('.','');


	var fb_user = fb.child(eemail);
	var fb_key = fb_user.child("key");
	var fb_email = fb_user.child("email");

	if(email.length <= 0  || password.length <= 0){
		popup('Incomplete fields.');
	}
	else if(password.length <= 6){
		popup("Password should have at least 6 characters.");
	}
	else if(!validateEmail(email)){
		popup("Invalid email.");
	}
	else{

		fb_email.on("value", function(snapshot) {
	  		var counter_email = snapshot.val();
	  		if(counter_email === eemail){

	  			fb_key.on("value", function(snapshot) {
	  				var counter_key = snapshot.val();
	  				if(counter_key === password){
	  					// Send IPC
					 	var remote = require('electron').remote;
						remote.getGlobal('login').eemail = eemail; 
						remote.getGlobal('login').email = email; 

						var ipcRenderer = require('electron').ipcRenderer;   
						ipcRenderer.send('login');
					 
						ipcRenderer.on('login', function(event, arg) {
							if(arg == 1){
								const remote = require('electron').remote;
								var window = remote.getCurrentWindow();

								window.close();
							}	
						});
	  				}
	  				else{
	  					popup("Wrong password.");
	  				}
	  			}, function (errorObject) {
	  			});
  			}
			
			}, function (errorObject) {
	  		console.log("The read failed: " + errorObject.code);
		});


		
	}
	
});


// register
$('#b_register').click(function (e) {
	var email = $('#register_email').val();
	var password = $('#register_password').val();


	var fb = firebase.database().ref().child("cloud");

	if(email.length <= 0 || password.length <= 6){
		popup('Incomplete fields.');
	}
	else if(!validateEmail(email)){
		popup("Invalid email.");
	}
	else{
		var eemail = email.replace('.','');
		var fb_user = fb.child(eemail);
		var fb_key = fb_user.child("key");
		var fb_email = fb_user.child("email");

		fb_key.set(password);	
		fb_email.set(eemail);		

		fb_key.on("value", function(snapshot) {
	  		var token = snapshot.val();
	  		if(snapshot.exists()){
	  			setTimeout(function() {	
					$('#sign_up_div').fadeOut(200);
				}, 200);
				$('#login_div').fadeIn(200);
				$('#login_email').val(email);

				popup("Account created.");

	  		}

			}, function (errorObject) {
		});

	}
	
});



// skip
$('#b_skip_login').click(function (e) {
	// Send IPC
 	var remote = require('electron').remote;
	remote.getGlobal('login').eemail = 'skipped'; 

	var ipcRenderer = require('electron').ipcRenderer;   
	ipcRenderer.send('skip_login');
 
	ipcRenderer.on('skip_login', function(event, arg) {
		if(arg == 1){
			const remote = require('electron').remote;
			var window = remote.getCurrentWindow();
			window.close();
		}	
	});
	
});



function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function popup(data){
	$("#popup").removeClass('hidden');
	// $("#popup").slideUp();
	$("#popup").text(data);

	setTimeout(function(){
		$("#popup").addClass('hidden');
	}, 2000);
}
// $('#edit_note').bind('input propertychange', function() {