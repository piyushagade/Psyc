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