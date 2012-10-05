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

Backup.prototype.destroy = function() {
    destroyObject(Backups, this);
    if (Backups.length == 0) {
        Avatar.deg = 270;
        resetting = false;
        new Background(1.0);
    }
}