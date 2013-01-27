/***************
 * FIRE 
 ***************/

Fire.prototype = new Entity();
Fire.constructor = Fire;

var FIRE_W = 32;
var FIRE_H = 32;

function Fire(room, x, y) {
	this.type = FIRE;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = FIRE_W;
	this.h = FIRE_H;  
	
	this.anim = assetManager.getAnim("gfx/fire.png");
} 

Fire.prototype.landFunction = function() {
};

Fire.prototype.update = function() {

};
Fire.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Fire.prototype.collide = function(other) {
}
