//-----------Helper functions-----------------
var SoundFiles = [
    "sound/0-piano.mp3",
    "sound/1-whirring.mp3",
    "sound/3-birds.mp3",
    "sound/4-street.mp3",
    "sound/5-heartbeat.mp3",
    "sound/7-humming.mp3",
    "sound/elevator-beep.mp3",
    "sound/hit.mp3",
    "sound/spaceradio.mp3",
    "sound/pianoreverse.mp3",
];
var ImageFiles = [
    // Backgrounds
    "img/universe.png",
    "img/solarsystem.png",
    "img/continent.png",
    "img/street.png",
    "img/people.png",
    "img/cellular.png",
    "img/atomic.png",
    
    // Blocks
    "img/universe_object1ss.png",
    "img/universe_object2ss.png",
    "img/universe_object3ss.png",

    "img/asteroid1.png",
    "img/asteroid2.png",
    "img/asteroid3.png",
    "img/asteroid4.png",
    "img/asteroid5.png",
    "img/asteroid6.png",
    "img/asteroid7.png",
    "img/asteroid8.png",
    "img/asteroid9.png",
    "img/earth.png",
    "img/jupiter.png",
    "img/moon1.png",
    "img/moon2.png",
    "img/ringplanet.png",

    "img/continent_object1ss.png",
    "img/continent_object2ss.png",
    "img/continent_object3ss.png",

    "img/street_birdanim_ss.png",

    "img/people_object1ss.png",
    "img/people_object2ss.png",
    "img/people_object3ss.png",
    
    "img/cell1anim_ss.png",
    "img/cell2anim_ss.png",
    "img/cell3anim_ss.png",

    "img/atomic_object1ss.png",
    "img/atomic_object2ss.png",
    "img/atomic_object3ss.png",

    // Player
    "img/player.png",
    "img/player1.png",
    "img/player2.png",
    "img/player3.png",
    "img/player4.png",
    "img/player5.png",
    "img/player6.png",
    
    //Pause Screen
    "img/paused.png",
];

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
        };
})();

if (!Object.keys) Object.keys = function(o){
    if (o !== Object(o))
	throw new TypeError('Object.keys called on non-object');
    var ret=[],p;
    for(p in o) {
	if(Object.prototype.hasOwnProperty.call(o,p)) {
	    ret.push(p);
	}
    }
    return ret;
}

function destroyObject(arr, obj) {
    var id = arr.indexOf(obj);
    if (id != -1) {
        arr.splice(id, 1);
    }
}

// Globals
var INITIAL_GAME_SPEED = 1.5;
var debug = false;
var gamePaused = false;
var muted = false;
var blurred = false; // Whether the game was paused because we moved focus.
var pauseImg;
var collisionRadius = 0.75;
var cyclesCompleted = 0;
var maxLevels = 7;

var IterationsCompleted = ["0", "0", "0", "0", "0", "0", "0"];
var LevelImageRot = [0, 0, 0, 0, 0, 0, 0];
var IterationSelected = -1;
var LastIterationSelected = 0;
var randomSprites = false;

var Viewport = {width : 800, height : 600};
var Loader;
var Sounds = [];
var AssetsLoaded = false;
var StartGame = false;
var Canvas, Context;

var level;
var gameSpeed;
var resetting;
var PlayerDist = 250;
var PlayerSize = 15;
var Avatar;

var MouseX = 0;
var MouseY = 0;

var now = null;


// This is the first entry point in the script.
function main(hasSound) {
    Canvas = document.getElementById("canvas");
    Context = Canvas.getContext("2d");
    
    // Scale viewport to canvas.
    Context.scale(Canvas.width * 1.0 / Viewport.width,
		  Canvas.height * 1.0 / Viewport.height);
    
    // Pause on window focus shift.
    if (!debug) {	
	window.onblur = function() {
	    if (!gamePaused) {
		blurred = true;
		pause();
	    }
	}
	
	window.onfocus = function() {
	    if (blurred) {
		blurred = false;
		// unpause();
	    }
	}
    }
   
    // Loading animation.
    loadScreen();

    var onloaded = function() {
        loadImages();
    }
    
    if (hasSound) {
	loadSounds(SoundFiles, function() { loadImages(); });
    } else {
	loadImages();
    }
}

