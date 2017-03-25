"use strict";
  
var bigTime = 1499; // time in seconds
var mode = "normal";
var animation = "fadeToBlack";

var color = "ECE5DD";
var percent;

var mins;
var secs;

var countdownID;

// get all the elements
var minutes = document.getElementById("minutes");
var seconds = document.getElementById("seconds");
var message = document.getElementById("message");


// register the buttons
var start = document.getElementById("start");
start.addEventListener("click", startTimer, false);  

var stop = document.getElementById("stop");
stop.addEventListener("click", stopTimer, false);

var reset = document.getElementById("reset");  
reset.addEventListener("click", resetTimer, false);

// COUNTER ========================================================
function counter() {
  
  // calculate the minutes and seconds from bigTime
  mins = Math.floor(bigTime / 60);
  secs = bigTime - mins * 60;

  // change the HTML to show new minutes and seconds
  minutes.innerHTML = (mins < 10 ? '0' : '') + mins;
  seconds.innerHTML = (secs < 10 ? '0' : '') + secs;
  
  // handle the animations
    var divisor = 300;
  
    percent = secs / divisor;
    // color = shadeColor(color, -percent);
    // document.body.style.background = "#" + color;
    divisor - 100;
  
  // change the message at 00
  if (secs == 0) {
    // message.innerHTML = "Time to take a break!";
  }
  
  // switch modes if timer ends
  if (bigTime == 0) {
    
    if (mode == "normal") {
      
      // cooldown is 5min 
      mode = "cooldown";    
      bigTime = 300;
      
    } else if (mode == "cooldown") {
      
      // switch back to normal 25min mode
      mode = "normal";    
      bigTime = 1499;  
      
      minutes.innerHTML = "25";
      seconds.innerHTML = "00";
      
      // document.body.style.background = "#" + color;
      
      // show start button
      start.style.display = "block"; 
      stop.style.display = "none"; 
      reset.style.display = "none"; 
      
      // stop timer
      clearInterval(countdownID);
    }    
     
  } else {
    // decrement
    bigTime = bigTime - 1; 
  }
        
}

// ACTIONS =======================================================

// start timer
function startTimer() {
  // start timer
  countdownID = setInterval("counter()", 1000);
  
  // show message
  message.innerHTML = "Slow and steady wins something.";
  
  // show stop button
  start.style.display = "none"; 
  stop.style.display = "block"; 
  reset.style.display = "none"; 
} 

// stop timer
function stopTimer() {
  // change message
  message.innerHTML = "Why are you such a quitter?";
  
  // stop timer
  clearInterval(countdownID);
  
  // show reset button
  start.style.display = "none"; 
  stop.style.display = "none"; 
  reset.style.display = "block"; 
}

// reset timer
function resetTimer() {
  // reset big time
  bigTime = 1499;
  
  // change message
  message.innerHTML = "Keep up the good work.";
  
  // show start button
  start.style.display = "block"; 
  stop.style.display = "none"; 
  reset.style.display = "none"; 
}

// ANIMATIONS ================================================ 
function fadeToBlack() {
  
}

function colorChange() {
  
}

// HELPER FUNCTIONS ============================================ 
function shadeColor(color, percent) {   
    var num = parseInt(color,16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = (num >> 8 & 0x00FF) + amt,
    G = (num & 0x0000FF) + amt;
    return (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (B < 255 ? B < 1 ? 0 : B : 255) * 0x100 + (G < 255 ? G < 1 ? 0 : G : 255)).toString(16).slice(1);
}


$(document).ready(function(){


  //Themes themes themes
  var k = 1;
  var clock = $("#clock");
  var body = $("body");
  var timer = $('#timer');
  var message = $('#message');
  var array = ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0", "#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79", "#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47", "#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"];
  var max_k = array.length;
  function changeTheme(){
    k++;
    if(k === 1){
      body.css('background-color', '#333');
      timer.css('color', '#CCC');
      message.css('color', '#eee');

    }
   
    else if(k === 2){
      body.css('background-color', '#666');
      timer.css('color', '#EEE');
      message.css('color', '#eee');

    }
   
    else if(k === 3){
      body.css('background-color', '#128C7E');
      timer.css('color', '#FFF');
      message.css('color', '#eee');

    }
   
   
    else if(k === 4){
      body.css('background-color', '#e06666');
      timer.css('color', '#FFF');
      message.css('color', '#eee');

    }
   
   
   
    else if(k === 5){
      body.css('background-color', '#e69138');
      timer.css('color', '#EEE');
      message.css('color', '#eee');

    }
   
    else if(k === 6){
      body.css('background-color', '#6fa8dc');
      timer.css('color', '#FFF');
      message.css('color', '#eee');

    }
   
    else if(k === 7){
      body.css('background-color', '#6aa84f');
      timer.css('color', '#FFF');
      message.css('color', '#eee');

    }
   
    else if(k === 8){
      body.css('background-color', '#c27ba0');
      timer.css('color', '#FFF');
      message.css('color', '#eee');

    }
   
    else if(k == max_k){
      body.css('background-color', '#ECE5DD');
      timer.css('color', '#333');
      message.css('color', '#666');
      k = 0;
    }

    else{
      body.css('background-color', array[k - 9]);
      timer.css('color', '#FFF');
      message.css('color', '#eee');
    }
  }


  var m = 0;
  function changeText(){
    m++;
    if(m === 1){
      timer.css('color', '#FFF');
      message.css('color', '#aaa');
    }

    else if(m === 2){
      timer.css('color', '#DDD');
      message.css('color', '#999');
    }
   
    else if(m === 3){
      timer.css('color', '#BBB');
      message.css('color', '#888');
    }
   
    else if(m === 4){
      timer.css('color', '#888');
      message.css('color', '#444');
    }

    else if(m === 5){
      timer.css('color', '#333');
      message.css('color', '#222');
    }

    else if(m === 6){
      timer.css('color', '#111');
      message.css('color', '#000');
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

});