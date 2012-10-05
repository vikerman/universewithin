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
	
        trackLevelDied();
	
        Blocks = [];
        level.reset();
        var hit = Sounds["sound/hit.mp3"];
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
      Context.fillStyle = this.fillColor;
      Context.beginPath();
      Context.arc(this.x, this.y, this.size+1, 0, Math.PI*2, true); 
      Context.closePath();
      Context.fill();*/
    
    
    Context.drawImage(
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
