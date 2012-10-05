 var Wave = Class.create({
     initialize: function() {
	 this.time = 0;
	 this.scale = 1.0;
	 this.triggered = false;
	 this.deg = 0;
	 this.image = "";
	 this.accel = 0;
	 this.omega = 0; // angular velocity.
     },
 });
  
var Level = Class.create({
    initialize: function() {
	this.waves = [];
	this.levelTimer = 0.0;
	this.level = 1;
    },
    
    LoadPattern: function(patternNumber, size, time, offset, flipped, omega,
			  image)
    {
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
    },
    
    LoadWaves: function(targetLevel)
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
    },
    
    update: function(deltaT)
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
    },
  
    reset: function()
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

	var rev =  Sounds["sound/pianoreverse.mp3"];
	if (rev) {
            rev.play();
	}   
	
	new Backup(1.0);
    },
    
    keydown: function(e) {
        if (e.keyCode == 49)
	{
	    if (Backgrounds.length <= 3) {
		transition();
		//this.LoadWaves(BgIndex+1);
		this.LoadWaves(BgIters * BgList.length + BgIndex + 1);
		this.levelTimer = -1.5;
	    }
	}	
    },
    
    setImage: function(wave)
    {
	var imgArray = ImageSets[wave.image];
	if (imgArray == null) {
	    imgArray = ImageSets["objGalaxy"];
	}
	var temp = Math.floor(Math.random() * imgArray.length);
	wave.image = imgArray[temp];	
    },
});
