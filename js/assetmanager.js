//SoundManager configuration.
soundManager.url = 'swf/';
soundManager.flashVersion = 9;
function TileSet(img, w, h) {
	this.img = img;
	this.width = w;
	this.height = h;
}
TileSet.prototype.setImage = function(img) {
	this.img = img;
}

//TODO: If this is too slow, it may be necessary later to
//	add some kind of canvas buffering for each room.
TileSet.prototype.draw = function(context, x, y, tile) {
	context.drawImage(this.img,(tile%this.width) * TILE_SIZE, Math.floor(tile / this.width)*TILE_SIZE,TILE_SIZE,TILE_SIZE,
		Math.floor(x), Math.floor(y), TILE_SIZE,TILE_SIZE);
}

function Animation(img, numFrames, nC, frameW, frameH, speed, nloop, ox, oy, fox, f) {
	this.img = img;
	this.flipped = f;
	this.frame = 0;
	this.length = numFrames;
	this.frameWidth = frameW;
	this.frameHeight = frameH;
	this.numCols = nC;
	this.timer = 0;
	this.speed = speed;
	this.loop = nloop;
	this.reverse = false;
	
	//Location in image.
	this.offsetX = ox;
	this.offsetY = oy;
	this.flipOffsetX = fox;
	
	//SpriteSheet location.
	this.ssX = 0;
	this.ssY = 0;
}

Animation.prototype.tick = function() {
	if(!this.loop) { 
		if(!this.reverse && this.frame == this.length-1){
			return;
		}
		if(this.reverse && this.frame == 0){
			return;
		}
	}
	this.timer++;
	
	if(this.timer >= this.speed){
		if(this.reverse) {
			this.frame--;
		}
		else {
			this.frame++;
		}
		this.timer = 0;
		
		if(this.frame === this.length) {
			if(this.loop)
				this.frame = 0;
			else
				this.frame--;
		}
		if(this.frame === -1) {
			if(this.loop)
				this.frame = this.length - 1;
			else
				this.frame++;
		}
		//console.log(this.frame + " / " + this.length);
		this.ssX = (this.frame%this.numCols) * this.frameWidth;
		this.ssY = Math.floor(this.frame/this.numCols) * this.frameHeight;
	}
}

Animation.prototype.draw = function(context, x, y, flip) {
	//console.log(this.frameWidth + " : " + this.frameHeight);
	if(flip){
		context.drawImage(this.flipped,this.img.width - this.ssX - this.frameWidth,this.ssY,this.frameWidth,this.frameHeight,
			x-this.flipOffsetX,y-this.offsetY,this.frameWidth,this.frameHeight);
	}
	else{
		context.drawImage(this.img,this.ssX,this.ssY,this.frameWidth,this.frameHeight,
			x-this.offsetX,y-this.offsetY,this.frameWidth,this.frameHeight);
	}
}

//This function assumes that ALL animations have a flipped variation.
Animation.prototype.setImage = function(img) {
	this.img = img;
	
	var canvas = document.createElement("canvas");
	canvas.width = img.width;
	canvas.height = img.height;
	var ctx = canvas.getContext("2d");
	ctx.scale(-1, 1);
	ctx.translate(-img.width, 0);
	ctx.drawImage(img, 0, 0);
	this.flipped = new Image();
	this.flipped.src=canvas.toDataURL();
}
Animation.prototype.reset = function() {
	this.frame = 0;
	this.timer = 0;
	this.ssX = 0;
	this.ssY = 0;
}
/*
	END ANIMATION CODE
	END ANIMATION CODE
	END ANIMATION CODE
	END ANIMATION CODE
*/

function AssetManager() {
	this.successCount = 0;
	this.errorCount = 0;
	this.imageQueue = [];
	this.soundQueue = [];
	this.levelQueue = [];
	this.cache = {};
	this.rooms = {};
	this.anims = {};
	this.tilesets = {};
}

//var audioContext = new webkitAudioContext();

AssetManager.prototype.queueImage = function(path) {
	this.imageQueue.push(path);
}

AssetManager.prototype.getAsset = function(path) {
	return this.cache[path];
}
//Note this function returns a clone of the animation object.
AssetManager.prototype.getAnim = function(animName) {
	var t = this.anims[animName];
	var toReturn = new Animation(t.img, t.length, t.numCols, t.frameWidth, t.frameHeight, t.speed, t.loop, t.offsetX, t.offsetY, t.flipOffsetX, t.flipped);
	return toReturn;
}

