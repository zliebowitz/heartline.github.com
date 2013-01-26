//Used for handling cutscenes
var CUTSCENE_TEXT = 0;
var CUTSCENE_SET_CAMERA = 1;
var CUTSCENE_ZOOM = 2;
var CUTSCENE_SET_ZOOM = 4;
var CUTSCENE_PAN = 5;
var CUTSCENE_BREAK = 6;
var CUTSCENE_NEXT_LEVEL = 7;
var CUTSCENE_FADE_MUSIC_IN = 8;
var CUTSCENE_FADE_MUSIC_OUT = 9;
var CUTSCENE_PAN_TO_BOSS = 10;
var CUTSCENE_PAN_TO_HERO = 11;
var CUTSCENE_WAIT = 12;

function Cutscene(roomCutscenes) {
	this.index = 0;
	this.startTimer = 0; //keep track at what timer started at.
	this.timer = 0;
	if(roomCutscenes === undefined)
		this.cutscenes = new Array();
	else
		this.cutscenes = roomCutscenes;
	
	this.textIndex = 0;
	this.dialog = new Dialog(this.cutscenes);
	this.next(true);
	this.Atimer = 0;
	this.which = false;
}

Cutscene.prototype.step = function() {
	if(this.timer > 0) {
		this.timer --;
		
		var scene = this.cutscenes[this.index];
		switch(scene.type) {
			case CUTSCENE_ZOOM:
				var factor = (this.startTimer - this.timer) / this.startTimer;
				camera.setZoom(factor * (scene.value - scene.startZoom) + scene.startZoom);
			
				if(this.timer === 0)
					this.next();
				break;
			case CUTSCENE_PAN:
				//console.log(scene.value_x + " , " + scene.value_y);
				var factor = (this.startTimer - this.timer) / this.startTimer;
				camera.x = (factor * (scene.value_x - scene.startX) + scene.startX);
				camera.y = (factor * (scene.value_y - scene.startY) + scene.startY);
			
				if(this.timer === 0)
					this.next();
				break;
			case CUTSCENE_WAIT:
				if(this.timer === 0)
					this.next();
				break;
		}
		
		
		
		
	}
};
Cutscene.prototype.draw = function(context) {
	this.dialog.draw(context);
	
	if(this.cutscenes[this.index].type === CUTSCENE_NEXT_LEVEL) {
		this.Atimer++;
		if(this.Atimer == 8){
			this.Atimer = 0;
			this.which = !this.which;
		}
		if(this.which)
			context.drawImage(assetManager.getAsset("gfx/eyesopen1.png"), 0, 0);
		else
			context.drawImage(assetManager.getAsset("gfx/eyesopen2.png"), 0, 0);
			
	}
}

Cutscene.prototype.next = function(start) {
	//Make sure that all the things are running correctly.
	if(this.timer > 0 || this.cutscenes.length === 0)
		return;
	if(!start) {
		if(this.index < this.cutscenes.length) {
			this.index++;
			this.dialog.next();
		}
		else {
			return;
		}
	}
	
	if(this.index === this.cutscenes.length) {
		return;
	}
	switch(this.cutscenes[this.index].type) {
		case CUTSCENE_SET_CAMERA:
			camera.x = this.cutscenes[this.index].value_x;
			camera.y = this.cutscenes[this.index].value_y;
			this.next();
			break;
		case CUTSCENE_SET_ZOOM:
			camera.setZoom(this.cutscenes[this.index].value);
			this.next();
			break;
		case CUTSCENE_FADE_MUSIC_IN:
			assetManager.getAsset("sfx/boss1.ogg").play( {loops: 999});;
			this.next();
			break;
		case CUTSCENE_FADE_MUSIC_OUT:
			assetManager.getAsset("sfx/boss1.ogg").stop();
			this.next();
			break;
		case CUTSCENE_ZOOM:
			this.cutscenes[this.index].startZoom = camera.zoom;
			break;
		case CUTSCENE_PAN:
			this.cutscenes[this.index].startX = camera.x;
			this.cutscenes[this.index].startY = camera.y;
			break;
		case CUTSCENE_PAN_TO_BOSS:
			this.cutscenes[this.index].startX = camera.x;
			this.cutscenes[this.index].startY = camera.y;
			this.cutscenes[this.index].type = CUTSCENE_PAN;
			
			this.cutscenes[this.index].value_x = boss.x+boss.w/2 - (W/camera.zoom) / 2;
			this.cutscenes[this.index].value_y = boss.y+boss.h/2 - (H/camera.zoom) / 2;
			break;
		case CUTSCENE_WAIT:
			break;
			
	}
	
	if(this.cutscenes[this.index] !== undefined) {
	if(this.cutscenes[this.index].time !== undefined) {
		this.timer = this.cutscenes[this.index].time;
		this.startTimer = this.cutscenes[this.index].time;
	}}
};

//Either cutscene is over, or we're at a break in the cutscene for the room.
Cutscene.prototype.done = function() {
	if(this.index >= this.cutscenes.length)
		return true;
	if(this.cutscenes[this.index].type === CUTSCENE_BREAK)
		return true;
	return false;
};

Cutscene.prototype.finished = function() {
	if(this.index >= this.cutscenes.length) {
		return true;
	}
	return false;
};