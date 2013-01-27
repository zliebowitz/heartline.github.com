/***************
 * DOOR 
 ***************/

Door.prototype = new Entity();
Door.constructor = Door;

var DOOR_W = 32;
var DOOR_H = 32;

function Door(room, x, y) {
	this.type = DOOR;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = DOOR_W;
	this.h = DOOR_H;  
	this.solid = false;	
	this.anim = assetManager.getAnim("gfx/misc/door.png");
	this.anim.reverse = true;
} 
Door.prototype.open = function() {
	this.anim.reverse = false;
};
Door.prototype.close = function() {
	this.anim.reverse = true;
};
Door.prototype.landFunction = function() {
};

Door.prototype.update = function() {
};
Door.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Door.prototype.collide = function(other) {
	/// DEBUG CODE
	if(other.type === PLAYER) {
		this.open();
	}
	else if(other.type === GOO) {
		this.close();
	}
}
