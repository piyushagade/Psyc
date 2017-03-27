var Dictionary = require('./dictionary'),
	
	//pass the constructor a config object with your key
	dict = new Dictionary({
		key: 'cb787765-8214-44e6-9360-41ec5d1721b4'
	});

//sample method
dict.define('dog', function(error, result){
	if (error == null) {
		for(var i=0; i<result.length; i++){
			console.log(i+'.');
			console.log('Part of speech: '+result[i].partOfSpeech);
			console.log('Definitions: '+result[i].definition);
			console.log(result[i].definition)
		}
	}
	else if (error === "suggestions"){
		console.log(process.argv[3] + ' not found in dictionary. Possible suggestions:');
		for (var i=0; i<result.length; i++){
			console.log(result[i]);
		}
	}
	else console.log(error);
});