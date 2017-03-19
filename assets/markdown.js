jQuery.fn.parseAsMarkdown = function( window, jQuery ){
	jQuery = $;
	var text = $(this).val();
	var newval;
	text = text.split('\n');

	// console.log( text )
	
	for( var i=0;i<text.length;i++ ){

		var line = text[i];

		if( line.match(/#/) ){
			newval = line.replace(/^#/, '');
			text[i] = '<h1>' + newval + '</h1>';
		}
		if( line.match(/##/) ){
			newval = line.replace(/^##/, '');
			text[i] = '<h2>' + newval + '</h2>';
		}
		if( line.match(/###/) ){
			newval = line.replace(/^###/, '');
			text[i] = '<h2>' + newval + '</h2>';
		}
		if( line.match(/-\s/) ){
			newval = line;
			if( !text[i-1].match(/-/) ){
				text[i] = '<ul><li>' + newval + '</li>';
			} else if( !text[i+1].match(/-/) ){
				text[i] = '<li>' + newval + '</li></ul>';
			} else {
				text[i] = '<li>' + newval + '</li>';
			}
 		}
 		
	}
	// remove dashs from list items
	for( var i=0;i<text.length;i++ ){
		if( text[i].match(/<li>/) ){
			text[i] = text[i].replace('-', '');
		}
	}
	// Add spaces back
	for(var i=0;i<text.length;i++){
		
		var prev, next;
		// console.log( typeof(text[i-1]) )
		if( typeof(text[i-1]) !== 'undefined' ){
			prev = text[i-1].match(/</) && text[i-1].match('<h');
		} else {
			prev = true;
		}
		if( typeof(text[i+1]) !== 'undefined' ){
			next = text[i+1].match(/</);
		} else {
			next = true;
		}

		if( !text[i].match('<') && (!prev || !next) ){
			text[i] = text[i] + '<br>';
		}
	}
	return text.join('\n');
}