/***************
 * GRATE 
 ***************/

Grate.prototype = new Entity();
Grate.constructor = Grate;

var GRATE_W = 32;
var GRATE_H = 32;

function Grate(room, x, y) {
	this.type = GRATE;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = GRATE_W;
	this.h = GRATE_H;  
	this.solid = true;
	this.anim = assetManager.getAnim("gfx/misc/grating_block.png");
} 

Grate.prototype.landFunction = function() {
};

Grate.prototype.update = function() {
};
Grate.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
};
Grate.prototype.collide = function(other) {
};
