// A wrapper script that provides a Sound object that chooses implementation 
// between AppMobi and SoundManager2
(function (global) {

    // AppMobi implementation for the Sound object.
    var AppMobiSound = function(sound) {
	this.sound = sound;
    }
    
    AppMobiSound.prototype.play = function(loop) {
	this.sound.play();
	this.sound.loop = loop;
    }

    AppMobiSound.prototype.stop = function() {
	this.sound.pause();
	this.sound.currentTime = 0;
    }

    var AppMobiSoundManager = function() {
	this.sounds = [];
    }

    AppMobiSoundManager.prototype.init = function(onload) {
	onload();
    }
	
    AppMobiSoundManager.prototype.loadFiles = function(files, onloaded) {
	for (var i = 0; i < files.length; i++) {
	    this.sounds[files[i]] = new Audio(files[i]);
	}
	onloaded();
    }
	
    AppMobiSoundManager.prototype.getSound = function(file) {
	if (this.sounds[file]) {
	    return new AppMobiSound(this.sounds[file]);
	} else {
	    return null;
	}
    }

    AppMobiSoundManager.prototype.mute = function() {
	// Do nothing.
    }

    AppMobiSoundManager.prototype.unmute = function() {
	// Do nothing.
    }
    
    // SoundManager2 implementation for the Sound object.
    var SoundManager2Sound = function(sound) {
	this.sound = sound;
    }
    
    SoundManager2Sound.prototype.play = function(loop) {
	var that = this;
	if (loop) {
	    play = function() {
		that.sound.play({
                    onfinish : function() {
			play();
                    }});
            }
            play();
	} else {
	    this.sound.play();
	}
    }

    SoundManager2Sound.prototype.stop = function() {
	this.sound.stop();
    }
    
    // Implementation of SoundManager using SoundManager2.
    var SoundManager2SoundManager = function() {
	this.sounds = [];
    }


    function loadScript(sURL, onLoad) {
	
	function loadScriptHandler() {
	    var rs = this.readyState;
	    if (rs == 'loaded' || rs == 'complete') {
		this.onreadystatechange = null;
		this.onload = null;
		if (onLoad) {
		    onLoad();
		}
	    }
	}
	
	function scriptOnload() {
	    this.onreadystatechange = null;
	    this.onload = null;
	    window.setTimeout(onLoad,20);
	}
	
	var oS = document.createElement('script');
	oS.type = 'text/javascript';
	if (onLoad) {
	    oS.onreadystatechange = loadScriptHandler;
	    oS.onload = scriptOnload;
	}
	oS.src = sURL;
	document.getElementsByTagName('head')[0].appendChild(oS);	
    }


    SoundManager2SoundManager.prototype.init = function(onload) {
	var that = this;
	loadScript("js/libs/soundmanager2.js", function() {
	    window.soundManager = new SoundManager();
	    window.soundManager.preferFlash = false;
	    window.soundManager.onload = function() {
		onload();
	    }
	    window.soundManager.beginDelayedInit();	   
	});
    }

    SoundManager2SoundManager.prototype.loadFiles = function(files, onloaded) {
	var callback;
	var that = this;
	var loaded = 0;
	callback = function() {       
	    if (++loaded == files.length) {
		onloaded();
	    }
	}	
	for (var i = 0; i < files.length; i++) {
            that.sounds[files[i]] = 
		soundManager.createSound({
                    id: files[i],
                    url: files[i],
                    autoLoad: true,
                    autoPlay: false,
                    onload: callback,
                    onerror: callback,
		});
	}
    }
    
    SoundManager2SoundManager.prototype.getSound =  function(file) {
	if (this.sounds[file]) {
	    return new SoundManager2Sound(this.sounds[file]);
	} else {
	    return null;
	}
    }

    SoundManager2SoundManager.prototype.mute = function() {
	if (typeof(soundManager) != "undefined") {
	    soundManager.mute();
	}
    }

    SoundManager2SoundManager.prototype.unmute = function() {
	if (typeof(soundManager) != "undefined") {
	    soundManager.unmute();
	}
    }
    
    // Choose the sound manager implementation depending on the environment.
    if (typeof(AppMobi) != 'undefined') {
	global.SoundMan = new AppMobiSoundManager();
    } else {
	global.SoundMan = new SoundManager2SoundManager();
    }
})(window);


var Player = function(size, r, deg) {
    this.size = size; // Radius of our player as a circle
    this.r = r; // Radius of the path circle
    this.deg = deg; // Current andle from horizontal in degrees
    this.x = Viewport.width / 2 
        + this.r * Math.cos((Math.PI/180) * this.deg);
    this.y = Viewport.height / 2 
        - this.r * Math.sin((Math.PI/180) * this.deg);
    this.keyCode = 0;
    this.gamma = 0; //deviceOrientation
    this.img = Loader.getFile("img/player.png");
    this.scalePlayer = false;
    this.startingScale= this.size;
    this.scaleValue = 5;
    this.scaleUp= true;
}
    
Player.prototype.keydown = function(e) {
    this.keyCode = e.keyCode;
}

Player.prototype.keyup =  function(e) {
    this.keyCode = 0;
}

Player.prototype.OnOrientation = function (e) {
    if (e && e.gamma) {
        this.gamma = e.gamma;
    }
}

Player.prototype.update = function(deltaT) {
    if(this.scalePlayer)
    {
        if(this.scaleUp)
        {
            this.size = this.size + 0.15 * deltaT;
            if(this.size > this.startingScale * 5)
                this.scaleUp = false;
        }
        else
        {
            this.size = this.size - 0.15 * deltaT;
            if(this.size < this.startingScale)
            {
                this.img = Loader.getFile("img/player.png");
                this.size = this.startingScale;
                this.scaleUp = true;
                this.scalePlayer = false;
            }
        }
    }
    
    if (this.keyCode == 37) { // left arrow
        this.deg -= 100 * deltaT / 1000.0;
    } else if (this.keyCode == 39) { // right arrow
        this.deg += 100 * deltaT / 1000.0;
    } else {        
        if ((this.gamma < -2) || (this.gamma > 2)) {
            this.deg += 100 * deltaT / 1000.0 * (this.gamma / 30);
        }
    }
    
    if (this.deg < 0) {
        this.deg += 360;
    } else if (this.deg > 360) {
        this.deg -= 360;
    }
    
    this.x = Viewport.width / 2 
        + this.r * Math.cos((Math.PI/180) * this.deg);
    this.y = Viewport.height / 2 
        - this.r * Math.sin((Math.PI/180) * this.deg);
    
    if(this.scalePlayer)
    {
        if(this.scaleUp)
        {
            this.size = this.size +0.15 * deltaT;
            if(this.size > this.startingScale * 5)
                this.scaleUp = false;
        }
        else
        {
            this.size = this.size -0.15 * deltaT;
            if(this.size < this.startingScale)
            {
                this.size = this.startingScale;
                this.scaleUp = true;
                this.scalePlayer = false;
            }
        }
    }
    
    if (this.hasCollided())
    {
        //do something collision related
        this.fillColor = "red";
        this.deg = 270;
	
	if (typeof(trackLevelDied) != 'undefined') {
            trackLevelDied();
	}
	
        Blocks = [];
        level.reset();
        var hit = SoundMan.getSound("sound/hit.mp3");
        if (hit) {
            hit.play();
        }
        this.scalePlayer = true;
        gameSpeed = INITIAL_GAME_SPEED;
    }
    else {
	this.fillColor = "blue"
    }
}

Player.prototype.draw = function(deltaT) {	
    if (BgIters > 0) {
	var index = BgIters;
	if (index > 6) {
	    index = 6;
	}
	this.img = Loader.getFile("img/player" + index + ".png");
    } else {
	this.img = Loader.getFile("img/player.png");
    }
    
    /*
      _Context.fillStyle = this.fillColor;
      _Context.beginPath();
      _Context.arc(this.x, this.y, this.size+1, 0, Math.PI*2, true); 
      _Context.closePath();
      _Context.fill();*/
    
    
    _Context.drawImage(
        this.img,
        this.x - this.size, 
        this.y - this.size, 
        this.size * 2, this.size * 2);       
},

Player.prototype.hasCollided = function() {
    for (var i = 0; i < Blocks.length; i++) 
    {
        var block = Blocks[i];
        
        // Add collision code here.
	var distanceX = this.x - block.x;
	var distanceY = this.y - block.y;
	var radiusSum = this.size / 2 + (block.size * collisionRadius);
	var totalDist = distanceX * distanceX + distanceY * distanceY;
	var comboRad = radiusSum * radiusSum;
	if (totalDist <= comboRad) 
	{	    
	    return true;
	}
    }
    return false;
}

Blocks = [];
var ImageSets = {
    objGalaxy : [
	"img/asteroid1.png",
	"img/asteroid2.png",
	"img/asteroid3.png",
	"img/asteroid4.png",
	"img/asteroid5.png",
	"img/asteroid6.png",
	"img/asteroid7.png",
	"img/asteroid8.png",
	"img/asteroid9.png",
	"img/jupiter.png",
	"img/moon1.png",
	"img/moon2.png",
	"img/ringplanet.png"
    ],
    
    objPlanets : [ 
	"img/jupiter.png",
	"img.moon1.png",
	"img.moon2.png",
	"ringplanet.png"
    ],
    
    objUniverse:[
	"img/universe_object1ss.png",
	"img/universe_object2ss.png",
	"img/universe_object3ss.png"
    ],
    
    objContinent:[
	"img/continent_object2ss.png",
	"img/continent_object3ss.png"
    ],
    objMountain:[
	"img/continent_object1ss.png"
    ],
    
    objCity:[
	"img/street_birdanim_ss.png",
    ],
    
    objCell:[
	"img/cell1anim_ss.png",
	"img/cell2anim_ss.png",
	"img/cell3anim_ss.png"
    ],
    
    objAtomic:[
	"img/atomic_object1ss.png",
	"img/atomic_object2ss.png",
	"img/atomic_object3ss.png"
    ],
    
    objPeople:
    [
	"img/people_object1ss.png",
	"img/people_object2ss.png",
	"img/people_object3ss.png"
    ]
};


var Block = function(size, deg, accel, image, omega) {
    this.maxSize = size;
    this.size = 0;
    this.deg = deg;
    this.accel = accel;
    this.collisionSize = 0;
    this.image = Loader.getFile(image);
    if (image.indexOf("ss.png", image.length - 6) !== -1) {
        this.animated = true;
    } else {
        this.animated = false;
    }
    
    this.omega = 0; // angular velocity
    if (omega != null) {
	this.omega = omega; 
    }
    
    this.animTime = 0;
    this.r = 0;
    this.x = Viewport.width / 2;
    this.y = Viewport.height / 2;
    this.velocity = 0;
    Blocks.push(this);
}

Block.prototype.update = function(deltaT) {
    deltaT *= gameSpeed;
    this.r += deltaT / 10.0 * this.velocity;
    if(this.r > 600)
    {
	this.destroy();
    }
    
    this.size = this.r / PlayerDist * this.maxSize;
    
    this.velocity += deltaT / 1000 * this.accel;
    //Jordan 2/11: Removed to change the individual speed bullets in patterns can go
    //if (this.velocity > 1) {
    //  this.velocity = 1;
    //}
    if (this.omega == -1) {
	var diff = Avatar.deg - this.deg;
	if (diff > 180) {
	    diff = 360 - diff;
	}
	if (diff < -180) {
	    diff = 360 + diff;
	}
	
	if (Math.abs(diff) < 30) {
	    this.deg += diff * deltaT / 1000;
	}
	
    } else {	    
	this.deg += this.omega * deltaT / 1000;
    }
    
    if (this.deg < 0) {
	this.deg += 360;
    } else if (this.deg > 360) {
	this.deg -= 360;
    }
    
    this.directionX = Math.cos((Math.PI/180) * this.deg);
    this.directionY = Math.sin((Math.PI/180) * this.deg);
    
    this.x = Viewport.width / 2 + this.r * this.directionX;
    this.y = Viewport.height / 2 - this.r * this.directionY;
    this.collisionSize = this.size;
}

Block.prototype.draw = function(deltaT) {
    if(debug)
    {
	_Context.fillStyle = "blue";
	_Context.beginPath();
	_Context.arc(this.x, this.y, this.size*0.75, 0, Math.PI*2, true); 
	_Context.closePath();
	_Context.fill();
    }
    if (!this.animated) {
	
	_Context.drawImage(
            this.image,
            this.x - this.size, 
            this.y - this.size, 
            this.size*2, this.size*2);
    } else {
	
        this.animTime += Math.floor(deltaT);
        this.animTime = this.animTime % 200;
	
        if (this.animTime < 100) {
            // Frame 1
            _Context.drawImage(
                this.image,
                0, 0, 
                this.image.width / 2, this.image.height,
                this.x - this.size, this.y - this.size, 
                this.size * 2, this.size * 2);
        } else {
            // Frame 2
            _Context.drawImage(
                this.image,
                this.image.width / 2, 0, 
                this.image.width / 2, this.image.height,
                this.x - this.size, this.y - this.size, 
                this.size * 2, this.size * 2);
        }
    }
}

Block.prototype.destroy = function() {
    destroyObject(Blocks, this);
}
var Wave = function() {
    this.time = 0;
    this.scale = 1.0;
    this.triggered = false;
    this.deg = 0;
    this.image = "";
    this.accel = 0;
    this.omega = 0; // angular velocity.
}

var Level = function() {
    this.waves = [];
    this.levelTimer = 0.0;
    this.level = 1;
}
    
Level.prototype.LoadPattern = function(patternNumber, size, time, offset, 
				       flipped, omega, image) {
    var selectedPat = Patterns["pattern" + patternNumber];
    if (selectedPat == null) {
	selectedPat = Patterns.pattern1a;
    }
    
    for(var i = 0; i < selectedPat.length;i++)
    {
	var wave = new Wave();
	wave.time = (time + selectedPat[i][0]) / 1000.0;
	wave.scale = size;
	wave.accel = selectedPat[i][1];
	wave.deg = offset + selectedPat[i][2];
	if (flipped != 0) {
	    wave.deg = -wave.deg;
	}
	wave.image = image;
	wave.omega = omega;
	this.waves.push(wave);
    }		
}
    
Level.prototype.LoadWaves = function(targetLevel)
{
    var levelToLoad;
    this.waves = [];
    
    targetLevel = ((targetLevel - 1) %  Object.keys(Levels).length) + 1;
    
    this.level = targetLevel;
    
    levelToLoad = Levels["level" + targetLevel];
    if (levelToLoad == null) {
        levelToLoad = Levels.level1;
    }
    
    var rows = levelToLoad.length;
    for(var i = 0; i < rows;i++)
    {
        var wave = new Wave();
	
        //Load the Time
        var time;
        time = levelToLoad[i][0]; 
	
        //Load the Pattern
        var PatternNum;
        patternNum  = levelToLoad[i][1];
        
        //Load the image
        wave.image = levelToLoad[i][2];
        
        //Load the Size
        var scale;
        scale = 20 * levelToLoad[i][3];
        
        //Load the offset
        var offset = levelToLoad[i][4];
        
        //Load the flipped flag
        var flipped = 0;
        if (levelToLoad[i].length > 5) {
            flipped = levelToLoad[i][5];
        }
	
        //Load the angular velocity
        var omega = 0;
        if (levelToLoad[i].length > 6) {
            omega = levelToLoad[i][6];
        }
        
        wave.triggered = false;
        
        if(scale > 0.1) {
            this.LoadPattern(patternNum, scale, time, offset, flipped,
                             omega, wave.image);
        }
    }
}

Level.prototype.update = function(deltaT)
{
    if (!resetting) {
        this.levelTimer += deltaT / 1000.0;
        for (var i = 0; i < this.waves.length;i++)
        {
            if (this.levelTimer > this.waves[i].time)
            {
                if (this.waves[i].triggered == false)
                {
                    this.waves[i].triggered = true;
                    
                    this.setImage(this.waves[i]);
                    if (this.waves[i].omega == 1) {
                        this.waves[i].omega = 0;
                        this.waves[i].deg += Avatar.deg; 
                    }
                    spawnBlock(this.waves[i].scale,this.waves[i].deg,
                               this.waves[i].accel,this.waves[i].image,
                               this.waves[i].omega);
                }
            }
            
            if (this.levelTimer > this.waves[this.waves.length-2].time)
            {
                this.LoadWaves(BgIters * BgList.length + BgIndex + 1);
                this.levelTimer = -5.0;
                transition();
            }
        }
    }
}

Level.prototype.reset = function()
{
    this.levelTimer = -3.0;
    
    // Load the first level of the current iteration.
    this.LoadWaves(LastIterationSelected * BgList.length + 1);
    
    var length = Backgrounds.length;
    for (var i = 0; i < length; i++) {
        var bg = Backgrounds.pop();
        bg.destroy();
    }
    
    Backgrounds = [];
    gameSpeed = INITIAL_GAME_SPEED;
    Avatar.keyCode = 0;
    resetting = true;
    
    var rev =  SoundMan.getSound("sound/pianoreverse.mp3");
    if (rev) {
        rev.play();
    }
    
    new Backup(1.0);
}

Level.prototype.keydown =  function(e) {
  if (e.keyCode == 49) {
    this.cheat();
  }
}

Level.prototype.cheat = function() {
  if (Backgrounds.length <= 3) {
    transition();
    //this.LoadWaves(BgIndex+1);
    this.LoadWaves(BgIters * BgList.length + BgIndex + 1);
    this.levelTimer = -1.5;
  }
}
    
Level.prototype.setImage =  function(wave)
{
    var imgArray = ImageSets[wave.image];
    if (imgArray == null) {
	imgArray = ImageSets["objGalaxy"];
    }
    var temp = Math.floor(Math.random() * imgArray.length);
    wave.image = imgArray[temp];	
}

Backups = [];
var Backup = function(initialScale) {
    BgIndex--;
    if (BgIndex < 0) {
        BgIndex = BgList.length - 1;
    }
    
    this.img = Loader.getFile(BgList[BgIndex]);
    this.scale = initialScale;
    this.alpha = 0.50;
    this.linked = false;
    this.intransition = false;
    Backups.push(this);
}
 
Backup.prototype.update = function(deltaT) {
    this.scale -= deltaT / 1000.0;
    this.alpha += deltaT / 1000.0;
    
    if ((this.scale < 1.00) && (this.scale > 0.85)) {
        this.scale = 0.85;
    }
    
    if (this.alpha > 1.0) {
        this.alpha = 1.0;            
    } else if (this.alpha < 0.0) {
        this.alpha = 0.0;
    }
    
    if (this.scale < 0.2) {
        if (!this.linked) {
            if (BgIndex != 0) {
                new Backup(1.0);
            } else {
                if (BgIters > LastIterationSelected) {
                    BgIters--;
                    new Backup(1.0);
                }
            }
            this.linked = true;
        }
    }
    
    if (this.scale < 0.1) {
        this.destroy();
    }
}

Backup.prototype.draw =  function(deltaT) {
    _Context.globalAlpha = this.alpha;
    _Context.drawImage(this.img, 
                      (Viewport.width / 2  
		       - this.img.width / 2 * this.scale),
                      (Viewport.height / 2 
                       - this.img.height / 2 * this.scale),
                      this.img.width * this.scale,
                      this.img.height * this.scale);
    _Context.globalAlpha = 1.0;
}