function getMuteState() {
    if (localStorage && localStorage.muted) {
	muted = (localStorage.muted == "true");
    }
}

function setMuteState() {
    if (localStorage) {
	localStorage.muted = muted.toString();
    }
}

function restoreIterationsState() {
    if (localStorage && localStorage.iterations) {
	IterationsCompleted = localStorage.iterations.split(",");
    }
}

function saveIterationsState() {
    if (localStorage) {
        localStorage.iterations = IterationsCompleted.join(",");
    }
}


function restoreCurrentIterationState() {
    if (localStorage && localStorage.currentIteration) {
	BgIters = parseInt(localStorage.currentIteration);
    }
}

function saveCurrentIterationState() {
    if (localStorage) {
        localStorage.currentIteration = '' + BgIters;
    }
}

function loadScreen() {
    clear();
    
    var img = new Image();
    var loading = new Image();
    
    var theta = 0;
    var x = 0, y = 0;
    var checkForLoaded = false;
    var loadScreen = function() {
        theta += 10;
        if (theta >= 360) {
            theta -= 360;
            checkForLoaded = true;
        }
        
        if (checkForLoaded) { // One loop completed.
            if (AssetsLoaded) {
                
                var loadPulse;
                var size = PlayerSize;
                var growing = true;
                var step = PlayerSize / 3.0;
                var rot = 0;
                loadPulse = function() {
                    clear();

                    rot += 10;
                    if (growing) {
                        size += step;
                        if (size == PlayerSize * 5) {
                            growing = false;
                        }
                    } else {
                        size -= step;
                        if (size == PlayerSize) {
                            StartGame = true;
                            return;
                        }
                    }
                    
                    var x = 0;
                    var y = PlayerDist;
                    
                    Context.save();
                    Context.translate(Viewport.width / 2 + x,
                                      Viewport.height / 2 + y);             
                    Context.rotate(rot * Math.PI / 180.0);
                    Context.drawImage(img,
                                      -size, -size, 
                                      size * 2, size * 2);
                    Context.restore();

                    setTimeout(loadPulse, 30);
                }
                setTimeout(loadPulse, 30);


                return; // break out of load screen.
            }
            checkForLoaded = false;
        }

        clear();
        Context.drawImage(loading,
                          Viewport.width/2 - loading.width / 2,
                          Viewport.height/2 - loading.height / 2, 
                          loading.width, loading.height);

        for (var deg = 0; deg < 360; deg += 10) {
            if (deg != theta) {
                Context.globalAlpha = 0.5;
            }
        
            var x = Viewport.width / 2 
                + PlayerDist * Math.cos((270 + deg) * Math.PI / 180);
            var y = Viewport.height / 2 
                - PlayerDist * Math.sin((270 + deg) * Math.PI / 180);
    
            Context.drawImage(img, x - PlayerSize, y - PlayerSize, 
                              PlayerSize * 2, PlayerSize * 2);

            Context.globalAlpha = 1.0;
        }
        
        setTimeout(loadScreen, 30);
    }
    
    img.onload = function() {
        loading.src = "img/loading.png";
    }
    loading.onload = function() {
        loadScreen();
    }
    img.src = "img/player.png";
}

function loadSounds(sounds, onloaded) {
    var callback;
    callback = function(i) {       
        Sounds[sounds[i]] = 
            soundManager.createSound({
                id: sounds[i],
                url: sounds[i],
                autoLoad: true,
                autoPlay: false,
                onload: function() {
                    if (++i < sounds.length) {
                        callback(i);
                    } else {                        
                        onloaded();
                    }
                },
                onerror: function() {
                    loadImages();
                },
            });
    }    
    callback(0);
}

function loadImages() {    
    var loaded = false;
    Loader = new html5Preloader();

    Loader.onfinish = function() {      
        if (loaded) {
            return;
        }
        loaded = true;
        AssetsLoaded = true;
        startGame();
    }

    Loader.addFiles.apply(Loader, ImageFiles);
}

function startGame() {
    var checkForStart;
    checkForStart = function() {
        if (StartGame) {
            init();
        } else {
            setTimeout(checkForStart, 30);
        }
    }
    setTimeout(checkForStart, 30);
}

