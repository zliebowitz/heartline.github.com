/***************
 * BREAKABLE 
 ***************/

Breakable.prototype = new Entity();
Breakable.constructor = Breakable;

var BREAKABLE_W = 32;
var BREAKABLE_H = 32;

function Breakable(room, x, y) {
	this.type = BREAKABLE;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = BREAKABLE_W;
	this.h = BREAKABLE_H;  
	this.solid = true;
	this.anim = assetManager.getAnim("gfx/misc/destroyable_block.png");
} 

Breakable.prototype.landFunction = function() {
};

Breakable.prototype.update = function() {
};
Breakable.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
};
Breakable.prototype.collide = function(other) {
};