Backup.prototype.destroy = function() {
    destroyObject(Backups, this);
    if (Backups.length == 0) {
        Avatar.deg = 270;
        resetting = false;
        new Background(1.0);
    }
}
BgList = ["img/universe.png",
          "img/solarsystem.png",
          "img/continent.png",
          "img/street.png",
          "img/people.png",
          "img/cellular.png",
          "img/atomic.png"];
AudioList = ["sound/1-whirring.mp3",
             "sound/spaceradio.mp3",
             "sound/3-birds.mp3",
             "sound/4-street.mp3",
             "sound/elevator-beep.mp3",
             "sound/5-heartbeat.mp3",
             "sound/7-humming.mp3",
            ];
BgIndex = 0;
BgIters = 0; // Number of times we have gone through the levels.

Backgrounds = [];
var Background = function(speed) {
    if (BgIndex >= BgList.length) {
        BgIndex = 0;
        IterationsCompleted[BgIters] = "1";
        saveIterationsState();
        BgIters++;
	saveCurrentIterationState();
    }
    
    this.img = Loader.getFile(BgList[BgIndex]);        
    this.scale = 1.30;
    this.alpha = 0;
    this.linked = false;
    this.speed = speed;
    this.intransition = false;
    
    this.bgTheme = SoundMan.getSound(AudioList[BgIndex++]);
    if (this.bgTheme) {
	this.bgTheme.play(true);
    }
    
    Backgrounds.push(this);
    
    //var that = this;
    //setTimeout(function() {
    //    that.transition();
    //}, 10000);
}


Background.prototype.update = function(deltaT) {
    if (this.intransition) {
        this.scale += deltaT / 10.0;            
    } else {
        this.scale += deltaT * this.speed / 5000.0;
        if ((this.scale > 0.85) && (this.scale < 1.00)) {
            this.scale = 1.00;
        }
    }
    
    if ((this.scale < 100) || (!this.transition)) {
        this.alpha += deltaT / 5000.0;
    } else {
        this.alpha -= deltaT / 1000.0;
    }
    
    if (this.alpha > 1.0) {
        this.alpha = 1.0;            
    } else if (this.alpha < 0.0) {
        this.alpha = 0.0;
    }
    
    if (this.intransition) {
        if (!this.linked) {
            new Background(1.0);
            this.linked = true;
        }
    }
    if (this.scale > 300) {
        this.destroy();
    }
}

Background.prototype.transition = function() {
    this.intransition = true;
}

Background.prototype.draw =  function(deltaT) {
    _Context.globalAlpha = this.alpha;
    _Context.drawImage(this.img, 
                      (Viewport.width / 2  
		       - this.img.width / 2 * this.scale),
                      (Viewport.height / 2
		       - this.img.height / 2 * this.scale),
                      this.img.width * this.scale,
                      this.img.height * this.scale);
    _Context.globalAlpha = 1.0;
}

Background.prototype.destroy = function() {
    if (this.bgTheme) {
        this.bgTheme.stop();
    }
    destroyObject(Backgrounds, this);
}
/*
  =======
  Format
  (spanwnTimeInMilliSecs, patternSuffix, ImageSet, Acceleration, OffsetDeg,
  flipFlag, angularVelocity)
  
  Special values for angularVelocity:
  -1 : Home towards player
  +1 : Offset by the angle the player is at

  objUniverse
  objGalaxy
  objContinent
  objCity
  objPeople
  objCell
  objAtomic
  objMountain
*/

