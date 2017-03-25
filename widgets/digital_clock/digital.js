var $document = $(document);
(function () { 
  var clock = function () {
      clearTimeout(timer);
    
      date = new Date();    
      hours = date.getHours();
      minutes = date.getMinutes();
      seconds = date.getSeconds();
      dd = (hours >= 12) ? 'pm' : 'am';
      
    hours = (hours > 12) ? (hours - 12) : hours
      
      var timer = setTimeout(clock, 1000);
    
    $('.hours').html('<p>' + Math.floor(hours) + ':</p>');
    $('.minutes').html('<p>' + Math.floor(minutes) + ':</p>');
    $('.seconds').html('<p>' + Math.floor(seconds) + '</p>');
      $('.twelvehr').html('<p>' + dd + '</p>');
  };
  clock();
})();

(function () {
  $document.bind('contextmenu', function (e) {
    e.preventDefault();
  }); 


  //Themes themes themes
  var k = 1;
  var clock = $("#clock");
  var body = $("body");
  var array = ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0", "#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79", "#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47", "#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"];
  var max_k = array.length;
  function changeTheme(){
    k++;
    if(k === 1){
      body.css('background-color', '#333');
      body.css('color', '#CCC');

    }
   
    else if(k === 2){
      body.css('background-color', '#666');
      body.css('color', '#EEE');

    }
   
    else if(k === 3){
      body.css('background-color', '#128C7E');
      body.css('color', '#FFF');

    }
   
   
    else if(k === 4){
      body.css('background-color', '#e06666');
      body.css('color', '#FFF');

    }
   
   
   
    else if(k === 5){
      body.css('background-color', '#e69138');
      body.css('color', '#EEE');

    }
   
    else if(k === 6){
      body.css('background-color', '#6fa8dc');
      body.css('color', '#FFF');

    }
   
    else if(k === 7){
      body.css('background-color', '#6aa84f');
      body.css('color', '#FFF');

    }
   
    else if(k === 8){
      body.css('background-color', '#c27ba0');
      body.css('color', '#FFF');

    }
   
    else if(k == max_k){
      body.css('background-color', '#ECE5DD');
      body.css('color', '#333');
      k = 0;
    }

    else{
      body.css('background-color', array[k - 9]);
      body.css('color', '#FFF');
    }
  }


  var m = 0;
  function changeText(){
    m++;
    if(m === 1)
      body.css('color', '#FFF');

    else if(m === 2)
      body.css('color', '#DDD');
   
    else if(m === 3)
      body.css('color', '#BBB');
   
    else if(m === 4)
      body.css('color', '#888');

    else if(m === 5)
      body.css('color', '#333');

    else if(m === 6){
      body.css('color', '#111');
      m = 0;
    }
  }



  var f = 0;
  function changeFont(){
    f++;
    if(f === 1)
      body.css('font-family', 'Ubuntu');

    else if(f === 2)
      body.css('font-family', 'Futura');
   
    else if(f === 3)
      body.css('font-family', 'Bank Gothic');
   
    else if(f === 4)
      body.css('font-family', 'Arial');

    else if(f === 5)
      body.css('font-family', 'Open Sans');

    else if(f === 6){
      body.css('font-family', 'Electrolize');
      f = 0;
    }
  }


  // mouse trap
  
  //new note
  Mousetrap.bind('alt+b', function() { 
    changeTheme();
  });
  Mousetrap.bind('alt+t', function() { 
    changeText();
  });
  Mousetrap.bind('alt+f', function() { 
    changeFont();
  });

  Mousetrap.bind('alt+r', function() { 
    document.location.reload();
  });

})();