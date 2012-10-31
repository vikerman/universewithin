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