var Levels = 
    {

	/* for quick test
	   level1: [

	   ],  
	*/

	/* universe: celestial objects (cherries) */
	level1: [
	    [100,"1","objUniverse", 2.0, 270, 0, 0],
	    [1000,"1","objUniverse", 2.0, 337.5, 0, 0],
	    [3500,"1","objUniverse", 2.0, 180, 0, 0],
	    [5000,"1","objUniverse", 2.0, 180, -1, 0],
	    [5500,"3","objUniverse", 3.0, 270, 0, 0],
	    [6000,"3","objUniverse", 4.0, 90, 0, 0],

	    [8000,"5a","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5a","objUniverse", 1.0, 135, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 135, 0, 0],
	    [11500,"0","objGalaxy", 2.5, 0, 0],
	],
	level8: [
	    [100,"1_five","objUniverse", 1.5, 90, 0, 0],
	    [1000,"1_five","objUniverse", 1.5, 270, 0, 0],
	    [3500,"1_five","objUniverse", 1.8, 180, 0, 0],
	    [5000,"1_five","objUniverse", 1.8, 180, -1, 0],
	    [5500,"3","objUniverse", 3.0, 270, 0, 0],
	    [6000,"3","objUniverse", 4.0, 90, 0, 0],
	    
	    [8000,"5a","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5a","objUniverse", 1.0, 135, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 135, 0, 0],

	    [9000,"5a","objUniverse", 1.0, 270, 0, 0],
	    [9000,"5b","objUniverse", 1.0, 270, 0, 0],
	    [9000,"5a","objUniverse", 1.0, 90, 0, 0],
	    [9000,"5b","objUniverse", 1.0, 90, 0, 0],
	    
	    [11500,"0","objGalaxy", 2.5, 0, 0, 0],
	],
	level15: [
	    [100,"1_seven","objUniverse", 1.5, 90, 0, 0],
	    [1000,"1_seven","objUniverse", 1.5, 270, 0, 0],
	    [3500,"1_seven","objUniverse", 1.8, 180, 0, 0],
	    [5000,"1_seven","objUniverse", 1.8, 180, -1, 0],	
	    
	    [5500,"3","objUniverse", 3.0, 270, 0, 0],
	    [6000,"3","objUniverse", 4.0, 90, 0, 0],
	    
	    [8000,"5a","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5a","objUniverse", 1.0, 135, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 135, 0, 0],
	    
	    [9000,"5a","objUniverse", 1.0, 270, 0, 0],
	    [9000,"5b","objUniverse", 1.0, 270, 0, 0],
	    [9000,"5a","objUniverse", 1.0, 90, 0, 0],
	    [9000,"5b","objUniverse", 1.0, 90, 0, 0],
	    
	    [10000,"5a","objUniverse", 1.0, 225, 0, 0],
	    [10000,"5b","objUniverse", 1.0, 225, 0, 0],
	    [10000,"5a","objUniverse", 1.0, 45, 0, 0],
	    [10000,"5b","objUniverse", 1.0, 45, 0, 0],
	    
	    [11500,"0","objGalaxy", 2.5, 0, 0, 0],
	],
	level22: [
	    [100,"1_nine","objUniverse", 1.5, 90, 0, 0],
	    [1000,"1_nine","objUniverse", 1.5, 270, 0, 0],
	    [3500,"1_nine","objUniverse", 1.8, 180, 0, 0],
	    [5000,"1_nine","objUniverse", 1.8, 180, -1, 0],	
	    
	    [5500,"3","objUniverse", 3.0, 270, 0, 0],
	    [6000,"3","objUniverse", 4.0, 90, 0, 0],
	    
	    [8000,"5a","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 315, 0, 0],
	    [8000,"5a","objUniverse", 1.0, 135, 0, 0],
	    [8000,"5b","objUniverse", 1.0, 135, 0, 0],
	    
	    [9000,"5a","objUniverse", 1.0, 270, 0, 0],
	    [9000,"5b","objUniverse", 1.0, 270, 0, 0],
	    [9000,"5a","objUniverse", 1.0, 90, 0, 0],
	    [9000,"5b","objUniverse", 1.0, 90, 0, 0],
	    
	    [10000,"5a","objUniverse", 1.0, 225, 0, 0],
	    [10000,"5b","objUniverse", 1.0, 225, 0, 0],
	    [10000,"5a","objUniverse", 1.0, 45, 0, 0],
	    [10000,"5b","objUniverse", 1.0, 45, 0, 0],

	    [10750,"5a","objUniverse", 1.0, 180, 0, 0],
	    [10750,"5b","objUniverse", 1.0, 180, 0, 0],
	    [10750,"5a","objUniverse", 1.0, 0, 0, 0],
	    [10750,"5b","objUniverse", 1.0, 0, 0, 0],

	    [11500,"5a","objUniverse", 1.0, 180, 0, 0],
	    [11500,"5b","objUniverse", 1.0, 180, 0, 0],
	    [11500,"5a","objUniverse", 1.0, 0, 0, 0],
	    [11500,"5b","objUniverse", 1.0, 0, 0, 0],
	    
	    [11500,"0","objGalaxy", 2.5, 0, 0, 0],
	],
	level29: [
	    [100,"1_seven","objUniverse", 1.5, 90, -1, 0],
	    [1000,"1_seven","objUniverse", 1.5, 270, -1, 0],
	    [3500,"1_seven","objUniverse", 1.8, 180, -1, 0],
	    [5000,"1_seven","objUniverse", 1.8, 180, 0, 0],	
	    
	    [5500,"3","objUniverse", 3.0, 270, -1, 0],
	    [6000,"3","objUniverse", 4.0, 90, -1, 0],
	    
	    [8000,"5a","objUniverse", 1.0, 315, -1, 0],
	    [8000,"5b","objUniverse", 1.0, 315, -1, 0],
	    [8000,"5a","objUniverse", 1.0, 135, -1, 0],
	    [8000,"5b","objUniverse", 1.0, 135, -1, 0],
	    
	    [9000,"5a","objUniverse", 1.0, 270, -1, 0],
	    [9000,"5b","objUniverse", 1.0, 270, -1, 0],
	    [9000,"5a","objUniverse", 1.0, 90, -1, 0],
	    [9000,"5b","objUniverse", 1.0, 90, -1, 0],
	    
	    [10000,"5a","objUniverse", 1.0, 225, -1, 0],
	    [10000,"5b","objUniverse", 1.0, 225, -1, 0],
	    [10000,"5a","objUniverse", 1.0, 45, -1, 0],
	    [10000,"5b","objUniverse", 1.0, 45, -1, 0],
	    
	    [11500,"0","objGalaxy", 2.5, 0, -1, 0],
	],

	level36:[
	    [100,"1_five","objUniverse", 1.5, 90, -1, 0],
	    [1000,"1_five","objUniverse", 1.5, 270, -1, 0],
	    [3500,"1_five","objUniverse", 1.8, 180, -1, 0],
	    [5000,"1_five","objUniverse", 1.8, 180, -1, 0],
	    [5500,"3","objUniverse", 3.0, 270, -1, 0],
	    [6000,"3","objUniverse", 4.0, 90, -1, 0],
	    
	    [8000,"5a","objUniverse", 1.0, 315, -1, 0],
	    [8000,"5b","objUniverse", 1.0, 315, -1, 0],
	    [8000,"5a","objUniverse", 1.0, 135, -1, 0],
	    [8000,"5b","objUniverse", 1.0, 135, -1, 0],

	    [9000,"5a","objUniverse", 1.0, 270, -1, 0],
	    [9000,"5b","objUniverse", 1.0, 270, -1, 0],
	    [9000,"5a","objUniverse", 1.0, 90, -1, 0],
	    [9000,"5b","objUniverse", 1.0, 90, -1, 0],
	    
	    [11500,"0","objGalaxy", 2.5, 0, -1, 0],
	],
	level43:[
	    [100,"1","objUniverse", 2.0, 270, -1, 0],
	    [1000,"1","objUniverse", 2.0, 337.5, -1, 0],
	    [3500,"1","objUniverse", 2.0, 180, -1, 0],
	    [5000,"1","objUniverse", 2.0, 180, 0, 0],
	    [5500,"3","objUniverse", 3.0, 270, -1, 0],
	    [6000,"3","objUniverse", 4.0, 90, -1, 0],

	    [8000,"5a","objUniverse", 1.0, 315, -1, 0],
	    [8000,"5b","objUniverse", 1.0, 315, -1, 0],
	    [8000,"5a","objUniverse", 1.0, 135, -1, 0],
	    [8000,"5b","objUniverse", 1.0, 135, -1, 0],
	    [11500,"0","objGalaxy", 2.5, -1, 0],
	],


	/* asteroid, earth, jupiter, moon, planets (basic spiral) */    
	level2: [
	    [100,"0","objUniverse", 6.5, 0, 0, 0],
	    [1250,"0","objGalaxy", 2.0, 90, 0, 0],
	    [1500,"0","objGalaxy", 2.5, 180, 0, 0],
	    [1750,"0","objGalaxy", 3.0, 270, 0, 0],
	    [2000,"0","objGalaxy", 3.5, 315, 0, 0],
	    [2500,"0","objGalaxy", 3.5, 0, 0, 0],
	    [3000,"0","objGalaxy", 3.5, 22.5, 0, 0],
	    [3500,"0","objGalaxy", 3.5, 45, 0, 0],
	    [4000,"0","objGalaxy", 3.5, 67.5, 0, 0],
	    [4330,"0","objGalaxy", 3.5, 90, 0, 0],
	    [4660,"0","objGalaxy", 3.5, 112.5, 0, 0],
	    [5000,"0","objGalaxy", 3.5, 135, 0, 0],
	    [5250,"0","objGalaxy", 3.5, 157.5, 0, 0],
	    [5500,"0","objGalaxy", 3.5, 180, 0, 0],
	    [6750,"0","objGalaxy", 3.5, 202.5, 0, 0],
	    [6000,"0","objGalaxy", 3.5, 225, 0, 0],
	],

	level9: [
	    [100,"0","objUniverse", 7.5, 0, 0, 0],
	    [1250,"0","objGalaxy", 2.0, 90, 0, 0],
	    [1500,"0","objGalaxy", 2.5, 180, 0, 0],
	    [1750,"0","objGalaxy", 3.0, 270, 0, 0],
	    [2000,"0","objGalaxy", 3.5, 315, 0, 0],
	    
	    [2500,"0","objGalaxy", 3.5, 0, 0, 0],
	    [3000,"0","objGalaxy", 3.5, 22.5, 0, 0],
	    [3500,"0","objGalaxy", 3.5, 45, 0, 0],
	    [4000,"0","objGalaxy", 3.6, 67.5, 0, 0],
	    [4330,"0","objGalaxy", 3.6, 90, 0, 0],
	    [4660,"0","objGalaxy", 3.6, 112.5, 0, 0],
	    [5000,"0","objGalaxy", 3.7, 135, 0, 0],
	    [5250,"0","objGalaxy", 3.7, 157.5, 0, 0],
	    [5500,"0","objGalaxy", 3.7, 180, 0, 0],
	    [6750,"0","objGalaxy", 3.8, 202.5, 0, 0],
	    [7000,"0","objGalaxy", 3.8, 225, 0, 0],
	    [7250,"0","objGalaxy", 3.8, 247.5, 0, 0],
	    [7500,"0","objGalaxy", 3.9, 270, 0, 0],
	    [7750,"0","objGalaxy", 3.9, 292.5, 0, 0],
	    [8000,"0","objGalaxy", 3.9, 315, 0, 0],
	    [8250,"0","objGalaxy", 3.9, 0, 0, 0],

	    [4500,"0","objGalaxy", 3.5, 0, 0, 10],
	    [5000,"0","objGalaxy", 3.5, 22.5, 0, 10],
	    [5500,"0","objGalaxy", 3.5, 45, 0, 10],
	    [6000,"0","objGalaxy", 3.6, 67.5, 0, 10],
	    [6330,"0","objGalaxy", 3.6, 90, 0, 10],
	    [6660,"0","objGalaxy", 3.6, 112.5, 0, 10],
	    [7000,"0","objGalaxy", 3.7, 135, 0, 10],
	    [7250,"0","objGalaxy", 3.7, 157.5, 0, 10],
	    [7500,"0","objGalaxy", 3.7, 180, 0, 10],
	    [8750,"0","objGalaxy", 3.8, 202.5, 0, 10],
	    [8000,"0","objGalaxy", 3.8, 225, 0, 10],
	    [8250,"0","objGalaxy", 3.8, 247.5, 0, 10],
	    [8500,"0","objGalaxy", 3.9, 270, 0, 10],
	    [8750,"0","objGalaxy", 3.9, 292.5, 0, 10],
	    [9000,"0","objGalaxy", 3.9, 315, 0, 10],
	    [9250,"0","objGalaxy", 4.0, 0, 0, 10],
	],

	level16: [
	    [100,"0","objUniverse", 8.5, 0, 0, 0],
	    [1250,"0","objGalaxy", 2.0, 90, 0, 0],
	    [1500,"0","objGalaxy", 2.5, 180, 0, 0],
	    [1750,"0","objGalaxy", 3.0, 270, 0, 0],
	    [2000,"0","objGalaxy", 3.5, 315, 0, 0],
	    
	    [2500,"0","objGalaxy", 3.5, 0, 0, 0],
	    [3000,"0","objGalaxy", 3.5, 22.5, 0, 0],
	    [3500,"0","objGalaxy", 3.5, 45, 0, 0],
	    [4000,"0","objGalaxy", 3.6, 67.5, 0, 0],
	    [4330,"0","objGalaxy", 3.6, 90, 0, 0],
	    [4660,"0","objGalaxy", 3.6, 112.5, 0, 0],
	    [5000,"0","objGalaxy", 3.7, 135, 0, 0],
	    [5250,"0","objGalaxy", 3.7, 157.5, 0, 0],
	    [5500,"0","objGalaxy", 3.7, 180, 0, 0],
	    [6750,"0","objGalaxy", 3.8, 202.5, 0, 0],
	    [7000,"0","objGalaxy", 3.8, 225, 0, 0],
	    [7250,"0","objGalaxy", 3.8, 247.5, 0, 0],
	    [7500,"0","objGalaxy", 3.9, 270, 0, 0],
	    [7750,"0","objGalaxy", 3.9, 292.5, 0, 0],
	    [8000,"0","objGalaxy", 3.9, 315, 0, 0],
	    [8250,"0","objGalaxy", 4.0, 0, 0, 0],

	    [4500,"0","objGalaxy", 3.5, 0, 0, 0],
	    [5000,"0","objGalaxy", 3.5, 22.5, 0, 0],
	    [5500,"0","objGalaxy", 3.5, 45, 0, 0],
	    [6000,"0","objGalaxy", 3.6, 67.5, 0, 0],
	    [6330,"0","objGalaxy", 3.6, 90, 0, 0],
	    [6660,"0","objGalaxy", 3.6, 112.5, 0, 0],
	    [7000,"0","objGalaxy", 3.7, 135, 0, 0],
	    [7250,"0","objGalaxy", 3.7, 157.5, 0, 0],
	    [7500,"0","objGalaxy", 3.7, 180, 0, 0],
	    [8750,"0","objGalaxy", 3.8, 202.5, 0, 0],
	    [8000,"0","objGalaxy", 3.8, 225, 0, 0],
	    [8250,"0","objGalaxy", 3.8, 247.5, 0, 0],
	    [8500,"0","objGalaxy", 3.9, 270, 0, 0],
	    [8750,"0","objGalaxy", 3.9, 292.5, 0, 0],
	    [9000,"0","objGalaxy", 3.9, 315, 0, 0],
	    [9250,"0","objGalaxy", 4.0, 0, 0, 0],
	    
	    [6500,"0","objGalaxy", 3.5, 0, 0, 0],
	    [7000,"0","objGalaxy", 3.5, 22.5, 0, 0],
	    [7500,"0","objGalaxy", 3.5, 45, 0, 0],
	    [8000,"0","objGalaxy", 3.6, 67.5, 0, 0],
	    [8330,"0","objGalaxy", 3.6, 90, 0, 0],
	    [8660,"0","objGalaxy", 3.6, 112.5, 0, 0],
	    [9000,"0","objGalaxy", 3.7, 135, 0, 0],
	    [9250,"0","objGalaxy", 3.7, 157.5, 0, 0],
	    [9500,"0","objGalaxy", 3.7, 180, 0, 0],
	    [9750,"0","objGalaxy", 3.8, 202.5, 0, 0],
	    [10000,"0","objGalaxy", 3.8, 225, 0, 0],
	    [10250,"0","objGalaxy", 3.8, 247.5, 0, 0],
	    [10500,"0","objGalaxy", 3.9, 270, 0, 0],
	    [10750,"0","objGalaxy", 3.9, 292.5, 0, 0],
	    [11800,"0","objGalaxy", 3.9, 315, 0, 0],
	    [11800,"0","objGalaxy", 4.0, 0, 0, 0],	
	],
	
	level23:[
	    [100,"0","objUniverse", 8.5, 0, 0, 70],
	    [1250,"0","objGalaxy", 2.0, 90, 0, 70],
	    [1500,"0","objGalaxy", 2.5, 180, 0, 70],
	    [1750,"0","objGalaxy", 3.0, 270, 0, 70],
	    [2000,"0","objGalaxy", 3.5, 315, 0, 70],
	    
	    [2500,"0","objGalaxy", 3.5, 0, 0, 70],
	    [3000,"0","objGalaxy", 3.5, 22.5, 0, 70],
	    [3500,"0","objGalaxy", 3.5, 45, 0, 70],
	    [4000,"0","objGalaxy", 3.6, 67.5, 0, 70],
	    [4330,"0","objGalaxy", 3.6, 90, 0, 70],
	    [4660,"0","objGalaxy", 3.6, 112.5, 0, 70],
	    [5000,"0","objGalaxy", 3.7, 135, 0, 70],
	    [5250,"0","objGalaxy", 3.7, 157.5, 0, 70],
	    [5500,"0","objGalaxy", 3.7, 180, 0, 70],
	    [6750,"0","objGalaxy", 3.8, 202.5, 0, 70],
	    [7000,"0","objGalaxy", 3.8, 225, 0, 70],
	    [7250,"0","objGalaxy", 3.8, 247.5, 0, 70],
	    [7500,"0","objGalaxy", 3.9, 270, 0, 70],
	    [7750,"0","objGalaxy", 3.9, 292.5, 0, 70],
	    [8000,"0","objGalaxy", 3.9, 315, 0, 70],
	    [8250,"0","objGalaxy", 4.0, 0, 0, 70],

	    [4500,"0","objGalaxy", 3.5, 0, 0, 70],
	    [5000,"0","objGalaxy", 3.5, 22.5, 0, 70],
	    [5500,"0","objGalaxy", 3.5, 45, 0, 70],
	    [6000,"0","objGalaxy", 3.6, 67.5, 0, 70],
	    [6330,"0","objGalaxy", 3.6, 90, 0, 70],
	    [6660,"0","objGalaxy", 3.6, 112.5, 0, 70],
	    [7000,"0","objGalaxy", 3.7, 135, 0, 70],
	    [7250,"0","objGalaxy", 3.7, 157.5, 0, 70],
	    [7500,"0","objGalaxy", 3.7, 180, 0, 70],
	    [8750,"0","objGalaxy", 3.8, 202.5, 0, 70],
	    [8000,"0","objGalaxy", 3.8, 225, 0, 70],
	    [8250,"0","objGalaxy", 3.8, 247.5, 0, 70],
	    [8500,"0","objGalaxy", 3.9, 270, 0, 70],
	    [8750,"0","objGalaxy", 3.9, 292.5, 0, 70],
	    [9000,"0","objGalaxy", 3.9, 315, 0, 70],
	    [9250,"0","objGalaxy", 4.0, 0, 0, 70],
	    
	    [6500,"0","objGalaxy", 3.5, 0, 0, 70],
	    [7000,"0","objGalaxy", 3.5, 22.5, 0, 70],
	    [7500,"0","objGalaxy", 3.5, 45, 0, 70],
	    [8000,"0","objGalaxy", 3.6, 67.5, 0, 70],
	    [8330,"0","objGalaxy", 3.6, 90, 0, 70],
	    [8660,"0","objGalaxy", 3.6, 112.5, 0, 70],
	    [9000,"0","objGalaxy", 3.7, 135, 0, 70],
	    [9250,"0","objGalaxy", 3.7, 157.5, 0, 70],
	    [9500,"0","objGalaxy", 3.7, 180, 0, 70],
	    [9750,"0","objGalaxy", 3.8, 202.5, 0, 70],
	    [10000,"0","objGalaxy", 3.8, 225, 0, 70],
	    [10250,"0","objGalaxy", 3.8, 247.5, 0, 70],
	    [10500,"0","objGalaxy", 3.9, 270, 0, 70],
	    [10750,"0","objGalaxy", 3.9, 292.5, 0, 70],
	    [11800,"0","objGalaxy", 3.9, 315, 0, 70],
	    [11800,"0","objGalaxy", 4.0, 0, 0, 70],	
	],	
	level30:[
	    [100,"0","objUniverse", 8.5, 0, -1, 0],
	    [1250,"0","objGalaxy", 2.0, 90, -1, 0],
	    [1500,"0","objGalaxy", 2.5, 180, -1, 0],
	    [1750,"0","objGalaxy", 3.0, 270, -1, 0],
	    [2000,"0","objGalaxy", 3.5, 315, -1, 0],
	    
	    [2500,"0","objGalaxy", 3.5, 0, -1, 0],
	    [3000,"0","objGalaxy", 3.5, 22.5, -1, 0],
	    [3500,"0","objGalaxy", 3.5, 45, -1, 0],
	    [4000,"0","objGalaxy", 3.6, 67.5, -1, 0],
	    [4330,"0","objGalaxy", 3.6, 90, -1, 0],
	    [4660,"0","objGalaxy", 3.6, 112.5, -1, 0],
	    [5000,"0","objGalaxy", 3.7, 135, -1, 0],
	    [5250,"0","objGalaxy", 3.7, 157.5, -1, 0],
	    [5500,"0","objGalaxy", 3.7, 180, -1, 0],
	    [6750,"0","objGalaxy", 3.8, 202.5, -1, 0],
	    [7000,"0","objGalaxy", 3.8, 225, -1, 0],
	    [7250,"0","objGalaxy", 3.8, 247.5, -1, 0],
	    [7500,"0","objGalaxy", 3.9, 270, -1, 0],
	    [7750,"0","objGalaxy", 3.9, 292.5, -1, 0],
	    [8000,"0","objGalaxy", 3.9, 315, -1, 0],
	    [8250,"0","objGalaxy", 4.0, 0, -1, 0],

	    [4500,"0","objGalaxy", 3.5, 0, -1, 0],
	    [5000,"0","objGalaxy", 3.5, 22.5, -1, 0],
	    [5500,"0","objGalaxy", 3.5, 45, -1, 0],
	    [6000,"0","objGalaxy", 3.6, 67.5, -1, 0],
	    [6330,"0","objGalaxy", 3.6, 90, -1, 0],
	    [6660,"0","objGalaxy", 3.6, 112.5, -1, 0],
	    [7000,"0","objGalaxy", 3.7, 135, -1, 0],
	    [7250,"0","objGalaxy", 3.7, 157.5, -1, 0],
	    [7500,"0","objGalaxy", 3.7, 180, -1, 0],
	    [8750,"0","objGalaxy", 3.8, 202.5, -1, 0],
	    [8000,"0","objGalaxy", 3.8, 225, -1, 0],
	    [8250,"0","objGalaxy", 3.8, 247.5, -1, 0],
	    [8500,"0","objGalaxy", 3.9, 270, -1, 0],
	    [8750,"0","objGalaxy", 3.9, 292.5, -1, 0],
	    [9000,"0","objGalaxy", 3.9, 315, -1, 0],
	    [9250,"0","objGalaxy", 4.0, 0, -1, 0],
	    
	    [6500,"0","objGalaxy", 3.5, 0, -1, 0],
	    [7000,"0","objGalaxy", 3.5, 22.5, -1, 0],
	    [7500,"0","objGalaxy", 3.5, 45, -1, 0],
	    [8000,"0","objGalaxy", 3.6, 67.5, -1, 0],
	    [8330,"0","objGalaxy", 3.6, 90, -1, 0],
	    [8660,"0","objGalaxy", 3.6, 112.5, -1, 0],
	    [9000,"0","objGalaxy", 3.7, 135, -1, 0],
	    [9250,"0","objGalaxy", 3.7, 157.5, -1, 0],
	    [9500,"0","objGalaxy", 3.7, 180, -1, 0],
	    [9750,"0","objGalaxy", 3.8, 202.5, -1, 0],
	    [10000,"0","objGalaxy", 3.8, 225, -1, 0],
	    [10250,"0","objGalaxy", 3.8, 247.5, -1, 0],
	    [10500,"0","objGalaxy", 3.9, 270, -1, 0],
	    [10750,"0","objGalaxy", 3.9, 292.5, -1, 0],
	    [11800,"0","objGalaxy", 3.9, 315, -1, 0],
	    [11800,"0","objGalaxy", 4.0, 0, -1, 0],	
	],
	level37:[
	    [100,"0","objUniverse", 7.5, 0, -1, 0],
	    [1250,"0","objGalaxy", 2.0, 90, -1, 0],
	    [1500,"0","objGalaxy", 2.5, 180, -1, 0],
	    [1750,"0","objGalaxy", 3.0, 270, -1, 0],
	    [2000,"0","objGalaxy", 3.5, 315, -1, 0],
	    
	    [2500,"0","objGalaxy", 3.5, 0, -1, 0],
	    [3000,"0","objGalaxy", 3.5, 22.5, -1, 0],
	    [3500,"0","objGalaxy", 3.5, 45, -1, 0],
	    [4000,"0","objGalaxy", 3.6, 67.5, -1, 0],
	    [4330,"0","objGalaxy", 3.6, 90, -1, 0],
	    [4660,"0","objGalaxy", 3.6, 112.5, -1, 0],
	    [5000,"0","objGalaxy", 3.7, 135, -1, 0],
	    [5250,"0","objGalaxy", 3.7, 157.5, -1, 0],
	    [5500,"0","objGalaxy", 3.7, 180, -1, 0],
	    [6750,"0","objGalaxy", 3.8, 202.5, -1, 0],
	    [7000,"0","objGalaxy", 3.8, 225, -1, 0],
	    [7250,"0","objGalaxy", 3.8, 247.5, -1, 0],
	    [7500,"0","objGalaxy", 3.9, 270, -1, 0],
	    [7750,"0","objGalaxy", 3.9, 292.5, -1, 0],
	    [8000,"0","objGalaxy", 3.9, 315, -1, 0],
	    [8250,"0","objGalaxy", 3.9, 0, -1, 0],

	    [4500,"0","objGalaxy", 3.5, 0, -1, 10],
	    [5000,"0","objGalaxy", 3.5, 22.5, -1, 10],
	    [5500,"0","objGalaxy", 3.5, 45, -1, 10],
	    [6000,"0","objGalaxy", 3.6, 67.5, -1, 10],
	    [6330,"0","objGalaxy", 3.6, 90, -1, 10],
	    [6660,"0","objGalaxy", 3.6, 112.5, -1, 10],
	    [7000,"0","objGalaxy", 3.7, 135, -1, 10],
	    [7250,"0","objGalaxy", 3.7, 157.5, -1, 10],
	    [7500,"0","objGalaxy", 3.7, 180, -1, 10],
	    [8750,"0","objGalaxy", 3.8, 202.5, -1, 10],
	    [8000,"0","objGalaxy", 3.8, 225, -1, 10],
	    [8250,"0","objGalaxy", 3.8, 247.5, -1, 10],
	    [8500,"0","objGalaxy", 3.9, 270, -1, 10],
	    [8750,"0","objGalaxy", 3.9, 292.5, -1, 10],
	    [9000,"0","objGalaxy", 3.9, 315, -1, 10],
	    [9250,"0","objGalaxy", 4.0, 0, -1, 10],
	],
	level44:[
	    [100,"0","objUniverse", 6.5, 0, -1, 0],
	    [1250,"0","objGalaxy", 2.0, 90, -1, 0],
	    [1500,"0","objGalaxy", 2.5, 180, -1, 0],
	    [1750,"0","objGalaxy", 3.0, 270, -1, 0],
	    [2000,"0","objGalaxy", 3.5, 315, -1, 0],
	    [2500,"0","objGalaxy", 3.5, 0, -1, 0],
	    [3000,"0","objGalaxy", 3.5, 22.5, -1, 0],
	    [3500,"0","objGalaxy", 3.5, 45, -1, 0],
	    [4000,"0","objGalaxy", 3.5, 67.5, -1, 0],
	    [4330,"0","objGalaxy", 3.5, 90, -1, 0],
	    [4660,"0","objGalaxy", 3.5, 112.5, -1, 0],
	    [5000,"0","objGalaxy", 3.5, 135, -1, 0],
	    [5250,"0","objGalaxy", 3.5, 157.5, -1, 0],
	    [5500,"0","objGalaxy", 3.5, 180, -1, 0],
	    [6750,"0","objGalaxy", 3.5, 202.5, -1, 0],
	    [6000,"0","objGalaxy", 3.5, 225, -1, 0],
	],
	/* objContinent: mountains, storms, clouds */

	level3:[
	    [100,"QuarterCircle2","objContinent",1.5,0,1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,90,1,45],

	],

	level10:[
	    [100,"QuarterCircle2","objContinent",1.5,0,1,45],
	    [500,"QuarterCircle2","objContinent",1.5,45,1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,1,45],
	    [1500,"QuarterCircle2","objContinent",1.5,135,1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,1,45],
	    [2500,"QuarterCircle2","objContinent",1.5,225,1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,1,45],
	    [3500,"QuarterCircle2","objContinent",1.5,315,1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,45,1,45],
	    [6000,"QuarterCircle2","objContinent",1.5,90,1,45],
	],

	level17:[
	    [100,"QuarterCircle2","objContinent",1.5,0,1,45],
	    [500,"QuarterCircle2","objContinent",1.5,45,1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,1,45],
	    [1500,"QuarterCircle2","objContinent",1.5,135,1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,1,45],
	    [2500,"QuarterCircle2","objContinent",1.5,225,1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,1,45],
	    [3500,"QuarterCircle2","objContinent",1.5,315,1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,45,1,45],
	    [6000,"QuarterCircle2","objContinent",1.5,90,1,45],
	    [100,"Plus","objContinent",1.0,0, 0, 0],
	    [1000,"Plus","objContinent",1.0,0, 0, 0],
	    [2000,"Plus","objContinent",1.0,0, 0, 0],
	    [3000,"Plus","objContinent",1.0,0, 0, 0],
	    [4000,"Plus","objContinent",1.0,0, 0, 0],
	    [5000,"Plus","objContinent",1.0,0, 0, 0],
	    [6000,"Plus","objContinent",1.0,0, 0, 0],
	],

	level24:[
	    [100,"QuarterCircle2","objContinent",1.5,0,1,45],
	    [500,"QuarterCircle2","objContinent",1.5,45,1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,1,45],
	    [1500,"QuarterCircle2","objContinent",1.5,135,1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,1,45],
	    [2500,"QuarterCircle2","objContinent",1.5,225,1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,1,45],
	    [3500,"QuarterCircle2","objContinent",1.5,315,1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,45,1,45],
	    [6000,"QuarterCircle2","objContinent",1.5,90,1,45],
	    [100,"Plus","objContinent",1.0,0, 0, 0],
	    [500,"Plus","objContinent",1.0,0, 0, 0],
	    [1000,"Plus","objContinent",1.0,0, 0, 0],
	    [1500,"Plus","objContinent",1.0,0, 0, 0],
	    [2000,"Plus","objContinent",1.0,0, 0, 0],
	    [2500,"Plus","objContinent",1.0,0, 0, 0],
	    [3000,"Plus","objContinent",1.0,0, 0, 0],
	    [3500,"Plus","objContinent",1.0,0, 0, 0],
	    [4000,"Plus","objContinent",1.0,0, 0, 0],
	],
	level31:[
	    [100,"QuarterCircle2","objContinent",1.5,0,-1,45],
	    [500,"QuarterCircle2","objContinent",1.5,45,-1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,-1,45],
	    [1500,"QuarterCircle2","objContinent",1.5,135,-1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,-1,45],
	    [2500,"QuarterCircle2","objContinent",1.5,225,-1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,-1,45],
	    [3500,"QuarterCircle2","objContinent",1.5,315,-1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,-1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,45,-1,45],
	    [6000,"QuarterCircle2","objContinent",1.5,90,-1,45],
	    [100,"Plus","objContinent",1.0,0, -1, 0],
	    [1000,"Plus","objContinent",1.0,0, -1, 0],
	    [2000,"Plus","objContinent",1.0,0, -1, 0],
	    [3000,"Plus","objContinent",1.0,0, -1, 0],
	    [4000,"Plus","objContinent",1.0,0, -1, 0],
	    [5000,"Plus","objContinent",1.0,0, -1, 0],
	    [6000,"Plus","objContinent",1.0,0, -1, 0],
	],
	level38:[
	    [100,"QuarterCircle2","objContinent",1.5,0,-1,45],
	    [500,"QuarterCircle2","objContinent",1.5,45,-1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,-1,45],
	    [1500,"QuarterCircle2","objContinent",1.5,135,-1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,-1,45],
	    [2500,"QuarterCircle2","objContinent",1.5,225,-1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,-1,45],
	    [3500,"QuarterCircle2","objContinent",1.5,315,-1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,-1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,45,-1,45],
	    [6000,"QuarterCircle2","objContinent",1.5,90,-1,45],
	],
	level45:[
	    [100,"QuarterCircle2","objContinent",1.5,0,-1,45],
	    [1000,"QuarterCircle2","objContinent",1.5,90,-1,45],
	    [2000,"QuarterCircle2","objContinent",1.5,180,-1,45],
	    [3000,"QuarterCircle2","objContinent",1.5,270,-1,45],
	    [4000,"QuarterCircle2","objContinent",1.5,360,-1,45],
	    [5000,"QuarterCircle2","objContinent",1.5,90,-1,45],
	],
	
	
	/* objCity: birds (v-formations) */
	level4: [
	    [100,"6","objCity", 2.0, 0, 0, 0],
	    [500,"6","objCity", 2.0, 180, 0, 0],
	    
	    [4750,"6","objCity", 2.0, 90, 0, 0],
	    [5250,"6","objCity", 2.0, 270, 0, 0],
	    
	    [7500,"6","objCity", 2.0, 45, 0, 0],
	    [7500,"6","objCity", 2.0, 225, 0, 0],
	    
	    [9000,"6","objCity", 2.0, 270, 0, 0],
	    [9000,"6","objCity", 2.0, 90, 0, 0],
	    
	    [11000,"6","objCity", 2.0, 135, 0, 0],
	    [11000,"6","objCity", 2.0, 315, 0, 0],
	],
	level11: [
	    [100,"6_complex","objCity", 2.0, 0, 0, 0],
	    [500,"6_complex","objCity", 2.0, 180, 0, 0],
	    
	    [4750,"6_complex","objCity", 2.0, 90, 0, 0],
	    [5250,"6_complex","objCity", 2.0, 270, 0, 0],
	    
	    [7500,"6_complex","objCity", 2.0, 45, 0, 0],
	    [7500,"6_complex","objCity", 2.0, 225, 0, 0],
	    
	    [9000,"6_complex","objCity", 2.0, 270, 0, 0],
	    [9000,"6_complex","objCity", 2.0, 90, 0, 0],
	    
	    [11000,"6_complex","objCity", 2.0, 135, 0, 0],
	    [11000,"6_complex","objCity", 2.0, 315, 0, 0],
	],
	level18: [
	    [100,"6_morecomplex","objCity", 2.5, 0, 0, 0],
	    [2500,"6_morecomplex","objCity", 2.5, 90, 0, 0],
	    [2500,"6_morecomplex","objCity", 2.5, 270, 0, 0],
	    [4500,"6_complex","objCity", 2.5, 157.5, 0, 0],
	    [4500,"6_complex","objCity", 2.5, 202.5, 0, 0],
	    [6000,"6_morecomplex","objCity", 2.5, 180, 0, 0],
	    [7500,"6_complex","objCity", 2.5, 337.5, 0, 0],
	    [7500,"6_complex","objCity", 2.5, 292.5, 0, 0],
	    [9500,"6_morecomplex","objCity", 2.5, 45, 0, 0],
	    [9500,"6_morecomplex","objCity", 2.5, 225, 0, 0],
	    
	    [11000,"6_complex","objCity", 2.5, 247.5, 0, 0],
	    [11000,"6_complex","objCity", 2.5, 67.5, 0, 0],
	    
	    [10000,"6_morecomplex","objCity", 2.5, 270, 0, 0],
	    [10000,"6_morecomplex","objCity", 2.5, 90, 0, 0],
	    
	    [11000,"6_morecomplex","objCity", 2.5, 112.5, 0, 0],
	    [11000,"6_morecomplex","objCity", 2.5, 292.5, 0, 0],
	],
	level25: [
	    [100,"6_morecomplex","objCity", 2.5, 0, 0, 10],
	    [2500,"6_morecomplex","objCity", 2.5, 90, 0, 15],
	    [2500,"6_morecomplex","objCity", 2.5, 270, 0, 15],
	    [4500,"6_complex","objCity", 2.5, 157.5, 0, 20],
	    [4500,"6_complex","objCity", 2.5, 202.5, 0, 20],
	    [6000,"6_morecomplex","objCity", 2.5, 180, 0, 25],
	    [7500,"6_complex","objCity", 2.5, 337.5, 0, 20],
	    [7500,"6_complex","objCity", 2.5, 292.5, 0, 20],
	    [9500,"6_morecomplex","objCity", 2.5, 45, 0, 15],
	    [9500,"6_morecomplex","objCity", 2.5, 225, 0, 15],
	    
	    [11000,"6_complex","objCity", 2.5, 247.5, 0, 10],
	    [11000,"6_complex","objCity", 2.5, 67.5, 0, 10],
	    
	    [10000,"6_morecomplex","objCity", 2.5, 270, 0, 10],
	    [10000,"6_morecomplex","objCity", 2.5, 90, 0, 10],

	    [11000,"6_morecomplex","objCity", 2.5, 112.5, 0, 10],
	    [11000,"6_morecomplex","objCity", 2.5, 292.5, 0, 10],

	    [13000,"6_morecomplex","objCity", 2.5, 270, 0, 15],
	    [13000,"6_morecomplex","objCity", 2.5, 90, 0, 15],

	    [14000,"6_morecomplex","objCity", 2.5, 112.5, 0, 15],
	    [14000,"6_morecomplex","objCity", 2.5, 292.5, 0, 15],

	    
	],
	level32:[
	    [100,"6_morecomplex","objCity", 2.5, 0, -1, 0],
	    [2500,"6_morecomplex","objCity", 2.5, 90, -1, 0],
	    [2500,"6_morecomplex","objCity", 2.5, 270, -1, 0],
	    [4500,"6_complex","objCity", 2.5, 157.5, -1, 0],
	    [4500,"6_complex","objCity", 2.5, 202.5, -1, 0],
	    [6000,"6_morecomplex","objCity", 2.5, 180, -1, 0],
	    [7500,"6_complex","objCity", 2.5, 337.5, -1, 0],
	    [7500,"6_complex","objCity", 2.5, 292.5, -1, 0],
	    [9500,"6_morecomplex","objCity", 2.5, 45, -1, 0],
	    [9500,"6_morecomplex","objCity", 2.5, 225, -1, 0],
	    
	    [11000,"6_complex","objCity", 2.5, 247.5, -1, 0],
	    [11000,"6_complex","objCity", 2.5, 67.5, -1, 0],
	    
	    [10000,"6_morecomplex","objCity", 2.5, 270, -1, 0],
	    [10000,"6_morecomplex","objCity", 2.5, 90, -1, 0],
	    
	    [11000,"6_morecomplex","objCity", 2.5, 112.5, -1, 0],
	    [11000,"6_morecomplex","objCity", 2.5, 292.5, -1, 0],
	],
	level39:[
	    [100,"6_complex","objCity", 2.0, 0, -1, 0],
	    [500,"6_complex","objCity", 2.0, 180, -1, 0],
	    
	    [4750,"6_complex","objCity", 2.0, 90, -1, 0],
	    [5250,"6_complex","objCity", 2.0, 270, -1, 0],
	    
	    [7500,"6_complex","objCity", 2.0, 45, -1, 0],
	    [7500,"6_complex","objCity", 2.0, 225, -1, 0],
	    
	    [9000,"6_complex","objCity", 2.0, 270, -1, 0],
	    [9000,"6_complex","objCity", 2.0, 90, -1, 0],
	    
	    [11000,"6_complex","objCity", 2.0, 135, -1, 0],
	    [11000,"6_complex","objCity", 2.0, 315, -1, 0],
	],
	level46:[
	    [100,"6","objCity", 2.0, 0, -1, 0],
	    [500,"6","objCity", 2.0, 180, -1, 0],
	    
	    [4750,"6","objCity", 2.0, 90, -1, 0],
	    [5250,"6","objCity", 2.0, 270, -1, 0],
	    
	    [7500,"6","objCity", 2.0, 45, -1, 0],
	    [7500,"6","objCity", 2.0, 225, -1, 0],
	    
	    [9000,"6","objCity", 2.0, 270, -1, 0],
	    [9000,"6","objCity", 2.0, 90, -1, 0],
	    
	    [11000,"6","objCity", 2.0, 135, -1, 0],
	    [11000,"6","objCity", 2.0, 315, -1, 0],
	],
	
	/* objPeople: speech (spiral) */
	level5: [
	    [100,"0","objPeople", 5.5, 0, 0, 0],
	    [500,"0","objPeople", 5.5, 30, 0, 0],
	    [1000,"0","objPeople", 5.5, 60, 0, 0],
	    [1500,"0","objPeople", 5.5, 90, 0, 0],
	    [2000,"0","objPeople", 5.5, 120, 0, 0],
	    [2500,"0","objPeople", 5.5, 150, 0, 0],
	    [3000,"0","objPeople", 5.5, 180, 0, 0],
	    [3500,"0","objPeople", 5.5, 210, 0, 0],
	    [4000,"0","objPeople", 5.5, 240, 0, 0],
	    [4500,"0","objPeople", 5.5, 270, 0, 0],
	    [5500,"0","objPeople", 5.5, 300, 0, 0],
	    [6000,"0","objPeople", 5.5, 330, 0, 0],
	    [6500,"0","objPeople", 5.5, 0, 0, 0],
	    [7000,"0","objPeople", 5.5, 30, 0, 0],
	    [7500,"0","objPeople", 5.5, 60, 0, 0],
	    [8000,"0","objPeople", 5.5, 90, 0, 0],
	    [8500,"0","objPeople", 5.5, 120, 0, 0],
	    [9000,"0","objPeople", 5.5, 150, 0, 0],
	    [9500,"0","objPeople", 5.5, 180, 0, 0],
	    
	    [100,"0","objPeople", 5.5, 180, 0, 0],
	    [500,"0","objPeople", 5.5, 210, 0, 0],
	    [1000,"0","objPeople", 5.5, 240, 0, 0],
	    [1500,"0","objPeople", 5.5, 270, 0, 0],
	    [2000,"0","objPeople", 5.5, 300, 0, 0],
	    [2500,"0","objPeople", 5.5, 330, 0, 0],
	    [3000,"0","objPeople", 5.5, 0, 0, 0],
	    [3500,"0","objPeople", 5.5, 30, 0, 0],
	    [4000,"0","objPeople", 5.5, 60, 0, 0],
	    [4500,"0","objPeople", 5.5, 90, 0, 0],
	    [5500,"0","objPeople", 5.5, 120, 0, 0],
	    [6000,"0","objPeople", 5.5, 150, 0, 0],
	    [6500,"0","objPeople", 5.5, 180, 0, 0],
	    [7000,"0","objPeople", 5.5, 210, 0, 0],
	    [7500,"0","objPeople", 5.5, 240, 0, 0],
	    [8000,"0","objPeople", 5.5, 270, 0, 0],
	    [8500,"0","objPeople", 5.5, 300, 0, 0],
	    [9000,"0","objPeople", 5.5, 330, 0, 0],
	    [9500,"0","objPeople", 5.5, 360, 0, 0],		
	    
	    [10500,"0slowest","objPeople",4.0, 135, 0, 0],
	    [10500,"0slowest","objPeople",4.0, 45, 0, 0],
	    [10500,"0slowest","objPeople",4.0, 225, 0, 0],
	    [10500,"0slowest","objPeople",4.0, 247.5, 0, 0],
	    [10500,"0slowest","objPeople",4.0, 270, 0, 0],
	    [10500,"0slowest","objPeople",4.0, 292.5, 0, 0],
	    [10500,"0slowest","objPeople",4.0, 315, 0, 0],
	],

	level12: [
	    [500,"Plus","objPeople",4.0,0, 0, 0],
	    [1000,"Plus","objPeople",4.0,15, 0, 0],
	    [1500,"Plus","objPeople",4.0,30, 0, 0],
	    [2000,"Plus","objPeople",4.0,45, 0, 0],
	    [2500,"Plus","objPeople",4.0,60, 0, 0],
	    [3000,"Plus","objPeople",4.0,75, 0, 0],
	    [3500,"Plus","objPeople",4.0,75, 0, 0],
	    [4000,"Plus","objPeople",4.0,60, 0, 0],
	    [4500,"Plus","objPeople",4.0,45, 0, 0],
	    [5000,"Plus","objPeople",4.0,30, 0, 0],
	    [5500,"Plus","objPeople",4.0,15, 0, 0],
	    [6000,"Plus","objPeople",4.0,0, 0, 0],

	    [8500,"0slowest","objPeople",4.0, 135, 0, 0],
	    [8500,"0slowest","objPeople",4.0, 45, 0, 0],
	    [8500,"0slowest","objPeople",4.0, 225, 0, 0],
	    [8500,"0slowest","objPeople",4.0, 247.5, 0, 0],
	    [8500,"0slowest","objPeople",4.0, 270, 0, 0],
	    [8500,"0slowest","objPeople",4.0, 292.5, 0, 0],
	    [8500,"0slowest","objPeople",4.0, 315, 0, 0],
	],

	level19:[
	    [500,"Plus","objPeople",4.0,0, 0, 10],
	    [1000,"Plus","objPeople",4.0,15, 0, 10],
	    [1500,"Plus","objPeople",4.0,30, 0, 10],
	    [2000,"Plus","objPeople",4.0,45, 0, 10],
	    [2500,"Plus","objPeople",4.0,60, 0, 10],
	    [3000,"Plus","objPeople",4.0,75, 0, 10],
	    [3500,"Plus","objPeople",4.0,75, 0, 20],
	    [4000,"Plus","objPeople",4.0,60, 0, 20],
	    [4500,"Plus","objPeople",4.0,45, 0, 20],
	    [5000,"Plus","objPeople",4.0,30, 0, 20],
	    [5500,"Plus","objPeople",4.0,15, 0, 20],
	    [6000,"Plus","objPeople",4.0,0, 0, 20],

	    [7500,"Plus","objPeople",4.0,0, 0, 30],
	    [8000,"Plus","objPeople",4.0,15, 0, 30],
	    [8500,"Plus","objPeople",4.0,30, 0, 30],
	    [9000,"Plus","objPeople",4.0,45, 0, 30],
	    [9500,"Plus","objPeople",4.0,60, 0, 30],
	    [10000,"Plus","objPeople",4.0,75, 0, 40],
	    [10500,"Plus","objPeople",4.0,75, 0, 40],
	    [12000,"Plus","objPeople",4.0,60, 0, 50],
	    [12500,"Plus","objPeople",4.0,45, 0, 50],
	    [13000,"Plus","objPeople",4.0,30, 0, 50],
	    [14000,"Plus","objPeople",4.0,15, 0, 50],
	    [15000,"Plus","objPeople",4.0,0, 0, 50],
	    
	],
	level26:[

	    [500,"Plus","objPeople",4.0,0, 0, 10],
	    [1000,"Plus","objPeople",4.0,15, 0, 10],
	    [1500,"Plus","objPeople",4.0,30, 0, 10],
	    [2000,"Plus","objPeople",4.0,45, 0, 10],
	    [2500,"Plus","objPeople",4.0,60, 0, 10],
	    [3000,"Plus","objPeople",4.0,75, 0, 10],
	    [3500,"Plus","objPeople",4.0,75, 0, 20],
	    [4000,"Plus","objPeople",4.0,60, 0, 20],
	    [4500,"Plus","objPeople",4.0,45, 0, 20],
	    [5000,"Plus","objPeople",4.0,30, 0, 20],
	    [5500,"Plus","objPeople",4.0,15, 0, 20],
	    [6000,"Plus","objPeople",4.0,0, 0, 20],

	    [7500,"Plus","objPeople",4.0,0, 0, 30],
	    [8000,"Plus","objPeople",4.0,15, 0, 30],
	    [8500,"Plus","objPeople",4.0,30, 0, 30],
	    [9000,"Plus","objPeople",4.0,45, 0, 30],
	    [9500,"Plus","objPeople",4.0,60, 0, 30],
	    [10000,"Plus","objPeople",4.0,75, 0, 40],
	    [10500,"Plus","objPeople",4.0,75, 0, 40],
	    [11000,"Plus","objPeople",4.0,60, 0, 40],
	    [11500,"Plus","objPeople",4.0,45, 0, 40],
	    [12000,"Plus","objPeople",4.0,30, 0, 50],
	    [12500,"Plus","objPeople",4.0,15, 0, 50],
	    [13000,"Plus","objPeople",4.0,0, 0, 50],
	    
	    [14500,"Plus","objPeople",4.0,0, 0, 50],
	    [16000,"Plus","objPeople",4.0,15, 0, 50],
	    [16500,"Plus","objPeople",4.0,30, 0, 40],
	    [19000,"Plus","objPeople",4.0,45, 0, 40],
	    [19500,"Plus","objPeople",4.0,60, 0, 40],
	    [20000,"Plus","objPeople",4.0,75, 0, 30],
	    [20500,"Plus","objPeople",4.0,75, 0, 30],
	    [21000,"Plus","objPeople",4.0,60, 0, 30],
	    [21500,"Plus","objPeople",4.0,45, 0, 20],
	    [22000,"Plus","objPeople",4.0,30, 0, 20],
	    [22500,"Plus","objPeople",4.0,15, 0, 20],
	    [23000,"Plus","objPeople",4.0,0, 0, 20],
	    
	],
	level33:[
	    [500,"Plus","objPeople",4.0,0, -1, 10],
	    [1000,"Plus","objPeople",4.0,15, -1, 10],
	    [1500,"Plus","objPeople",4.0,30, -1, 10],
	    [2000,"Plus","objPeople",4.0,45, -1, 10],
	    [2500,"Plus","objPeople",4.0,60, -1, 10],
	    [3000,"Plus","objPeople",4.0,75, -1, 10],
	    [3500,"Plus","objPeople",4.0,75, -1, 20],
	    [4000,"Plus","objPeople",4.0,60, -1, 20],
	    [4500,"Plus","objPeople",4.0,45, -1, 20],
	    [5000,"Plus","objPeople",4.0,30, -1, 20],
	    [5500,"Plus","objPeople",4.0,15, -1, 20],
	    [6000,"Plus","objPeople",4.0,0, -1, 20],

	    [7500,"Plus","objPeople",4.0,0, -1, 30],
	    [8000,"Plus","objPeople",4.0,15, -1, 30],
	    [8500,"Plus","objPeople",4.0,30, -1, 30],
	    [9000,"Plus","objPeople",4.0,45, -1, 30],
	    [9500,"Plus","objPeople",4.0,60, -1, 30],
	    [10000,"Plus","objPeople",4.0,75, -1, 40],
	    [10500,"Plus","objPeople",4.0,75, -1, 40],
	    [12000,"Plus","objPeople",4.0,60, -1, 50],
	    [12500,"Plus","objPeople",4.0,45, -1, 50],
	    [13000,"Plus","objPeople",4.0,30, -1, 50],
	    [14000,"Plus","objPeople",4.0,15, -1, 50],
	    [15000,"Plus","objPeople",4.0,0, -1, 50],
	],
	level40:[
	    [500,"Plus","objPeople",4.0,0, -1, 0],
	    [1000,"Plus","objPeople",4.0,15, -1, 0],
	    [1500,"Plus","objPeople",4.0,30, -1, 0],
	    [2000,"Plus","objPeople",4.0,45, -1, 0],
	    [2500,"Plus","objPeople",4.0,60, -1, 0],
	    [3000,"Plus","objPeople",4.0,75, -1, 0],
	    [3500,"Plus","objPeople",4.0,75, -1, 0],
	    [4000,"Plus","objPeople",4.0,60, -1, 0],
	    [4500,"Plus","objPeople",4.0,45, -1, 0],
	    [5000,"Plus","objPeople",4.0,30, -1, 0],
	    [5500,"Plus","objPeople",4.0,15, -1, 0],
	    [6000,"Plus","objPeople",4.0,0, -1, 0],

	    [8500,"0slowest","objPeople",4.0, 135, -1, 0],
	    [8500,"0slowest","objPeople",4.0, 45, -1, 0],
	    [8500,"0slowest","objPeople",4.0, 225, -1, 0],
	    [8500,"0slowest","objPeople",4.0, 247.5, -1, 0],
	    [8500,"0slowest","objPeople",4.0, 270, -1, 0],
	    [8500,"0slowest","objPeople",4.0, 292.5, -1, 0],
	    [8500,"0slowest","objPeople",4.0, 315, -1, 0],
	],
	level47:[
	    [100,"0","objPeople", 5.5, 0, -1, 0],
	    [500,"0","objPeople", 5.5, 30, -1, 0],
	    [1000,"0","objPeople", 5.5, 60, -1, 0],
	    [1500,"0","objPeople", 5.5, 90, -1, 0],
	    [2000,"0","objPeople", 5.5, 120, -1, 0],
	    [2500,"0","objPeople", 5.5, 150, -1, 0],
	    [3000,"0","objPeople", 5.5, 180, -1, 0],
	    [3500,"0","objPeople", 5.5, 210, -1, 0],
	    [4000,"0","objPeople", 5.5, 240, -1, 0],
	    [4500,"0","objPeople", 5.5, 270, -1, 0],
	    [5500,"0","objPeople", 5.5, 300, -1, 0],
	    [6000,"0","objPeople", 5.5, 330, -1, 0],
	    [6500,"0","objPeople", 5.5, 0, -1, 0],
	    [7000,"0","objPeople", 5.5, 30, -1, 0],
	    [7500,"0","objPeople", 5.5, 60, -1, 0],
	    [8000,"0","objPeople", 5.5, 90, -1, 0],
	    [8500,"0","objPeople", 5.5, 120, -1, 0],
	    [9000,"0","objPeople", 5.5, 150, -1, 0],
	    [9500,"0","objPeople", 5.5, 180, -1, 0],
	    
	    [100,"0","objPeople", 5.5, 180, -1, 0],
	    [500,"0","objPeople", 5.5, 210, -1, 0],
	    [1000,"0","objPeople", 5.5, 240, -1, 0],
	    [1500,"0","objPeople", 5.5, 270, -1, 0],
	    [2000,"0","objPeople", 5.5, 300, -1, 0],
	    [2500,"0","objPeople", 5.5, 330, -1, 0],
	    [3000,"0","objPeople", 5.5, 0, -1, 0],
	    [3500,"0","objPeople", 5.5, 30, -1, 0],
	    [4000,"0","objPeople", 5.5, 60, -1, 0],
	    [4500,"0","objPeople", 5.5, 90, -1, 0],
	    [5500,"0","objPeople", 5.5, 120, -1, 0],
	    [6000,"0","objPeople", 5.5, 150, -1, 0],
	    [6500,"0","objPeople", 5.5, 180, -1, 0],
	    [7000,"0","objPeople", 5.5, 210, -1, 0],
	    [7500,"0","objPeople", 5.5, 240, -1, 0],
	    [8000,"0","objPeople", 5.5, 270, -1, 0],
	    [8500,"0","objPeople", 5.5, 300, -1, 0],
	    [9000,"0","objPeople", 5.5, 330, -1, 0],
	    [9500,"0","objPeople", 5.5, 360, -1, 0],		
	    
	    [10500,"0slowest","objPeople",4.0, 135, -1, 0],
	    [10500,"0slowest","objPeople",4.0, 45, -1, 0],
	    [10500,"0slowest","objPeople",4.0, 225, -1, 0],
	    [10500,"0slowest","objPeople",4.0, 247.5, -1, 0],
	    [10500,"0slowest","objPeople",4.0, 270, -1, 0],
	    [10500,"0slowest","objPeople",4.0, 292.5, -1, 0],
	    [10500,"0slowest","objPeople",4.0, 315, -1, 0],
	],

	/* objCell: cells and stuff (broken spiral bursts) */
	level6: [
	    [100,"5aslow","objCell", 2.66, 0, 0, 0],
	    [500,"5aslow","objCell", 2.66, 30, 0, 0],
	    [1000,"5aslow","objCell", 2.66, 60, 0, 0],
	    [3000,"5aslow","objCell", 5.0, 135, 0, 0],
	    [4000,"5aslow","objCell", 4.0, 180, 0, 0],
	    [5000,"5aslow","objCell", 3.0, 225, 0, 0],
	    [6600,"5aslow","objCell", 3.33, 270, 0, 0],
	    [7000,"5aslow","objCell", 3.33, 300, 0, 0],
	    [7300,"5aslow","objCell", 3.33, 330, 0, 0],
	    [9000,"5aslow","objCell", 6.33, 60, 0, 0],
	    [9500,"5aslow","objCell", 6.33, 90, 0, 0],
	    [10000,"5aslow","objCell", 6.33, 120, 0, 0],
	],

	level13: [
	    [100,"5aslow","objCell", 2.66, 0, 0, 0],
	    [500,"5aslow","objCell", 2.66, 45, 0, 0],
	    [1000,"5aslow","objCell", 2.66, 90, 0, 0],
	    [3000,"5aslow","objCell", 3.0, 135, 0, 0],
	    [4000,"5aslow","objCell", 3.0, 180, 0, 0],
	    [5000,"5aslow","objCell", 3.0, 225, 0, 0],
	    [7000,"5aslow","objCell", 3.33, 315, 0, 0],
	    [9000,"5aslow","objCell", 6.33, 45, 0, 0],
	    [10000,"5aslow","objCell", 6.33, 270, 0, 0],
	    
	    
	    [100,"5aslower","objCell", 4.00, 0, 0, 0],
	    [500,"5aslower","objCell", 4.00, 30, 0, 0],
	    [1000,"5aslower","objCell", 4.00, 60, 0, 0],
	    [3000,"5aslow","objCell", 4.33, 135, 0, 0],
	    [4000,"5aslow","objCell", 4.33, 180, 0, 0],
	    [5000,"5aslow","objCell", 4.33, 225, 0, 0],
	    [6600,"5aslow","objCell", 4.66, 270, 0, 0],
	    [7000,"5aslow","objCell", 4.66, 300, 0, 0],
	    [7300,"5aslow","objCell", 4.66, 330, 0, 0],
	    [9000,"5aslower","objCell", 7.66, 0, 0, 10],
	    [9500,"5aslower","objCell", 7.66, 45, 0, 10],
	    [10000,"5aslower","objCell", 7.66, 90, 0, 10],	
	],

	level20: [
	    [100,"5aslow","objCell", 2.66, 0, 0, 0],
	    [500,"5aslow","objCell", 2.66, 45, 0, 0],
	    [1000,"5aslow","objCell", 2.66, 90, 0, 0],
	    [3000,"5aslow","objCell", 3.0, 135, 0, 0],
	    [4000,"5aslow","objCell", 3.0, 180, 0, 0],
	    [5000,"5aslow","objCell", 3.0, 225, 0, 0],
	    [6600,"5aslow","objCell", 3.33, 270, 0, 0],
	    [7000,"5aslow","objCell", 3.33, 315, 0, 0],
	    [7300,"5aslow","objCell", 3.33, 0, 0, 0],
	    [9000,"5aslow","objCell", 6.33, 45, 0, 0],
	    [9500,"5aslow","objCell", 6.33, 180, 0, 0],
	    [10000,"5aslow","objCell", 6.33, 270, 0, 0],
	    
	    [100,"5aslower","objCell", 5.33, 0, 0, 0],
	    [500,"5aslower","objCell", 5.33, 30, 0, 0],
	    [1000,"5aslower","objCell", 5.33, 60, 0, 0],
	    [3000,"5aslow","objCell", 4.66, 135, 0, 0],
	    [4000,"5aslow","objCell", 4.66, 180, 0, 0],
	    [5000,"5aslow","objCell", 4.66, 225, 0, 0],
	    [6600,"5aslow","objCell", 5.0, 270, 0, 5],
	    [7000,"5aslow","objCell", 5.0, 300, 0, 5],
	    [7300,"5aslow","objCell", 5.0, 330, 0, 5],
	    [8000,"5aslower","objCell", 8.0, 0, 0, 10],
	    [8500,"5aslower","objCell", 8.0, 60, 0, 15],
	    [9000,"5aslower","objCell", 8.0, 90, 0, 20],
	    [9500,"5aslower","objCell", 8.0, 120, 0, 15],
	    [10000,"5aslower","objCell", 8.0, 150, 0, 10],
	],    
	
	level27: [
	    [100,"5aslow","objCell", 2.66, 0, 0, 0],
	    [500,"5aslow","objCell", 2.66, 45, 0, 0],
	    [1000,"5aslow","objCell", 2.66, 90, 0, 0],
	    [3000,"5aslow","objCell", 3.0, 135, 0, 0],
	    [4000,"5aslow","objCell", 3.0, 180, 0, 0],
	    [5000,"5aslow","objCell", 3.0, 225, 0, 0],
	    [6600,"5aslow","objCell", 3.33, 270, 0, 0],
	    [7000,"5aslow","objCell", 3.33, 315, 0, 0],
	    [7300,"5aslow","objCell", 3.33, 0, 0, 0],
	    [9000,"5aslow","objCell", 6.33, 45, 0, 0],
	    [9500,"5aslow","objCell", 6.33, 180, 0, 0],
	    [10000,"5aslow","objCell", 6.33, 270, 0, 0],
	    
	    [100,"5aslower","objCell", 5.33, 0, 0, 0],
	    [500,"5aslower","objCell", 5.33, 30, 0, 0],
	    [1000,"5aslower","objCell", 5.33, 60, 0, 0],
	    [3000,"5aslow","objCell", 4.66, 135, 0, 5],
	    [4000,"5aslow","objCell", 4.66, 180, 0, 5],
	    [5000,"5aslow","objCell", 4.66, 225, 0, 5],
	    [6600,"5aslow","objCell", 5.0, 270, 0, 15],
	    [7000,"5aslow","objCell", 5.0, 300, 0, 15],
	    [7300,"5aslow","objCell", 5.0, 330, 0, 15],
	    [8000,"5aslower","objCell", 8.0, 0, 0, 30],
	    [8500,"5aslower","objCell", 8.0, 60, 0, 35],
	    [9000,"5aslower","objCell", 8.0, 90, 0, 40],
	    [9500,"5aslower","objCell", 8.0, 120, 0, 35],
	    [10000,"5aslower","objCell", 8.0, 150, 0, 30],
	],
	level34:[
	    [100,"5aslow","objCell", 2.66, 0, -1, 0],
	    [500,"5aslow","objCell", 2.66, 45, -1, 0],
	    [1000,"5aslow","objCell", 2.66, 90, -1, 0],
	    [3000,"5aslow","objCell", 3.0, 135, -1, 0],
	    [4000,"5aslow","objCell", 3.0, 180, -1, 0],
	    [5000,"5aslow","objCell", 3.0, 225, -1, 0],
	    [6600,"5aslow","objCell", 3.33, 270, -1, 0],
	    [7000,"5aslow","objCell", 3.33, 315, -1, 0],
	    [7300,"5aslow","objCell", 3.33, 0, -1, 0],
	    [9000,"5aslow","objCell", 6.33, 45, -1, 0],
	    [9500,"5aslow","objCell", 6.33, 180, -1, 0],
	    [10000,"5aslow","objCell", 6.33, 270, -1, 0],
	    
	    [100,"5aslower","objCell", 5.33, 0, -1, 0],
	    [500,"5aslower","objCell", 5.33, 30, -1, 0],
	    [1000,"5aslower","objCell", 5.33, 60, -1, 0],
	    [3000,"5aslow","objCell", 4.66, 135, -1, 0],
	    [4000,"5aslow","objCell", 4.66, 180, -1, 0],
	    [5000,"5aslow","objCell", 4.66, 225, -1, 0],
	    [6600,"5aslow","objCell", 5.0, 270, -1, 5],
	    [7000,"5aslow","objCell", 5.0, 300, -1, 5],
	    [7300,"5aslow","objCell", 5.0, 330, -1, 5],
	    [8000,"5aslower","objCell", 8.0, 0, -1, 10],
	    [8500,"5aslower","objCell", 8.0, 60, -1, 15],
	    [9000,"5aslower","objCell", 8.0, 90, -1, 20],
	    [9500,"5aslower","objCell", 8.0, 120, -1, 15],
	    [10000,"5aslower","objCell", 8.0, 150, -1, 10],
	],
	level41:[
	    [100,"5aslow","objCell", 2.66, 0, -1, 0],
	    [500,"5aslow","objCell", 2.66, 45, -1, 0],
	    [1000,"5aslow","objCell", 2.66, 90, -1, 0],
	    [3000,"5aslow","objCell", 3.0, 135, -1, 0],
	    [4000,"5aslow","objCell", 3.0, 180, -1, 0],
	    [5000,"5aslow","objCell", 3.0, 225, -1, 0],
	    [7000,"5aslow","objCell", 3.33, 315, -1, 0],
	    [9000,"5aslow","objCell", 6.33, 45, -1, 0],
	    [10000,"5aslow","objCell", 6.33, 270, -1, 0],
	    
	    
	    [100,"5aslower","objCell", 4.00, 0, -1, 0],
	    [500,"5aslower","objCell", 4.00, 30, -1, 0],
	    [1000,"5aslower","objCell", 4.00, 60, -1, 0],
	    [3000,"5aslow","objCell", 4.33, 135, -1, 0],
	    [4000,"5aslow","objCell", 4.33, 180, -1, 0],
	    [5000,"5aslow","objCell", 4.33, 225, -1, 0],
	    [6600,"5aslow","objCell", 4.66, 270, -1, 0],
	    [7000,"5aslow","objCell", 4.66, 300, -1, 0],
	    [7300,"5aslow","objCell", 4.66, 330, -1, 0],
	    [9000,"5aslower","objCell", 7.66, 0, -1, 10],
	    [9500,"5aslower","objCell", 7.66, 45, -1, 10],
	    [10000,"5aslower","objCell", 7.66, 90, -1, 10],	
	],
	level48:[
	    [100,"5aslow","objCell", 2.66, 0, -1, 0],
	    [500,"5aslow","objCell", 2.66, 30, -1, 0],
	    [1000,"5aslow","objCell", 2.66, 60, -1, 0],
	    [3000,"5aslow","objCell", 5.0, 135, -1, 0],
	    [4000,"5aslow","objCell", 4.0, 180, -1, 0],
	    [5000,"5aslow","objCell", 3.0, 225, -1, 0],
	    [6600,"5aslow","objCell", 3.33, 270, -1, 0],
	    [7000,"5aslow","objCell", 3.33, 300, -1, 0],
	    [7300,"5aslow","objCell", 3.33, 330, -1, 0],
	    [9000,"5aslow","objCell", 6.33, 60, -1, 0],
	    [9500,"5aslow","objCell", 6.33, 90, -1, 0],
	    [10000,"5aslow","objCell", 6.33, 120, -1, 0],
	],
	/* objAtomic: atoms and stuff (triple spiral + bar) */
	
	level7: [
	    [100,"0slower","objAtomic", 3.10, 0, 0, 0],
	    [2000,"0slower","objAtomic", 3.20, 30, 0, 0],
	    [3000,"0slower","objAtomic", 3.30, 60, 0, 0],
	    [4000,"0slower","objAtomic", 3.40, 90, 0, 0],
	    [5000,"0slower","objAtomic", 3.50, 120, 0, 0],
	    [5500,"0slower","objAtomic", 3.60, 150, 0, 0],
	    [6000,"0slower","objAtomic", 3.70, 180, 0, 0],
	    [6500,"0slower","objAtomic", 3.80, 210, 0, 0],
	    [7000,"0slower","objAtomic", 3.90, 240, 0, 0],
	    [7500,"0slower","objAtomic", 4.10, 270, 0, 0],
	    [8000,"0slower","objAtomic", 4.20, 300, 0, 0],
	    [8500,"0slower","objAtomic", 4.30, 330, 0, 0],
	    [9000,"0slower","objAtomic", 4.40, 0, 0, 0],
	    [9500,"0slower","objAtomic", 4.50, 30, 0, 0],
	    [10000,"0slower","objAtomic", 4.50, 60, 0, 0],
	    [10500,"0slower","objAtomic", 4.50, 90, 0, 0],
	    [11000,"0slower","objAtomic", 4.50, 120, 0, 0],
	    [11500,"0slower","objAtomic", 4.50, 150, 0, 0],
	    [12000,"0slower","objAtomic", 4.50, 180, 0, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 120, 0, 0],
	    [2000,"0slower","objAtomic", 3.20, 150, 0, 0],
	    [3000,"0slower","objAtomic", 3.30, 180, 0, 0],
	    [4000,"0slower","objAtomic", 3.40, 210, 0, 0],
	    [5000,"0slower","objAtomic", 3.50, 240, 0, 0],
	    [5500,"0slower","objAtomic", 3.60, 270, 0, 0],
	    [6000,"0slower","objAtomic", 3.70, 300, 0, 0],
	    [6500,"0slower","objAtomic", 3.80, 330, 0, 0],
	    [7000,"0slower","objAtomic", 3.90, 0, 0, 0],
	    [7500,"0slower","objAtomic", 4.00, 30, 0, 0],
	    [8000,"0slower","objAtomic", 4.10, 60, 0, 0],
	    [8500,"0slower","objAtomic", 4.20, 90, 0, 0],
	    [9000,"0slower","objAtomic", 4.30, 120, 0, 0],
	    [9500,"0slower","objAtomic", 4.40, 150, 0, 0],
	    [10000,"0slower","objAtomic", 4.50, 180, 0, 0],
	    [10500,"0slower","objAtomic", 4.50, 210, 0, 0],
	    [11000,"0slower","objAtomic", 4.50, 240, 0, 0],
	    [11500,"0slower","objAtomic", 4.50, 270, 0, 0],
	    [12000,"0slower","objAtomic", 4.50, 300, 0, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 240, 0, 0],
	    [2000,"0slower","objAtomic", 3.20, 270, 0, 0],
	    [3000,"0slower","objAtomic", 3.30, 300, 0, 0],
	    [4000,"0slower","objAtomic", 3.40, 330, 0, 0],
	    [5000,"0slower","objAtomic", 3.50, 0, 0, 0],
	    [5500,"0slower","objAtomic", 3.60, 30, 0, 0],
	    [6000,"0slower","objAtomic", 3.70, 60, 0, 0],
	    [6500,"0slower","objAtomic", 3.80, 90, 0, 0],
	    [7000,"0slower","objAtomic", 3.90, 120, 0, 0],
	    [7500,"0slower","objAtomic", 4.00, 150, 0, 0],
	    [8000,"0slower","objAtomic", 4.10, 180, 0, 0],
	    [8500,"0slower","objAtomic", 4.20, 210, 0, 0],
	    [9000,"0slower","objAtomic", 4.30, 240, 0, 0],
	    [9500,"0slower","objAtomic", 4.40, 270, 0, 0],
	    [10000,"0slower","objAtomic", 4.50, 300, 0, 0],
	    [10500,"0slower","objAtomic", 4.50, 330, 0, 0],
	    [11000,"0slower","objAtomic", 4.50, 0, 0, 0],
	    [11500,"0slower","objAtomic", 4.50, 30, 0, 0],
	    [12000,"0slower","objAtomic", 4.50, 60, 0, 0],
	    
	    [100,"0","objUniverse", 1.5, 0, 0, 0],
	    [2000,"0","objUniverse", 1.5, 5, 0, 0],
	    [3000,"0","objUniverse", 1.5, 10, 0, 0],
	    [4000,"0","objUniverse", 1.5, 15, 0, 0],
	    [5000,"0","objUniverse", 1.5, 20, 0, 0],
	    [6000,"0","objUniverse", 1.5, 25, 0, 0],
	    [7000,"0","objUniverse", 1.5, 30, 0, 0],
	    [8000,"0","objUniverse", 1.5, 35, 0, 0],
	    [9000,"0","objUniverse", 1.5, 40, 0, 0],
	    [10000,"0","objUniverse", 1.5, 45, 0, 0],
	],
	
	
	level14: [
	    [100,"0slower","objAtomic", 3.10, 0, 0, 0],
	    [2000,"0slower","objAtomic", 3.20, 30, 0, 0],
	    [3000,"0slower","objAtomic", 3.30, 60, 0, 0],
	    [4000,"0slower","objAtomic", 3.40, 90, 0, 0],
	    [5000,"0slower","objAtomic", 3.50, 120, 0, 0],
	    [5500,"0slower","objAtomic", 3.60, 150, 0, 0],
	    [6000,"0slower","objAtomic", 3.70, 180, 0, 0],
	    [6500,"0slower","objAtomic", 3.80, 210, 0, 0],
	    [7000,"0slower","objAtomic", 3.90, 240, 0, 0],
	    [7500,"0slower","objAtomic", 4.00, 270, 0, 0],
	    [8000,"0slower","objAtomic", 4.10, 300, 0, 0],
	    [8500,"0slower","objAtomic", 4.20, 330, 0, 0],
	    [9000,"0slower","objAtomic", 4.30, 0, 0, 0],
	    [9500,"0slower","objAtomic", 4.40, 30, 0, 0],
	    [10000,"0slower","objAtomic", 4.50, 60, 0, 0],
	    [10500,"0slower","objAtomic", 4.50, 90, 0, 0],
	    [11000,"0slower","objAtomic", 4.50, 120, 0, 0],
	    [11500,"0slower","objAtomic", 4.50, 150, 0, 0],
	    [12000,"0slower","objAtomic", 4.50, 180, 0, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 120, 0, 0],
	    [2000,"0slower","objAtomic", 3.20, 150, 0, 0],
	    [3000,"0slower","objAtomic", 3.30, 180, 0, 0],
	    [4000,"0slower","objAtomic", 3.40, 210, 0, 0],
	    [5000,"0slower","objAtomic", 3.50, 240, 0, 0],
	    [5500,"0slower","objAtomic", 3.60, 270, 0, 0],
	    [6000,"0slower","objAtomic", 3.70, 300, 0, 0],
	    [6500,"0slower","objAtomic", 3.80, 330, 0, 0],
	    [7000,"0slower","objAtomic", 3.90, 0, 0, 0],
	    [7500,"0slower","objAtomic", 4.00, 30, 0, 0],
	    [8000,"0slower","objAtomic", 4.10, 60, 0, 0],
	    [8500,"0slower","objAtomic", 4.20, 90, 0, 0],
	    [9000,"0slower","objAtomic", 4.30, 120, 0, 0],
	    [9500,"0slower","objAtomic", 4.40, 150, 0, 0],
	    [10000,"0slower","objAtomic", 4.50, 180, 0, 0],
	    [10500,"0slower","objAtomic", 4.50, 210, 0, 0],
	    [11000,"0slower","objAtomic", 4.50, 240, 0, 0],
	    [11500,"0slower","objAtomic", 4.50, 270, 0, 0],
	    [12000,"0slower","objAtomic", 4.50, 300, 0, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 240, 0, 0],
	    [2000,"0slower","objAtomic", 3.20, 270, 0, 0],
	    [3000,"0slower","objAtomic", 3.30, 300, 0, 0],
	    [4000,"0slower","objAtomic", 3.40, 330, 0, 0],
	    [5000,"0slower","objAtomic", 3.50, 0, 0, 0],
	    [5500,"0slower","objAtomic", 3.60, 30, 0, 0],
	    [6000,"0slower","objAtomic", 3.70, 60, 0, 0],
	    [6500,"0slower","objAtomic", 3.80, 90, 0, 0],
	    [7000,"0slower","objAtomic", 3.90, 120, 0, 0],
	    [7500,"0slower","objAtomic", 4.00, 150, 0, 0],
	    [8000,"0slower","objAtomic", 4.10, 180, 0, 0],
	    [8500,"0slower","objAtomic", 4.20, 210, 0, 0],
	    [9000,"0slower","objAtomic", 4.30, 240, 0, 0],
	    [9500,"0slower","objAtomic", 4.40, 270, 0, 0],
	    [10000,"0slower","objAtomic", 4.50, 300, 0, 0],
	    [10500,"0slower","objAtomic", 4.50, 330, 0, 0],
	    [11000,"0slower","objAtomic", 4.50, 0, 0, 0],
	    [11500,"0slower","objAtomic", 4.50, 30, 0, 0],
	    [12000,"0slower","objAtomic", 4.50, 60, 0, 0],
	    
	    [100,"0slowest","objUniverse", 1.33, 0, 0, 1],
	    [1000,"0slowest","objUniverse", 1.33, 5, 0, 1],
	    [2000,"0slowest","objUniverse", 1.33, 10, 0, 1],
	    [3000,"0slowest","objUniverse", 1.33, 15, 0, 1],
	    [4000,"0slowest","objUniverse", 1.33, 20, 0, 1],
	    [5000,"0slowest","objUniverse", 1.33, 25, 0, 1],
	    [6000,"0slowest","objUniverse", 1.33, 30, 0, 1],
	    [7000,"0slowest","objUniverse", 1.33, 35, 0, 1],
	    [8000,"0slowest","objUniverse", 1.33, 40, 0, 1],
	    [9000,"0slowest","objUniverse", 1.33, 45, 0, 1],
	    
	    [100,"0slowest","objUniverse", 1.66, 180, 0, 1],
	    [1000,"0slowest","objUniverse", 1.66, 185, 0, 1],
	    [2000,"0slowest","objUniverse", 1.66, 190, 0, 1],
	    [3000,"0slowest","objUniverse", 1.66, 195, 0, 1],
	    [4000,"0slowest","objUniverse", 2.33, 200, 0, 1],
	    [5000,"0slowest","objUniverse", 2.33, 205, 0, 1],
	    [6000,"0slowest","objUniverse", 2.33, 210, 0, 1],
	    [7000,"0slowest","objUniverse", 2.66, 215, 0, 1],
	    [8000,"0slowest","objUniverse", 2.66, 220, 0, 1],
	    [9000,"0slowest","objUniverse", 2.66, 225, 0, 1],
	    
	    
	],
	
	level21: [
	    [100,"0slowest","objAtomic", 3.50, 0, 0, 0],
	    [2000,"0slowest","objAtomic", 3.60, 30, 0, 0],
	    [3000,"0slowest","objAtomic", 3.70, 60, 0, 0],
	    [4000,"0slowest","objAtomic", 3.80, 90, 0, 0],
	    [5000,"0slowest","objAtomic", 3.90, 120, 0, 0],
	    [5500,"0slowest","objAtomic", 4.00, 150, 0, 0],
	    [6000,"0slowest","objAtomic", 4.10, 180, 0, 0],
	    [6500,"0slowest","objAtomic", 4.20, 210, 0, 0],
	    [7000,"0slowest","objAtomic", 4.30, 240, 0, 0],
	    [7500,"0slowest","objAtomic", 4.40, 270, 0, 0],
	    [8000,"0slowest","objAtomic", 4.50, 300, 0, 0],
	    [8500,"0slowest","objAtomic", 4.60, 330, 0, 0],
	    [9000,"0slowest","objAtomic", 4.70, 0, 0, 0],
	    [9500,"0slowest","objAtomic", 4.80, 30, 0, 0],
	    [10000,"0slowest","objAtomic", 4.90, 60, 0, 0],
	    [10500,"0slowest","objAtomic", 5.00, 90, 0, 0],
	    [11000,"0slowest","objAtomic", 5.00, 120, 0, 0],
	    [11500,"0slowest","objAtomic", 5.00, 150, 0, 0],
	    [12000,"0slowest","objAtomic", 5.00, 180, 0, 0],
	    
	    [100,"0slowest","objAtomic", 3.50, 120, 0, 0],
	    [2000,"0slowest","objAtomic", 3.60, 150, 0, 0],
	    [3000,"0slowest","objAtomic", 3.70, 180, 0, 0],
	    [4000,"0slowest","objAtomic", 3.80, 210, 0, 0],
	    [5000,"0slowest","objAtomic", 3.90, 240, 0, 0],
	    [5500,"0slowest","objAtomic", 4.00, 270, 0, 0],
	    [6000,"0slowest","objAtomic", 4.10, 300, 0, 0],
	    [6500,"0slowest","objAtomic", 4.20, 330, 0, 0],
	    [7000,"0slowest","objAtomic", 4.30, 0, 0, 0],
	    [7500,"0slowest","objAtomic", 4.40, 30, 0, 0],
	    [8000,"0slowest","objAtomic", 4.50, 60, 0, 0],
	    [8500,"0slowest","objAtomic", 4.60, 90, 0, 0],
	    [9000,"0slowest","objAtomic", 4.70, 120, 0, 0],
	    [9500,"0slowest","objAtomic", 4.80, 150, 0, 0],
	    [10000,"0slowest","objAtomic", 4.90, 180, 0, 0],
	    [10500,"0slowest","objAtomic", 5.00, 210, 0, 0],
	    [11000,"0slowest","objAtomic", 5.00, 240, 0, 0],
	    [11500,"0slowest","objAtomic", 5.00, 270, 0, 0],
	    [12000,"0slowest","objAtomic", 5.00, 300, 0, 0],
	    
	    [100,"0slowest","objAtomic", 3.50, 240, 0, 0],
	    [2000,"0slowest","objAtomic", 3.60, 270, 0, 0],
	    [3000,"0slowest","objAtomic", 3.70, 300, 0, 0],
	    [4000,"0slowest","objAtomic", 3.80, 330, 0, 0],
	    [5000,"0slowest","objAtomic", 3.90, 0, 0, 0],
	    [5500,"0slowest","objAtomic", 4.00, 30, 0, 0],
	    [6000,"0slowest","objAtomic", 4.10, 60, 0, 0],
	    [6500,"0slowest","objAtomic", 4.20, 90, 0, 0],
	    [7000,"0slowest","objAtomic", 4.30, 120, 0, 0],
	    [7500,"0slowest","objAtomic", 4.40, 150, 0, 0],
	    [8000,"0slowest","objAtomic", 4.50, 180, 0, 0],
	    [8500,"0slowest","objAtomic", 4.60, 210, 0, 0],
	    [9000,"0slowest","objAtomic", 4.70, 240, 0, 0],
	    [9500,"0slowest","objAtomic", 4.80, 270, 0, 0],
	    [10000,"0slowest","objAtomic", 4.90, 300, 0, 0],
	    [10500,"0slowest","objAtomic", 5.00, 330, 0, 0],
	    [11000,"0slowest","objAtomic", 5.00, 0, 0, 0],
	    [11500,"0slowest","objAtomic", 5.00, 30, 0, 0],
	    [12000,"0slowest","objAtomic", 5.00, 60, 0, 0],
	    
	    [100,"0slowest","objUniverse", 1.66, 0, 0, 10],
	    [1000,"0slowest","objUniverse", 1.66, 5, 0, 10],
	    [2000,"0slowest","objUniverse", 1.66, 10, 0, 10],
	    [3000,"0slowest","objUniverse", 1.66, 15, 0, 10],
	    [4000,"0slowest","objUniverse", 2.33, 20, 0, 10],
	    [5000,"0slowest","objUniverse", 2.33, 25, 0, 10],
	    [6000,"0slowest","objUniverse", 2.33, 30, 0, 10],
	    [7000,"0slowest","objUniverse", 2.66, 35, 0, 10],
	    [8000,"0slowest","objUniverse", 2.66, 40, 0, 10],
	    [9000,"0slowest","objUniverse", 2.66, 45, 0, 10],

	    [100,"0slowest","objUniverse", 1.66, 180, 0, 10],
	    [1000,"0slowest","objUniverse", 1.66, 185, 0, 10],
	    [2000,"0slowest","objUniverse", 1.66, 190, 0, 10],
	    [3000,"0slowest","objUniverse", 1.66, 195, 0, 10],
	    [4000,"0slowest","objUniverse", 2.33, 200, 0, 10],
	    [5000,"0slowest","objUniverse", 2.33, 205, 0, 10],
	    [6000,"0slowest","objUniverse", 2.33, 210, 0, 10],
	    [7000,"0slowest","objUniverse", 2.66, 215, 0, 10],
	    [8000,"0slowest","objUniverse", 2.66, 220, 0, 10],
	    [9000,"0slowest","objUniverse", 2.66, 225, 0, 10],

	],
	
	level28:[
	    [100,"0slower","objAtomic", 3.50, 0, 0, 20],
	    [2000,"0slower","objAtomic", 3.60, 30, 0, 20],
	    [3000,"0slower","objAtomic", 3.70, 60, 0, 20],
	    [4000,"0slower","objAtomic", 3.80, 90, 0, 20],
	    [5000,"0slower","objAtomic", 3.90, 120, 0, 20],
	    [5500,"0slower","objAtomic", 4.00, 150, 0, 20],
	    [6000,"0slower","objAtomic", 4.10, 180, 0, 20],
	    [6500,"0slower","objAtomic", 4.20, 210, 0, 20],
	    [7000,"0slower","objAtomic", 4.30, 240, 0, 20],
	    [7500,"0slower","objAtomic", 4.40, 270, 0, 20],
	    [8000,"0slower","objAtomic", 4.50, 300, 0, 20],
	    [8500,"0slower","objAtomic", 4.60, 330, 0, 20],
	    [9000,"0slower","objAtomic", 4.70, 0, 0, 20],
	    [9500,"0slower","objAtomic", 4.80, 30, 0, 20],
	    [10000,"0slower","objAtomic", 4.90, 60, 0, 20],
	    [10500,"0slower","objAtomic", 5.00, 90, 0, 20],
	    [11000,"0slower","objAtomic", 5.00, 120, 0, 20],
	    [11500,"0slower","objAtomic", 5.00, 150, 0, 20],
	    [12000,"0slower","objAtomic", 5.00, 180, 0, 20],
	    
	    [100,"0slower","objAtomic", 3.50, 120, 0, 20],
	    [2000,"0slower","objAtomic", 3.60, 150, 0, 20],
	    [3000,"0slower","objAtomic", 3.70, 180, 0, 20],
	    [4000,"0slower","objAtomic", 3.80, 210, 0, 20],
	    [5000,"0slower","objAtomic", 3.90, 240, 0, 20],
	    [5500,"0slower","objAtomic", 4.00, 270, 0, 20],
	    [6000,"0slower","objAtomic", 4.10, 300, 0, 20],
	    [6500,"0slower","objAtomic", 4.20, 330, 0, 20],
	    [7000,"0slower","objAtomic", 4.30, 0, 0, 20],
	    [7500,"0slower","objAtomic", 4.40, 30, 0, 20],
	    [8000,"0slower","objAtomic", 4.50, 60, 0, 20],
	    [8500,"0slower","objAtomic", 4.60, 90, 0, 20],
	    [9000,"0slower","objAtomic", 4.70, 120, 0, 20],
	    [9500,"0slower","objAtomic", 4.80, 150, 0, 20],
	    [10000,"0slower","objAtomic", 4.90, 180, 0, 20],
	    [10500,"0slower","objAtomic", 5.00, 210, 0, 20],
	    [11000,"0slower","objAtomic", 5.00, 240, 0, 20],
	    [11500,"0slower","objAtomic", 5.00, 270, 0, 20],
	    [12000,"0slower","objAtomic", 5.00, 300, 0, 20],
	    
	    [100,"0slower","objAtomic", 3.50, 240, 0, 20],
	    [2000,"0slower","objAtomic", 3.60, 270, 0, 20],
	    [3000,"0slower","objAtomic", 3.70, 300, 0, 20],
	    [4000,"0slower","objAtomic", 3.80, 330, 0, 20],
	    [5000,"0slower","objAtomic", 3.90, 0, 0, 20],
	    [5500,"0slower","objAtomic", 4.00, 30, 0, 20],
	    [6000,"0slower","objAtomic", 4.10, 60, 0, 20],
	    [6500,"0slower","objAtomic", 4.20, 90, 0, 20],
	    [7000,"0slower","objAtomic", 4.30, 120, 0, 20],
	    [7500,"0slower","objAtomic", 4.40, 150, 0, 20],
	    [8000,"0slower","objAtomic", 4.50, 180, 0, 20],
	    [8500,"0slower","objAtomic", 4.60, 210, 0, 20],
	    [9000,"0slower","objAtomic", 4.70, 240, 0, 20],
	    [9500,"0slower","objAtomic", 4.80, 270, 0, 20],
	    [11000,"0slower","objAtomic", 4.90, 300, 0, 20],
	    [11500,"0slower","objAtomic", 5.00, 330, 0, 20],
	    [13000,"0slower","objAtomic", 5.00, 0, 0, 20],
	    [13500,"0slower","objAtomic", 5.00, 30, 0, 20],
	    [15000,"0slower","objAtomic", 5.00, 60, 0, 20],
	    
	    [100,"0slowest","objUniverse", 1.66, 0, 0, 60],
	    [1000,"0slowest","objUniverse", 1.66, 5, 0, 60],
	    [2000,"0slowest","objUniverse", 1.66, 10, 0, 60],
	    [3000,"0slowest","objUniverse", 1.66, 15, 0, 60],
	    [4000,"0slowest","objUniverse", 2.33, 20, 0, 60],
	    [5000,"0slowest","objUniverse", 2.33, 25, 0, 60],
	    [6000,"0slowest","objUniverse", 2.33, 30, 0, 60],
	    [7000,"0slowest","objUniverse", 2.66, 35, 0, 60],
	    [8000,"0slowest","objUniverse", 2.66, 40, 0, 60],
	    [9000,"0slowest","objUniverse", 2.66, 45, 0, 60],

	    [100,"0slowest","objUniverse", 1.66, 120, 0, 60],
	    [1000,"0slowest","objUniverse", 1.66, 125, 0, 60],
	    [2000,"0slowest","objUniverse", 1.66, 130, 0, 60],
	    [3000,"0slowest","objUniverse", 1.66, 135, 0, 60],
	    [4000,"0slowest","objUniverse", 2.33, 140, 0, 60],
	    [5000,"0slowest","objUniverse", 2.33, 145, 0, 60],
	    [6000,"0slowest","objUniverse", 2.33, 150, 0, 60],
	    [7000,"0slowest","objUniverse", 2.66, 155, 0, 60],
	    [8000,"0slowest","objUniverse", 2.66, 160, 0, 60],
	    [9000,"0slowest","objUniverse", 2.66, 165, 0, 60],

	    [100,"0slowest","objUniverse", 1.66, 240, 0, 60],
	    [1000,"0slowest","objUniverse", 1.66, 245, 0, 60],
	    [2000,"0slowest","objUniverse", 1.66, 250, 0, 60],
	    [3000,"0slowest","objUniverse", 1.66, 255, 0, 60],
	    [4000,"0slowest","objUniverse", 2.33, 260, 0, 60],
	    [5000,"0slowest","objUniverse", 2.33, 265, 0, 60],
	    [6000,"0slowest","objUniverse", 2.33, 270, 0, 60],
	    [7000,"0slowest","objUniverse", 2.66, 275, 0, 60],
	    [8000,"0slowest","objUniverse", 2.66, 280, 0, 60],
	    [9000,"0slowest","objUniverse", 2.66, 285, 0, 60],
	    
	],
	
	level35:[
	    [100,"0slowest","objAtomic", 3.50, 0, -1, 0],
	    [2000,"0slowest","objAtomic", 3.60, 30, -1, 0],
	    [3000,"0slowest","objAtomic", 3.70, 60, -1, 0],
	    [4000,"0slowest","objAtomic", 3.80, 90, -1, 0],
	    [5000,"0slowest","objAtomic", 3.90, 120, -1, 0],
	    [5500,"0slowest","objAtomic", 4.00, 150, -1, 0],
	    [6000,"0slowest","objAtomic", 4.10, 180, -1, 0],
	    [6500,"0slowest","objAtomic", 4.20, 210, -1, 0],
	    [7000,"0slowest","objAtomic", 4.30, 240, -1, 0],
	    [7500,"0slowest","objAtomic", 4.40, 270, -1, 0],
	    [8000,"0slowest","objAtomic", 4.50, 300, -1, 0],
	    [8500,"0slowest","objAtomic", 4.60, 330, -1, 0],
	    [9000,"0slowest","objAtomic", 4.70, 0, -1, 0],
	    [9500,"0slowest","objAtomic", 4.80, 30, -1, 0],
	    [10000,"0slowest","objAtomic", 4.90, 60, -1, 0],
	    [10500,"0slowest","objAtomic", 5.00, 90, -1, 0],
	    [11000,"0slowest","objAtomic", 5.00, 120, -1, 0],
	    [11500,"0slowest","objAtomic", 5.00, 150, -1, 0],
	    [12000,"0slowest","objAtomic", 5.00, 180, -1, 0],
	    
	    [100,"0slowest","objAtomic", 3.50, 120, -1, 0],
	    [2000,"0slowest","objAtomic", 3.60, 150, -1, 0],
	    [3000,"0slowest","objAtomic", 3.70, 180, -1, 0],
	    [4000,"0slowest","objAtomic", 3.80, 210, -1, 0],
	    [5000,"0slowest","objAtomic", 3.90, 240, -1, 0],
	    [5500,"0slowest","objAtomic", 4.00, 270, -1, 0],
	    [6000,"0slowest","objAtomic", 4.10, 300, -1, 0],
	    [6500,"0slowest","objAtomic", 4.20, 330, -1, 0],
	    [7000,"0slowest","objAtomic", 4.30, 0, -1, 0],
	    [7500,"0slowest","objAtomic", 4.40, 30, -1, 0],
	    [8000,"0slowest","objAtomic", 4.50, 60, -1, 0],
	    [8500,"0slowest","objAtomic", 4.60, 90, -1, 0],
	    [9000,"0slowest","objAtomic", 4.70, 120, -1, 0],
	    [9500,"0slowest","objAtomic", 4.80, 150, -1, 0],
	    [10000,"0slowest","objAtomic", 4.90, 180, -1, 0],
	    [10500,"0slowest","objAtomic", 5.00, 210, -1, 0],
	    [11000,"0slowest","objAtomic", 5.00, 240, -1, 0],
	    [11500,"0slowest","objAtomic", 5.00, 270, -1, 0],
	    [12000,"0slowest","objAtomic", 5.00, 300, -1, 0],
	    
	    [100,"0slowest","objAtomic", 3.50, 240, -1, 0],
	    [2000,"0slowest","objAtomic", 3.60, 270, -1, 0],
	    [3000,"0slowest","objAtomic", 3.70, 300, -1, 0],
	    [4000,"0slowest","objAtomic", 3.80, 330, -1, 0],
	    [5000,"0slowest","objAtomic", 3.90, 0, -1, 0],
	    [5500,"0slowest","objAtomic", 4.00, 30, -1, 0],
	    [6000,"0slowest","objAtomic", 4.10, 60, -1, 0],
	    [6500,"0slowest","objAtomic", 4.20, 90, -1, 0],
	    [7000,"0slowest","objAtomic", 4.30, 120, -1, 0],
	    [7500,"0slowest","objAtomic", 4.40, 150, -1, 0],
	    [8000,"0slowest","objAtomic", 4.50, 180, -1, 0],
	    [8500,"0slowest","objAtomic", 4.60, 210, -1, 0],
	    [9000,"0slowest","objAtomic", 4.70, 240, -1, 0],
	    [9500,"0slowest","objAtomic", 4.80, 270, -1, 0],
	    [10000,"0slowest","objAtomic", 4.90, 300, -1, 0],
	    [10500,"0slowest","objAtomic", 5.00, 330, -1, 0],
	    [11000,"0slowest","objAtomic", 5.00, 0, -1, 0],
	    [11500,"0slowest","objAtomic", 5.00, 30, -1, 0],
	    [12000,"0slowest","objAtomic", 5.00, 60, -1, 0],
	    
	    [100,"0slowest","objUniverse", 1.66, 0, -1, 10],
	    [1000,"0slowest","objUniverse", 1.66, 5, -1, 10],
	    [2000,"0slowest","objUniverse", 1.66, 10, -1, 10],
	    [3000,"0slowest","objUniverse", 1.66, 15, -1, 10],
	    [4000,"0slowest","objUniverse", 2.33, 20, -1, 10],
	    [5000,"0slowest","objUniverse", 2.33, 25, -1, 10],
	    [6000,"0slowest","objUniverse", 2.33, 30, -1, 10],
	    [7000,"0slowest","objUniverse", 2.66, 35, -1, 10],
	    [8000,"0slowest","objUniverse", 2.66, 40, -1, 10],
	    [9000,"0slowest","objUniverse", 2.66, 45, -1, 10],

	    [100,"0slowest","objUniverse", 1.66, 180, -1, 10],
	    [1000,"0slowest","objUniverse", 1.66, 185, -1, 10],
	    [2000,"0slowest","objUniverse", 1.66, 190, -1, 10],
	    [3000,"0slowest","objUniverse", 1.66, 195, -1, 10],
	    [4000,"0slowest","objUniverse", 2.33, 200, -1, 10],
	    [5000,"0slowest","objUniverse", 2.33, 205, -1, 10],
	    [6000,"0slowest","objUniverse", 2.33, 210, -1, 10],
	    [7000,"0slowest","objUniverse", 2.66, 215, -1, 10],
	    [8000,"0slowest","objUniverse", 2.66, 220, -1, 10],
	    [9000,"0slowest","objUniverse", 2.66, 225, -1, 10],
	],
	level42:[
	    [100,"0slower","objAtomic", 3.10, 0, -1, 0],
	    [2000,"0slower","objAtomic", 3.20, 30, -1, 0],
	    [3000,"0slower","objAtomic", 3.30, 60, -1, 0],
	    [4000,"0slower","objAtomic", 3.40, 90, -1, 0],
	    [5000,"0slower","objAtomic", 3.50, 120, -1, 0],
	    [5500,"0slower","objAtomic", 3.60, 150, -1, 0],
	    [6000,"0slower","objAtomic", 3.70, 180, -1, 0],
	    [6500,"0slower","objAtomic", 3.80, 210, -1, 0],
	    [7000,"0slower","objAtomic", 3.90, 240, -1, 0],
	    [7500,"0slower","objAtomic", 4.00, 270, -1, 0],
	    [8000,"0slower","objAtomic", 4.10, 300, -1, 0],
	    [8500,"0slower","objAtomic", 4.20, 330, -1, 0],
	    [9000,"0slower","objAtomic", 4.30, 0, -1, 0],
	    [9500,"0slower","objAtomic", 4.40, 30, -1, 0],
	    [10000,"0slower","objAtomic", 4.50, 60, -1, 0],
	    [10500,"0slower","objAtomic", 4.50, 90, -1, 0],
	    [11000,"0slower","objAtomic", 4.50, 120, -1, 0],
	    [11500,"0slower","objAtomic", 4.50, 150, -1, 0],
	    [12000,"0slower","objAtomic", 4.50, 180, -1, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 120, -1, 0],
	    [2000,"0slower","objAtomic", 3.20, 150, -1, 0],
	    [3000,"0slower","objAtomic", 3.30, 180, -1, 0],
	    [4000,"0slower","objAtomic", 3.40, 210, -1, 0],
	    [5000,"0slower","objAtomic", 3.50, 240, -1, 0],
	    [5500,"0slower","objAtomic", 3.60, 270, -1, 0],
	    [6000,"0slower","objAtomic", 3.70, 300, -1, 0],
	    [6500,"0slower","objAtomic", 3.80, 330, -1, 0],
	    [7000,"0slower","objAtomic", 3.90, 0, -1, 0],
	    [7500,"0slower","objAtomic", 4.00, 30, -1, 0],
	    [8000,"0slower","objAtomic", 4.10, 60, -1, 0],
	    [8500,"0slower","objAtomic", 4.20, 90, -1, 0],
	    [9000,"0slower","objAtomic", 4.30, 120, -1, 0],
	    [9500,"0slower","objAtomic", 4.40, 150, -1, 0],
	    [10000,"0slower","objAtomic", 4.50, 180, -1, 0],
	    [10500,"0slower","objAtomic", 4.50, 210, -1, 0],
	    [11000,"0slower","objAtomic", 4.50, 240, -1, 0],
	    [11500,"0slower","objAtomic", 4.50, 270, -1, 0],
	    [12000,"0slower","objAtomic", 4.50, 300, -1, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 240, -1, 0],
	    [2000,"0slower","objAtomic", 3.20, 270, -1, 0],
	    [3000,"0slower","objAtomic", 3.30, 300, -1, 0],
	    [4000,"0slower","objAtomic", 3.40, 330, -1, 0],
	    [5000,"0slower","objAtomic", 3.50, 0, -1, 0],
	    [5500,"0slower","objAtomic", 3.60, 30, -1, 0],
	    [6000,"0slower","objAtomic", 3.70, 60, -1, 0],
	    [6500,"0slower","objAtomic", 3.80, 90, -1, 0],
	    [7000,"0slower","objAtomic", 3.90, 120, -1, 0],
	    [7500,"0slower","objAtomic", 4.00, 150, -1, 0],
	    [8000,"0slower","objAtomic", 4.10, 180, -1, 0],
	    [8500,"0slower","objAtomic", 4.20, 210, -1, 0],
	    [9000,"0slower","objAtomic", 4.30, 240, -1, 0],
	    [9500,"0slower","objAtomic", 4.40, 270, -1, 0],
	    [10000,"0slower","objAtomic", 4.50, 300, -1, 0],
	    [10500,"0slower","objAtomic", 4.50, 330, -1, 0],
	    [11000,"0slower","objAtomic", 4.50, 0, -1, 0],
	    [11500,"0slower","objAtomic", 4.50, 30, -1, 0],
	    [12000,"0slower","objAtomic", 4.50, 60, -1, 0],
	    
	    [100,"0slowest","objUniverse", 1.33, 0, -1, 1],
	    [1000,"0slowest","objUniverse", 1.33, 5, -1, 1],
	    [2000,"0slowest","objUniverse", 1.33, 10, -1, 1],
	    [3000,"0slowest","objUniverse", 1.33, 15, -1, 1],
	    [4000,"0slowest","objUniverse", 1.33, 20, -1, 1],
	    [5000,"0slowest","objUniverse", 1.33, 25, -1, 1],
	    [6000,"0slowest","objUniverse", 1.33, 30, -1, 1],
	    [7000,"0slowest","objUniverse", 1.33, 35, -1, 1],
	    [8000,"0slowest","objUniverse", 1.33, 40, -1, 1],
	    [9000,"0slowest","objUniverse", 1.33, 45, -1, 1],
	    
	    [100,"0slowest","objUniverse", 1.66, 180, -1, 1],
	    [1000,"0slowest","objUniverse", 1.66, 185, -1, 1],
	    [2000,"0slowest","objUniverse", 1.66, 190, -1, 1],
	    [3000,"0slowest","objUniverse", 1.66, 195, -1, 1],
	    [4000,"0slowest","objUniverse", 2.33, 200, -1, 1],
	    [5000,"0slowest","objUniverse", 2.33, 205, -1, 1],
	    [6000,"0slowest","objUniverse", 2.33, 210, -1, 1],
	    [7000,"0slowest","objUniverse", 2.66, 215, -1, 1],
	    [8000,"0slowest","objUniverse", 2.66, 220, -1, 1],
	    [9000,"0slowest","objUniverse", 2.66, 225, -1, 1],
	],
	level49:[
	    [100,"0slower","objAtomic", 3.10, 0, -1, 0],
	    [2000,"0slower","objAtomic", 3.20, 30, -1, 0],
	    [3000,"0slower","objAtomic", 3.30, 60, -1, 0],
	    [4000,"0slower","objAtomic", 3.40, 90, -1, 0],
	    [5000,"0slower","objAtomic", 3.50, 120, -1, 0],
	    [5500,"0slower","objAtomic", 3.60, 150, -1, 0],
	    [6000,"0slower","objAtomic", 3.70, 180, -1, 0],
	    [6500,"0slower","objAtomic", 3.80, 210, -1, 0],
	    [7000,"0slower","objAtomic", 3.90, 240, -1, 0],
	    [7500,"0slower","objAtomic", 4.10, 270, -1, 0],
	    [8000,"0slower","objAtomic", 4.20, 300, -1, 0],
	    [8500,"0slower","objAtomic", 4.30, 330, -1, 0],
	    [9000,"0slower","objAtomic", 4.40, 0, -1, 0],
	    [9500,"0slower","objAtomic", 4.50, 30, -1, 0],
	    [10000,"0slower","objAtomic", 4.50, 60, -1, 0],
	    [10500,"0slower","objAtomic", 4.50, 90, -1, 0],
	    [11000,"0slower","objAtomic", 4.50, 120, -1, 0],
	    [11500,"0slower","objAtomic", 4.50, 150, -1, 0],
	    [12000,"0slower","objAtomic", 4.50, 180, -1, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 120, -1, 0],
	    [2000,"0slower","objAtomic", 3.20, 150, -1, 0],
	    [3000,"0slower","objAtomic", 3.30, 180, -1, 0],
	    [4000,"0slower","objAtomic", 3.40, 210, -1, 0],
	    [5000,"0slower","objAtomic", 3.50, 240, -1, 0],
	    [5500,"0slower","objAtomic", 3.60, 270, -1, 0],
	    [6000,"0slower","objAtomic", 3.70, 300, -1, 0],
	    [6500,"0slower","objAtomic", 3.80, 330, -1, 0],
	    [7000,"0slower","objAtomic", 3.90, 0, -1, 0],
	    [7500,"0slower","objAtomic", 4.00, 30, -1, 0],
	    [8000,"0slower","objAtomic", 4.10, 60, -1, 0],
	    [8500,"0slower","objAtomic", 4.20, 90, -1, 0],
	    [9000,"0slower","objAtomic", 4.30, 120, -1, 0],
	    [9500,"0slower","objAtomic", 4.40, 150, -1, 0],
	    [10000,"0slower","objAtomic", 4.50, 180, -1, 0],
	    [10500,"0slower","objAtomic", 4.50, 210, -1, 0],
	    [11000,"0slower","objAtomic", 4.50, 240, -1, 0],
	    [11500,"0slower","objAtomic", 4.50, 270, -1, 0],
	    [12000,"0slower","objAtomic", 4.50, 300, -1, 0],
	    
	    [100,"0slower","objAtomic", 3.10, 240, -1, 0],
	    [2000,"0slower","objAtomic", 3.20, 270, -1, 0],
	    [3000,"0slower","objAtomic", 3.30, 300, -1, 0],
	    [4000,"0slower","objAtomic", 3.40, 330, -1, 0],
	    [5000,"0slower","objAtomic", 3.50, 0, -1, 0],
	    [5500,"0slower","objAtomic", 3.60, 30, -1, 0],
	    [6000,"0slower","objAtomic", 3.70, 60, -1, 0],
	    [6500,"0slower","objAtomic", 3.80, 90, -1, 0],
	    [7000,"0slower","objAtomic", 3.90, 120, -1, 0],
	    [7500,"0slower","objAtomic", 4.00, 150, -1, 0],
	    [8000,"0slower","objAtomic", 4.10, 180, -1, 0],
	    [8500,"0slower","objAtomic", 4.20, 210, -1, 0],
	    [9000,"0slower","objAtomic", 4.30, 240, -1, 0],
	    [9500,"0slower","objAtomic", 4.40, 270, -1, 0],
	    [10000,"0slower","objAtomic", 4.50, 300, -1, 0],
	    [10500,"0slower","objAtomic", 4.50, 330, -1, 0],
	    [11000,"0slower","objAtomic", 4.50, 0, -1, 0],
	    [11500,"0slower","objAtomic", 4.50, 30, -1, 0],
	    [12000,"0slower","objAtomic", 4.50, 60, -1, 0],
	    
	    [100,"0","objUniverse", 1.5, 0, -1, 0],
	    [2000,"0","objUniverse", 1.5, 5, -1, 0],
	    [3000,"0","objUniverse", 1.5, 10, -1, 0],
	    [4000,"0","objUniverse", 1.5, 15, -1, 0],
	    [5000,"0","objUniverse", 1.5, 20, -1, 0],
	    [6000,"0","objUniverse", 1.5, 25, -1, 0],
	    [7000,"0","objUniverse", 1.5, 30, -1, 0],
	    [8000,"0","objUniverse", 1.5, 35, -1, 0],
	    [9000,"0","objUniverse", 1.5, 40, -1, 0],
	    [10000,"0","objUniverse", 1.5, 45, -1, 0],
	],
    };


/*
  [1000,"QuarterCircle2","objUniverse",1.5,0,1,45],
  [1500,"QuarterCircle2","objUniverse",1.5,45,1,45],
  [2000,"QuarterCircle2","objUniverse",1.5,90,1,45],
  [2500,"QuarterCircle2","objUniverse",1.5,135,1,45],
  [3000,"QuarterCircle2","objUniverse",1.5,180,1,45],
  [3500,"QuarterCircle2","objUniverse",1.5,225,1,45],
  [4000,"QuarterCircle2","objUniverse",1.5,270,1,45],
  [4500,"QuarterCircle2","objUniverse",1.5,315,1,45],
  [5000,"QuarterCircle2","objUniverse",1.5,360,1,45],
  [6000,"QuarterCircle2","objUniverse",1.5,45,1,45],
  [7000,"QuarterCircle2","objUniverse",1.5,90,1,45],
*/

/*
//PRECISION!
[1000,"9Burst","objUniverse",1.5,-45],
[2500,"9Burst","objUniverse",1.5,135],
[4000,"9Burst","objUniverse",1.5,-45,0.75,10],
[5500,"9Burst","objUniverse",1.5,135,0.75,20],
[7000,"9Burst","objUniverse",1.5,-45,0.75,-10],
[8500,"9Burst","objUniverse",1.5,135,0.75,-20],
*/


/*
//half and half with a swish
[1000,"HalfCircle","objUniverse",1.5,-45],
[3500,"HalfCircle","objUniverse",1.5,135],
[5000,"QuarterCircle","objUniverse",1.5,0,1,-45],
[5000,"QuarterCircle","objUniverse",1.5,180,1,-45],
[6000,"QuarterCircle","objUniverse",2.0,0,1,-30],
[6300,"QuarterCircle","objUniverse",2.0,180,1,30],
*/

/*
//TROLOLOLOLOLOLOLOL
[1000,"QuarterCircle2","objUniverse",1.5,0,1,45],
[1500,"QuarterCircle2","objUniverse",1.5,45,1,45],
[2000,"QuarterCircle2","objUniverse",1.5,90,1,45],
[2500,"QuarterCircle2","objUniverse",1.5,135,1,45],
[3000,"QuarterCircle2","objUniverse",1.5,180,1,45],
[3500,"QuarterCircle2","objUniverse",1.5,225,1,45],
[4000,"QuarterCircle2","objUniverse",1.5,270,1,45],
[4500,"QuarterCircle2","objUniverse",1.5,315,1,45],
[5000,"QuarterCircle2","objUniverse",1.5,360,1,45],
[6000,"QuarterCircle2","objUniverse",1.5,45,1,45],
[7000,"QuarterCircle2","objUniverse",1.5,90,1,45],
[1000,"Plus","objUniverse",1.0,0],
[1500,"Plus","objUniverse",1.0,0],
[2000,"Plus","objUniverse",1.0,0],
[2500,"Plus","objUniverse",1.0,0],
[3000,"Plus","objUniverse",1.0,0],
[3500,"Plus","objUniverse",1.0,0],
[4000,"Plus","objUniverse",1.0,0],
[4500,"Plus","objUniverse",1.0,0],
[5000,"Plus","objUniverse",1.0,0],
//[11000,"5b","objUniverse", 1.0, 135],
*/

/*
//Twist right then left
[500,"Plus","objUniverse",1.0,0],
[1000,"Plus","objUniverse",1.0,15],
[1500,"Plus","objUniverse",1.0,30],
[2000,"Plus","objUniverse",1.0,45],
[2500,"Plus","objUniverse",1.0,60],
[3000,"Plus","objUniverse",1.0,75],
[3500,"Plus","objUniverse",1.0,75],
[4000,"Plus","objUniverse",1.0,60],
[4500,"Plus","objUniverse",1.0,45],
[5000,"Plus","objUniverse",1.0,30],
[5500,"Plus","objUniverse",1.0,15],
[6000,"Plus","objUniverse",1.0,0],
[8500,"9Burst","objUniverse", 1.0, 0],
*/

/*
//Cluttered Bullets
[1000,"FastFan","objUniverse",1.5,0],
[3000,"FastFan","objUniverse",1.5,90],
[5000,"FastFan","objUniverse",1.5,180],
[7000,"FastFan","objUniverse",1.5,270],
*/

/*
  [1000,"Fan","objUniverse",1.0,0,0,-1],
  [3000,"Fan","objUniverse",1.0,90,0,-1],
  [5000,"Fan","objUniverse",1.0,180,0,-1],
  [7000,"Fan","objUniverse",1.0,270,0,-1],
*/

/*	
	--------------------------------------------
	{
	pattern#: [
	[ ms til activation , speed , degrees], 
	[ ms til activation , speed , degrees], 
	[ ms til activation , speed , degrees]
	]
	};

*/

var Patterns = 
    {
	pattern1: [
	    [ 0, 0.25 , 0], 
	    [ 500 , 0.5 , 30], 
	    [ 750 , 0.75 , 60],
	],
	pattern1_five: [
	    [ 0, 0.25 , 0], 
	    [ 500 , 0.5 , 30], 
	    [ 750 , 0.75 , 60],
	    [ 875 , 0.875 , 90],
	    [ 1000 , 1.0 , 112.5],
	],
	pattern1_seven: [
	    [ 0, 0.25 , 0], 
	    [ 500 , 0.5 , 30], 
	    [ 750 , 0.750 , 60],
	    [ 875 , 0.875 , 90],
	    [ 1000 , 1.00 , 112.5],
	    [ 1250 , 1.25 , 135.0],
	    [ 1350 , 1.33 , 150.0],
	],
	pattern1_nine: [
	    [ 0, 0.25 , 0], 
	    [ 500 , 0.5 , 30], 
	    [ 750 , 0.750 , 60],
	    [ 875 , 0.875 , 90],
	    [ 1000 , 1.00 , 112.5],
	    [ 1250 , 1.25 , 135.0],
	    [ 1350 , 1.33 , 150.0],
	    [ 1450 , 1.33 , 172.5],
	    [ 1550 , 1.33 , 195.0],
	],
	
	
	
	pattern3: [
	    [ 0, .45 , 0], 
	    [ 250 , 0.4 , 11.25], 
	    [ 500 , 0.35 , 22.5],
	    [ 950 , 0.3 , 33.75],
	    [ 1050 , 0.25 , 45]
	],
	
	/*2 semicircles (sideways)*/
	pattern5a: [
	    [ 0, .2, 11.25],
	    [ 150, .2, 45],
	    [ 200, .2, 67.5],
	    [ 250, .2, 90],
	    [ 300, .2, 112.25]
	],
	
	pattern5b: [
	    [ 0, .2, -11.25],
	    [ 150, .2, -45],
	    [ 200, .2, -67.5],
	    [ 250, .2, -90],
	    [ 300, .2, -112.25]
	],
	
	/* v-formation */
	pattern6: [
	    [100, 0.125, 0],
	    [500, 0.125, 22.5],
	    [500, 0.125, -22.5],
	    [1000, 0.125, 60],
	    [1000, 0.125, -60]
	],

	pattern6_complex: [
	    [100, 0.175, 0],
	    [300, 0.175, 22.5],
	    [300, 0.175, -22.5],
	    [450, 0.175, 0],
	    [500, 0.175, 67.5],
	    [500, 0.175, -67.5],
	],    
	pattern6_morecomplex: [
	    [100, 0.2, 0],
	    [300, 0.2, 22.5],
	    [300, 0.2, -22.5],
	    [450, 0.2, 0],
	    [500, 0.2, 67.5],
	    [500, 0.2, -67.5],
	    [750, 0.2, 0],
	],
	
	pattern5aslow: [
	    [ 0, .25, 22.5],
	    [ 200, .25, 67.5],
	    [ 500, .25, 112.25]
	],
	
	pattern5aslower: [
	    [ 0, .06125, 22.5],
	    [ 200, .06125, 67.5],
	    [ 500, .06125, 112.25]
	],
	
	pattern0: [
	    [0, .5, 0]
	],
	pattern0slow: [
	    [0, .33, 0]
	],
	pattern0slower: [
	    [0, .25, 0]
	],
	pattern0slowest: [
	    [0, .125, 0]
	],
    	


	pattern9Burst: [
	    [ 0, 0.1 , 0], 
	    [ 10 , 0.1 , 40], 
	    [ 20 , 0.1 , 80],
	    [ 30 , 0.1 , 120],
	    [ 40 , 0.1 , 160],
	    [ 50 , 0.1 , 200],
	    [ 60 , 0.1 , 240],
	    [ 70 , 0.1 , 280],
	    [ 80 , 0.1 , 320],
	],
	
	
	pattern12Burst: [
	    [ 0, 0.1 , 0], 
	    [ 10 , 0.1 , 30], 
	    [ 20 , 0.1 , 60],
	    [ 30 , 0.1 , 90],
	    [ 40 , 0.1 , 120],
	    [ 50 , 0.1 , 150],
	    [ 60 , 0.1 , 180],
	    [ 70 , 0.1 , 210],
	    [ 80 , 0.1 , 240],
	    [ 90 , 0.1 , 270],
	    [ 100 , 0.1 , 300],
	    [ 110 , 0.1 , 330],
	    
	],
	
	patternDelayedHalfCircle: [
	    [ 0, 0.1 , 90],
	    [ 150, 0.125 , 67.5],	
	    [ 300, 0.15 , 45],	
	    [ 450,  0.175, 22.5],	
	    [ 600, 0.2 , 0],	
	    [ 750, 0.225 , -22.5],	
	    [ 900, 0.25 , -45],	
	    [ 1050, 0.275, -67.5],	
	    [ 1200, 0.3 , -90],		
	],
	
	patternHalfCircle: [
	    [ 0, 0.2 , 90],
	    [ 0, 0.2 , 67.5],	
	    [ 0, 0.2 , 45],	
	    [ 0,  0.2, 22.5],	
	    [ 0, 0.2 , 0],	
	    [ 0, 0.2 , -22.5],	
	    [ 0, 0.2 , -45],	
	    [ 0, 0.2, -67.5],	
	    [ 0, 0.2 , -90],		
	],
	
	patternQuarterCircle: [
	    [ 0, 0.2 , 90],
	    [ 0, 0.2 , 67.5],	
	    [ 0, 0.2 , 45],	
	    [ 0,  0.2, 22.5],	
	    [ 0, 0.2 , 0],		
	],
	
	patternQuarterCircle2: [
	    [ 0, 0.2 , 90],
	    [ 0, 0.3 , 85],
	    [ 0, 0.4 , 80],
	    [ 0, 0.5 , 75],
	    [ 0, 0.6 , 70],
	    [ 0, 0.7 , 65],
	],
	
	patternPlus:
	[
	    [0,0.5,0],
	    [0,0.5,90],
	    [0,0.5,180],
	    [0,0.5,270],
	],
	
	patternFan:
	[
	    [0,0.5,0],
	    [0,0.5,180],
	    [500,0.5,-30],
	    [500,0.5,210],
	    [1000,0.5,-60],
	    [1000,0.5,240],
	    [1500,0.5,-90],
	    [1500,0.5,270],
	    [2000,0.5,-120],
	    [2000,0.5,300],
	    [2500,0.5,-150],
	    [2500,0.5,330],
	    [3000,0.5,180],
	    [3000,0.5,360],

	],
	
	patternFastFan:
	[
	    [0,0.5,0],
	    [0,0.5,180],
	    [250,0.5,-30],
	    [250,0.5,210],
	    [500,0.5,-60],
	    [500,0.5,240],
	    [750,0.5,-90],
	    [750,0.5,270],
	    [1000,0.5,-120],
	    [1000,0.5,300],
	    [1250,0.5,-150],
	    [1250,0.5,330],
	    [1500,0.5,180],
	    [1500,0.5,360],
	]
	
	

    };
//-----------Helper functions-----------------
var SoundFiles = [
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
var XOffset, YOffset;
var Scale;

var Loader;
var Sounds = [];
var AssetsLoaded = false;
var StartGame = false;

var level;
var gameSpeed;
var resetting;
var LevelDist = 150;
var PlayerDist = 250;
var PlayerSize = 15;
var Avatar;

var MouseX = 0;
var MouseY = 0;

var now = null;


// This is the first entry point in the script.
function main(hasSound) {

    console.log("Canvas Width : " + _Canvas.width);
    console.log("Canvas Height : " + _Canvas.height);

    // Scale viewport to canvas.
    var wscale = _Canvas.width * 1.0 / Viewport.width;
    var hscale = _Canvas.height * 1.0 / Viewport.height;

    Scale = Math.max(wscale, hscale);

    // We will have to center the viewport such that the main 
    // playing part is visible.
    XOffset = (_Canvas.width - Viewport.width * Scale) / 2;
    YOffset = (_Canvas.height - Viewport.height * Scale);
    
    //console.log("Scale: " + Scale);
    //console.log("XOffset: " + XOffset + " YOffset: " + YOffset);

    _Context.translate(XOffset, YOffset);
    _Context.scale(Scale, Scale); 

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
	SoundMan.init(function() {
	    SoundMan.loadFiles(SoundFiles, function() { loadImages(); });
	});
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
        theta += 20;
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
                    
                    _Context.save();
                    _Context.translate(Viewport.width / 2 + x,
                                      Viewport.height / 2 + y);             
                    _Context.rotate(rot * Math.PI / 180.0);
                    _Context.drawImage(img,
                                      -size, -size, 
                                      size * 2, size * 2);
                    _Context.restore();

                    setTimeout(loadPulse, 30);
                }
                setTimeout(loadPulse, 30);


                return; // break out of load screen.
            }
            checkForLoaded = false;
        }

        clear();
        _Context.drawImage(loading,
                          Viewport.width/2 - loading.width / 2,
                          Viewport.height/2 - loading.height / 2, 
                          loading.width, loading.height);

        for (var deg = 0; deg < 360; deg += 20) {
            if (deg != theta) {
                _Context.globalAlpha = 0.5;
            }
        
            var x = Viewport.width / 2 
                + LevelDist * Math.cos((270 + deg) * Math.PI / 180);
            var y = Viewport.height / 2 
                - LevelDist * Math.sin((270 + deg) * Math.PI / 180);
  
            _Context.drawImage(img, x - PlayerSize, y - PlayerSize, 
                              PlayerSize * 2, PlayerSize * 2);

            _Context.globalAlpha = 1.0;
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
}