function init() {
    new Background(1.0);
    Avatar = new Player(PlayerSize, PlayerDist, 270);
    
    resetting = false;
    gameSpeed = INITIAL_GAME_SPEED;
    document.onkeydown = keydown;
    document.onkeyup = keyup;
    Canvas.onmousemove = mousemove;
    Canvas.onmousedown = mousedown;
    if (window.DeviceOrientationEvent) {
	window.addEventListener('deviceorientation', onOrientation, false);
    }

    //restoreCurrentIterationState();

    level = new Level();
    level.LoadWaves(BgIters * BgList.length + 1);

    pauseImg = Loader.getFile("img/paused.png");
    Context.globalAlpha = 1.0;
    Context.save();    

    // Load last mute state from local storage.
    /* Disabling - might be too confusing
    getMuteState();
    if (muted) {
        soundManager.mute();
        showMute();
    } 
    */
    
    restoreIterationsState();

    gameLoop();
}

function spawnBlock(size, deg, accel,image, omega)
{
    new Block(size, deg, accel, image, omega);
}

function gameLoop() {
    var lastFrame = new Date;
    function loop(now) {        
        if (now == null) {
            now = new Date;
        }

        requestAnimFrame(loop);
        var deltaT = now - lastFrame;
        if (deltaT < 160) {
                if(!gamePaused)
                        update(deltaT);
            draw(deltaT);
        }
        lastFrame = now;
    }
    
    loop(lastFrame);
}

function update(deltaT) {
    if (resetting) {
        for (var i = 0; i < Backups.length; i++) {
            var bg = Backups[i];
            bg.update(deltaT);
        }
    }
    else {        
        for (var i = 0; i < Backgrounds.length; i++) {
            var bg = Backgrounds[i];
            bg.update(deltaT);
        }
    }
        
    Avatar.update(deltaT);
    level.update(deltaT);
    
    for (var i = 0; i < Blocks.length; i++) {
        Blocks[i].update(deltaT);
    }
}

function draw(deltaT) {
    Context.restore();
    Context.save();
    
    clear();
        
    Context.translate(Viewport.width / 2, Viewport.height / 2);
    Context.rotate(Math.PI / 180 * (Avatar.deg + 90));
    Context.translate(-Viewport.width / 2, -Viewport.height / 2);
        
    if (resetting) {
        for (var i = 0; i < Backups.length; i++) {
            var bg = Backups[i];
            bg.draw(deltaT);
        }
    } else {
        for (var i = 0; i < Backgrounds.length; i++) {
            var bg = Backgrounds[i];
            bg.draw(deltaT);
        }
    }

    Avatar.draw(deltaT);
    
    for (var i = 0; i < Blocks.length; i++) {
        Blocks[i].draw(deltaT);
    }
    
    if (gamePaused)
    {
        Context.restore();
        Context.save();
        
        Context.globalAlpha = 0.5;
        Context.fillStyle = "rgb(0, 0, 0)";
        Context.fillRect(0, 0, Viewport.width, Viewport.height);

        Context.globalAlpha = 0.9;
        Context.drawImage(
            pauseImg,
            (Viewport.width - pauseImg.width) / 2, 
            (Viewport.height - pauseImg.height) / 2, 
            pauseImg.width, pauseImg.height);
        
        IterationSelected = -1;
        for (var i = 0; i < 7; i++) {
            var deg = 270 + (i - BgIters) * 360 / 7;
            var img;
            if (i == 0) {
                img = Loader.getFile("img/player.png"); 
            } else {
                img = Loader.getFile("img/player" + i + ".png");
            }
            
            var x = Viewport.width / 2 
                + (PlayerDist - PlayerSize * 4) * Math.cos(deg * Math.PI / 180);
            var y = Viewport.height / 2 
                - (PlayerDist - PlayerSize * 4) * Math.sin(deg * Math.PI / 180);

            if (((MouseX - x) * (MouseX - x) + 
                 (MouseY - y) * (MouseY - y)) < PlayerSize * PlayerSize * 4) {

                IterationSelected = i;

                LevelImageRot[i] += 3;
                if (LevelImageRot[i] > 360) {
                    LevelImageRot[i] -= 360;
                }
            }       
            
	    if (IterationsCompleted[i] == "0") {
		Context.globalAlpha = 0.4;
	    } else {
		Context.globalAlpha = 1.0;
	    }

	    Context.save();
	    Context.translate(x, y);
	    Context.rotate(LevelImageRot[i] * Math.PI / 180);
	    Context.drawImage(img, -PlayerSize * 2, -PlayerSize * 2, 
			      PlayerSize * 4, PlayerSize * 4);
	    Context.restore();
	}

	Context.globalAlpha = 1.0;
    }
}

