/***************
 * HEART 
 ***************/

Heart.prototype = new Entity();
Heart.constructor = Heart;

var HEART_W = 16;
var HEART_H = 16;
var HEART_FRICTION = 0.8;

function Heart(room, x, y) {
	this.type = HEART;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = HEART_W;
	this.h = HEART_H;  
	
	this.isHeld = false;
	this.landTimer = 0;
	this.landedEntity = false;
	
	this.anim = assetManager.getAnim("gfx/misc/heart.png");
} 

Heart.prototype.landFunction = function() {
	this.dx*=HEART_FRICTION;
};

Heart.prototype.update = function() {
	if(!this.isHeld) {
		//Gravity
		this.dy+=GRAVITY;
		
		//Kinematics
		this.y+=this.dy;
		this.x+=this.dx;
	}
	//Collision/Collision Flags
	this.landed = false;

	this.collideRoom();

	//Friction
	if(this.landed) {
		this.landFunction();
	}

	//Update animation statuses.

	this.landedEntity = false;
};
Heart.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Heart.prototype.collide = function(other) {
	if(other.type === PLAYER) {
		if(other.held === null && !this.isHeld) {
			other.held = this;
			this.isHeld = true;
		}
	}
};

