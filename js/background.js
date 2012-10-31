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
    Context.globalAlpha = this.alpha;
    Context.drawImage(this.img, 
                      (Viewport.width / 2  
		       - this.img.width / 2 * this.scale),
                      (Viewport.height / 2
		       - this.img.height / 2 * this.scale),
                      this.img.width * this.scale,
                      this.img.height * this.scale);
    Context.globalAlpha = 1.0;
}

Background.prototype.destroy = function() {
    if (this.bgTheme) {
        this.bgTheme.stop();
    }
    destroyObject(Backgrounds, this);
}