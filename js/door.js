/***************
 * DOOR 
 ***************/

Door.prototype = new Entity();
Door.constructor = Door;

var DOOR_W = 32;
var DOOR_H = 32;
var DOOR_SPARKLE_SPAWN_MIN = 10;
var DOOR_SPARKLE_SPAWN_MAX = 30;

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
	
	this.sparkleTimer = DOOR_SPARKLE_SPAWN_MIN;
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
	if(this.doorIsNew){
		this.sparkleTimer--;
		if(this.sparkleTimer <= 0){
			this.sparkleTimer = DOOR_SPARKLE_SPAWN_MIN + Math.random() * DOOR_SPARKLE_SPAWN_MAX;
			entityManager.add(new GoalParticle(this.room,
				this.x + Math.random() * this.w, 
				this.y + Math.random() * this.h));
		}
	}
};
Door.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
	if(this.time) {
		context.font = "10pt Disposable";
		context.fillStyle = "black";
		context.fillText("" + (this.time / 50), this.x, this.y);
	}
};
Door.prototype.collide = function(other) {
	/// DEBUG CODE
	//if(other.type === PLAYER) {
	//	this.open();
	//}
	//else if(other.type === GOO) {
	//	this.close();
	//}
}
