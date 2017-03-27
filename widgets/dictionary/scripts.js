$(document).ready(function(){
     // get focus to text box
    Mousetrap.bind('alt+r', function() { 
        //request focus
		window.setTimeout(function ()
    	{
    		window.location.reload()
    	},0);
    });

	$('#intro_img').fadeOut(0);
	setInterval(function(){
    	$('#intro_img').fadeIn(600);
	}, 600);

	$("#word").focus();
	


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


	var Dictionary = require('./dictionary'),
		dict = new Dictionary({
			key: 'cb787765-8214-44e6-9360-41ec5d1721b4'
		});


	Mousetrap.bind('alt+d', function() { 
  		var word = $('#word').val().toString().trim().toLowerCase();
  		showResults(word);
    });

    $('#word').bind('input propertychange', function() {
    	var display = $('#wikiInfo');
    	var suggestions = $('#suggestions');

		suggestions.html('');

    	if($('#word').val().trim().length > 0){
	    	display.html('');
		  	setTimeout(function(){
		  		var word = $('#word').val().toString().trim().toLowerCase();
		  		showResults(word);
		  	}, 0);
	  	}
	  	else {
	  		display.html('<img src="dictionary.png" id="intro_img" class="intro_img">');
		}

    	var word = $('#word').val().toString().trim().toLowerCase();
	  	var title = $('#pagetitle');
		title.html(word);
	});

    function showResults(word){
		dict.define(word, function(error, result){
			var display = $('#wikiInfo');
			var title = $('#pagetitle');
			var suggestions = $('#suggestions');

			title.html(word);
			

			if (error == null) {
				for(var i=0; i<result.length; i++){
					title.fadeIn(0);
					display.fadeIn(0);
					suggestions.slideUp();
					

					display.append('<span class="entry" id="entry_'+ i + '"></span>');
					$('#entry_' + i).html('');
					$('#entry_' + i).fadeOut(0);

					//for every pos
					$('#entry_' + i).append('<span id="span_pos_'+ i +'" class="pos"></i>'+result[i].partOfSpeech+ '</i></span>');

					var def = result[i].definition.replace('\n:','');
					var items = result[i].definition.replace('\n:','').split(':');

					$('#entry_' + i).append('<span id="span_def_'+ i +'"><ol style="display: none;" id="ol_def_' + i + '"></ol></span>');
					$('#ol_def_' + i).html('');
					$('#ol_def_' + i).fadeOut(0);

					var item_count = 1;
					for(var j = 0; j < items.length; j++){
						// for every item in a pos
						if(items[j].trim().length !== 0 && items[j].trim().split(" ").length > 1){
							$('#ol_def_'+ i).append('<li id="li_def_'+ i +'_item_"'+ j + ' class="item"">' + items[j].substr(0,1).toUpperCase() + items[j].substr(1).replace('()', '') + '</li>');
						}
					}

					if(!$('#ol_def_' + i).has('li').length){
						$('#entry_' + i).html('');
					}

					$('#entry_' + i).fadeIn(200);
					$('#ol_def_' + i).slideDown();
					$('#ol_def_' + i).fadeIn(600);
				}
				
			}
			else if (error === "suggestions"){
				title.fadeOut(0);
				display.fadeOut(0);

				suggestions.html('<font size="6px">did you mean:</font> <br>');
				suggestions.slideDown();
				suggestions.css('display', 'inline-block');
				
				//not found in dictionary
				for (var i=0; i<result.length; i++){
					suggestions.append('<li class="suggestion">' + result[i] + '</li>');
				}
			}
			else console.log(error);

		});
    }

    $(document).on('click', '.suggestion', function(event) {
    	var word = $(this).text().toString().trim().toLowerCase();
	    showResults(word);
	    $('#word').text(word);
	});

    window.enterKeyEvent = function(obj, e) {
	  	var keynum, lines = 1;
	    // IE
	    if(window.event) {
	      keynum = e.keyCode;
	    // Netscape/Firefox/Opera
	    } else if(e.which) {
	      keynum = e.which;
	    }

	    if(keynum == 13) {
	  		var word = $('#word').val().toString().trim().toLowerCase();
	    	showResults(word);
	    }

	    else if(keynum == 27) {
	    	$('#word').val('');

			var title = $('#pagetitle');
			var display = $('#wikiInfo');
	    	title.html('');
	  		display.html('<img src="dictionary.png" id="intro_img" class="intro_img">');
	    }

	}


	document.onkeydown = keydown;
  	document.onkeyup = keyup;

	function keydown(evt) {
	    if (!evt) evt = event;
	    if (evt.altKey) {
    		$('input').blur();
    		$('textarea').blur();
	    }
	} 

	function keyup(evt) {
	    if (!evt) evt = event;
	    var KeyID = (window.event) ? event.keyCode : evt.keyCode;

	    if (KeyID === 18) {
			window.setTimeout(function (){
	    		// $("#word").focus();
	    	},0);
	    }

		$("#word").focus();

	} 


});