function clear() {
    Context.clearRect(0, 0, Viewport.width, Viewport.height);
    Context.fillStyle = "rgb(255, 255, 255)";
    Context.fillRect(0, 0, Viewport.width, Viewport.height);
}

function pause() {
    gamePaused = true;
    if (!muted) {
	soundManager.mute();
    }
}

function unpause() {
    gamePaused = false;
    if (!muted) {
	soundManager.unmute();
    }
}

function mute() {
    muted = true;
    soundManager.mute();
    showMute();
    setMuteState();
}

function unmute() {
    muted = false;
    soundManager.unmute();
    showUnmute();
    setMuteState();
}

function keydown(e) {
    if (e.keyCode == 77) { // 'm' was pressed
	if (!gamePaused) {	
	    if (muted) {
		unmute();
	    } else {
		mute();
	    }
	}
    }

    if (e.keyCode == 80) { // 'p' was pressed
	if (gamePaused) {
	    unpause();
	} else {
	    pause();
	}
    }

    if(!resetting)
    {
	Avatar.keydown(e);
	level.keydown(e);
    }	
}

function keyup(e) {
    if(!resetting)
	Avatar.keyup(e);
}

function onOrientation(e) {
    if (!resetting) {
        Avatar.OnOrientation(e);
    }
}

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.parentNode;
    }
    return { top: _y, left: _x };
}

function getMousePos(e) {
    var canvasPos = getOffset(Canvas);
    
    MouseX = e.clientX - canvasPos.left + 8;
    MouseY = e.clientY - canvasPos.top + 8;
}

function mousemove(e) {
    getMousePos(e);
}

function mousedown(e) {
    
    if ((e.which) && (e.which != 1)) {
	return; // Not left button. Do nothing.
    }
	
    if (!StartGame) {
	return; // Don't pause in the load screen.
    }

    if (gamePaused) {
	IterationSelected = -1;
	
	// Find out the latest selection.	
	getMousePos(e);
        for (var i = 0; i < 7; i++) {
	    var deg = 270 + (i - BgIters) * 360 / 7;
	    
	    var x = Viewport.width / 2 
                + (PlayerDist - PlayerSize * 4) * Math.cos(deg * Math.PI / 180);
            var y = Viewport.height / 2 
                - (PlayerDist - PlayerSize * 4) * Math.sin(deg * Math.PI / 180);
	    
            if (((MouseX - x) * (MouseX - x) + 
                 (MouseY - y) * (MouseY - y)) < PlayerSize * PlayerSize * 4) {
		
                IterationSelected = i;
	    }
	}

	if (IterationSelected != -1) {
	    jumpToIteration(IterationSelected);
	} else {
	    unpause();
	}
    } else {
	pause();
    }
}

function jumpToIteration(iter) {
    Blocks = [];
    
    LastIterationSelected = iter;

    if (resetting) {
	BgIters = iter;
	BgIndex = 0;
		
	var length = Backups.length;
	for (var i = 0; i < length; i++) {
            var bk = Backups.pop();
            bk.destroy();
	}
	
	level.levelTimer = -3.0;
	level.LoadWaves(BgIters * BgList.length + BgIndex);
    }
    else {
	var length = Backgrounds.length;
	for (var i = 0; i < length; i++) {
            var bg = Backgrounds.pop();
            bg.destroy();
	}
	
	BgIters = iter;
	BgIndex = 0;
	new Background(1.0);

	level.levelTimer = -3.0;
	level.LoadWaves(BgIters * BgList.length + BgIndex);

	Avatar.deg = 270;
	Avatar.keyCode = 0;
    }
    
    saveCurrentIterationState();

    IterationSelected = -1;
    unpause();
}

function transition() {
    Backgrounds[Backgrounds.length - 1].transition();
    cyclesCompleted++;
    if(cyclesCompleted > maxLevels)
        randomSprites = true;
    else
        randomSprites = true;
    
    //gameSpeed += 0.3;
    //if(gameSpeed > 5.0)
    //gameSpeed = 0.5;
}