AssetManager.prototype.getTileset = function(setName) {
	return this.tilesets[setName];
}

AssetManager.prototype.getNumAssets = function() {
	return this.imageQueue.length + this.soundQueue.length + this.levelQueue.length;
}

AssetManager.prototype.isDone = function() {
	return (this.imageQueue.length + this.soundQueue.length + this.levelQueue.length == this.successCount + this.errorCount);
}

//Note: When this function is called, the image cache does NOT exist yet.
//	It is actually set in setImage()
AssetManager.prototype.addAnimation = function(img) {
	this.anims[img["source"]] = new Animation(this.cache[img["source"]], img["frames"], img["numCols"], img["frameWidth"], img["frameHeight"], img["speed"], img["loop"], img["offsetX"], img["offsetY"], img["flipOffsetX"]);
}
AssetManager.prototype.addTileset = function(img) {
	this.tilesets[img["source"]] = new TileSet(this.cache[img["source"]], img["width"], img["height"]);
}

AssetManager.prototype.imageAll = function(successCallback, errorCallback, completeCallback) {
	for (var i = 0; i < this.imageQueue.length; i++) {
		var path = this.imageQueue[i]["source"];
		var d = this.imageQueue[i];
		var img = new Image();
		
		img.path = path;
		var that = this;
		
		if(d["type"] == "anim"){
			this.addAnimation(d);
		} 
		else if(d["type"] == "tileset"){
			this.addTileset(d);
		}
		img.addEventListener("load", function() {
				that.cache[this.path] = this;
				if(this.path in that.anims){
					that.anims[this.path].setImage(this);
				}
				else if(this.path in that.tilesets){
					that.tilesets[this.path].setImage(this);
				}
				successCallback(this.path);
				that.successCount++;
				
				if (that.isDone()) {
					completeCallback();
				}
				}, false);
		img.addEventListener("error", function() {
				errorCallback(this.path);
				that.errorCount++;
				if (that.isDone()) {
					completeCallback();
				}
				}, false);
		img.src = path;
		
	}
};
AssetManager.prototype.playSound = function(path) {
	
}
//MODIFIED IMAGEALL FOR SOUND
AssetManager.prototype.soundAll = function(successCallback, errorCallback, completeCallback) {
	for (var i = 0; i < this.soundQueue.length; i++) {
		var path = this.soundQueue[i]["source"];
		var d = this.soundQueue[i];
		var that = this;
		
		this.cache[path] = soundManager.createSound({
			id: path,
			url: path,
			onload: function() {
				that.successCount++;
				successCallback(path);
				if(that.isDone()) {
					completeCallback(path);
				}
				//console.log("Loaded " + path);
			},
			onsuspend: function() {
				//console.log("Fuck?");
				//this.load();
			},
			autoLoad: true,
			multiShot: true
		});

		//console.log("Loading" + path);
		
	}
};

//Name of this function is a relic from a previous project...
AssetManager.prototype.levelAll = function(successCallback, errorCallback, completeCallback) {
	var that = this;
	for (var i = 0; i < this.levelQueue.length; i++) {
		var d = this.levelQueue[i];
		var json = (function(d) {
			var json = null;
			$.ajax({
				'global': false,
				'url': d.source,
				'dataType': "json",
				'success': function(data) {
					successCallback("Level " + d.source);
					that.successCount++;
					var r = new Room(data);	
					r.name = d.name;
					that.rooms[d.id] = r;
					
					if(that.isDone()) {
						completeCallback();
					}
				}
			});
		})(d);
	}
};

AssetManager.prototype.downloadAll = function(successCallback, errorCallback,
		completeCallback) {
	console.log(this.imageQueue);
	if (this.imageQueue.length + this.soundQueue.length + this.levelQueue.length === 0) {
		completeCallback();
	}
	
	var that = this;
	
	soundManager.onready( function() {
		that.soundAll(successCallback, errorCallback, completeCallback);
	});
	
	this.imageAll(successCallback, errorCallback, completeCallback);
	
	this.levelAll(successCallback, errorCallback, completeCallback);
}
