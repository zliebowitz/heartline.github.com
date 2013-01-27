/***************
 * GOO - Player's projectile
 ***************/

Goo.prototype = new Entity();
Goo.constructor = Goo;

var GOO_RADIUS = 5;
var GOO_FRICTION = 0.8;

function Goo(room, x, y) {
	this.type = GOO;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = GOO_RADIUS;
	this.h = GOO_RADIUS;  
	
	this.isHeld = false;
	this.landTimer = 0;
	this.landedEntity = false;
} 

Goo.prototype.landFunction = function() {
	this.dx*=GOO_FRICTION;
};

Goo.prototype.update = function() {
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


	this.landedEntity = false;
};
Goo.prototype.draw = function(context) {
	context.beginPath();
	context.arc(this.x, this.y, GOO_RADIUS, 0, 2*Math.PI, false);
	context.closePath();
};
Goo.prototype.collide = function(other) {
};

