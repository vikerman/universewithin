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