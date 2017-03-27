var DEBUG = false;

//  Endpoints
var MW_ROOT = 'http://www.dictionaryapi.com/api/v1/references/collegiate/xml/';

//  Dependencies
var request = require('request'),
    xml     = require('xml2js');
  
//  Dictionary constructor
var Dictionary = function (config) {  
    this.key = config.key;
}

//  Dictionary functions
Dictionary.prototype = {

    //returns a word's definition
    define: function(word, callback){
        this.raw(word, function(error, result){
            if (error === null) {

                if (DEBUG) {
                    console.log('result', JSON.stringify(result, null, 2));
                }

                var results = [];

                if (result.entry_list.entry != undefined) {
                    var entries = result.entry_list.entry;
                    for (var i=0; i<entries.length; i++){

                        //remove erroneous results (doodle != Yankee Doodle)
                        if (entries[i].ew == word) {

                            //construct a more digestable object
                            var definition = [];
                            var definition = entries[i].def[0].dt;
                            var partOfSpeech = entries[i].fl;

                            if (DEBUG) {
                                console.log('definition', JSON.stringify(definition, null, 2));
                                console.log('partOfSpeech', partOfSpeech);
                            }

                            results.push({
                                partOfSpeech: entries[i].fl,
                                definition: entries[i].def[0].dt.map(entry => {
                                    if (typeof(entry) === 'string') {
                                        return entry;
                                    }

                                    if (entry['_']) {
                                        return entry['_'];
                                    }
                                }).join('\n')
                            });
                            // console.log('definition', JSON.stringify(results, null, 2));
                        }
                    }

                    callback(null, results.filter(entry => entry.definition));
                }
                else if (result.entry_list.suggestion != undefined) {
                    callback('suggestions', result.entry_list.suggestion);
                }
                
            }
            else callback(error);
        });
    },

    //return a javascript object equivalent to the XML response from M-W
    raw: function(word, callback){
        var url = this.getSearchUrl(word);
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                xml.parseString(body, function(error, result){
                    if (error === null) callback(null, result);
                    else if (response.statusCode != 200) console.log(response.statusCode);
                    else {
                        console.log(error);
                        // console.log('url: ' + url);
                        // console.log('body: ' + body);
                        callback('XML Parsing error.');
                    }
                });
            }
            else callback('API connection error.')
        });
    },

    //constructs the search url
    getSearchUrl: function(word){
        return MW_ROOT+word+'?key='+this.key;
    }
}

module.exports = Dictionary;