Loader = {
    images : [],
    load : function(files, onloaded) {
	var loaded = 0;
	var callback = function() {
	    if (++loaded == files.length) {
		onloaded();
	    }
	}
	for (var i = 0 ; i < files.length; i++) {
	    var img = new Image();
	    img.onload = callback;
	    img.src = files[i];	    
	    Loader.images[files[i]] = img;
	}
    },
    getFile : function(file) {
	if (Loader.images[file]) {
	    return Loader.images[file];
	} else {
	    return null;
	}
    }
}

function loadImages() {    
    var loaded = false;    
    Loader.load(ImageFiles, function() {
        if (loaded) {
            return;
        }
        loaded = true;
        AssetsLoaded = true;
        startGame();
    });
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
    _Canvas.onmousemove = mousemove;
    _Canvas.onmousedown = mousedown;

    if (_Canvas.addEventListener) {
      _Canvas.addEventListener("touchstart", handleTouch);
    } else if (typeof(AppMobi) != "undefined") {
      Canvas.addEventListener("touchstart", handleTouch);
    }

    /*
    if (typeof(Canvas) != "undefined") {
	Canvas.addEventListener('touchstart', handleTouch, false);
    }
    */
    
    if ((typeof(AppMobi) == "undefined") && (window.DeviceOrientationEvent)) {
      window.addEventListener('deviceorientation', onOrientation, false);
    }

    //restoreCurrentIterationState();

    level = new Level();
    level.LoadWaves(BgIters * BgList.length + 1);

    pauseImg = Loader.getFile("img/paused.png");
    _Context.globalAlpha = 1.0;
    _Context.save();    

    // Load last mute state from local storage.
    /* Disabling - might be too confusing
    getMuteState();
    if (muted) {
        SoundMan.mute();
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
    _Context.restore();
    _Context.save();
    
    clear();
        
    _Context.translate(Viewport.width / 2, Viewport.height / 2);
    _Context.rotate(Math.PI / 180 * (Avatar.deg + 90));
    _Context.translate(-Viewport.width / 2, -Viewport.height / 2);
        
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
        _Context.restore();
        _Context.save();
        
        _Context.globalAlpha = 0.5;
        _Context.fillStyle = "rgb(0, 0, 0)";
        _Context.fillRect(0, 0, Viewport.width, Viewport.height);

        _Context.globalAlpha = 0.9;
        _Context.drawImage(
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
                + LevelDist * Math.cos(deg * Math.PI / 180);
            var y = Viewport.height / 2 
                - LevelDist * Math.sin(deg * Math.PI / 180);

	    var m = MapToViewport(MouseX, MouseY);
	    
            if (((m.x - x) * (m.x - x) + 
                 (m.y - y) * (m.y - y))
		< PlayerSize * PlayerSize * Scale * Scale * 4) {

                IterationSelected = i;

                LevelImageRot[i] += 3;
                if (LevelImageRot[i] > 360) {
                    LevelImageRot[i] -= 360;
                }
            }       
            
	    if (IterationsCompleted[i] == "0") {
		_Context.globalAlpha = 0.4;
	    } else {
		_Context.globalAlpha = 1.0;
	    }

	    _Context.save();
	    _Context.translate(x, y);
	    _Context.rotate(LevelImageRot[i] * Math.PI / 180);
	    _Context.drawImage(img, -PlayerSize * 2, -PlayerSize * 2, 
			      PlayerSize * 4, PlayerSize * 4);
	    _Context.restore();
	}

	_Context.globalAlpha = 1.0;
    }
    
    if (_Context.present) {
	_Context.present();
    }
}

function clear() {
    _Context.clearRect(0, 0, Viewport.width, Viewport.height);
    _Context.fillStyle = "rgb(255, 255, 255)";
    _Context.fillRect(0, 0, Viewport.width, Viewport.height);
}

function pause() {
    gamePaused = true;
    if (!muted) {
	SoundMan.mute();
    }
}

function unpause() {
    gamePaused = false;
    if (!muted) {
	SoundMan.unmute();
    }
}

function mute() {
    muted = true;
    SoundMan.mute();
    showMute();
    setMuteState();
}

function unmute() {
    muted = false;
    SoundMan.unmute();
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
    if (!resetting && (typeof(Avatar) != "undefined")) {
        Avatar.OnOrientation(e);
    }
}

function setOrientation(x) {
    var deg = x * 90;
    var e = {gamma: deg};
    onOrientation(e);
}

function cheat() {
    if ((typeof(level) != "undefined") && !resetting && !gamePaused) {
	level.cheat();
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
    var canvasPos = getOffset(_Canvas);
    
    MouseX = e.clientX - canvasPos.left + 8;
    MouseY = e.clientY - canvasPos.top + 8;
}

function mousemove(e) {
    getMousePos(e);
}

function MapToViewport(x, y) {
    var mx = (-XOffset + x) / Scale;
    var my = (-YOffset + y) / Scale;

    return {"x" : mx, "y" : my};
}

function handleTouch(event) {
    MouseX = event.touches[0].pageX;
    MouseY = event.touches[0].pageY;
    
    handleClick();
}

function mousedown(e) {
    
    // Find out the latest selection.	
    getMousePos(e);
    
    if ((e.which) && (e.which != 1)) {
	return; // Not left button. Do nothing.
    }
	
    handleClick();
}

function handleClick() {
    if (!StartGame) {
	return; // Don't pause in the load screen.
    }
    
    if (gamePaused) {
	IterationSelected = -1;
	
        for (var i = 0; i < 7; i++) {
	    var deg = 270 + (i - BgIters) * 360 / 7;
	    
	    var x = Viewport.width / 2 
		+ LevelDist * Math.cos(deg * Math.PI / 180);
            var y = Viewport.height / 2 
		- LevelDist * Math.sin(deg * Math.PI / 180);
	    
	    // Map the mouse position to Viewport co-ordinates.
	    var m = MapToViewport(MouseX, MouseY);

            if (((m.x - x) * (m.x - x) + 
                 (m.y - y) * (m.y - y)) 
		< PlayerSize * PlayerSize * Scale * Scale * 4) {
		
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

