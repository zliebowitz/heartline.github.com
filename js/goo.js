/***************
 * GOO - Player's projectile
 ***************/

Goo.prototype = new Entity();
Goo.constructor = Goo;

var GOO_RADIUS = 5;
var GOO_FRICTION = 0.8;
var GOO_LIFETIME = 60;

//How much of goo's velocity is transferred to target?
var GOO_PUSHFACTOR = 0.1;
function Goo(room, x, y, dx, dy, owner) {
	this.type = GOO;
	this.owner = owner;
	this.room = room;
	this.x = x;
	this.y = y;
	this.dx = dx + Math.random() - 0.5;
	this.dy = dy + Math.random() - 0.5;
	
	this.w = GOO_RADIUS * 2;
	this.h = GOO_RADIUS * 2;  
	
	this.isHeld = false;
	this.landTimer = 0;
	this.landedEntity = false;
	this.dieTimer = GOO_LIFETIME;
} 

Goo.prototype.landFunction = function() {
	this.dx*=GOO_FRICTION;
	
};

Goo.prototype.update = function() {
	if(!this.isHeld) {
		//Gravity
		this.dy+=GRAVITY/2;
		
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
	if(this.dieTimer > 0) {
		this.dieTimer--;
		if(this.dieTimer <= 0) {
			this.die = true;
		}
	}

	this.landedEntity = false;
};
Goo.prototype.draw = function(context) {
	context.beginPath();
	context.fillStyle = "rgba(30, 30, 255, "+this.dieTimer / (2 * GOO_LIFETIME)+")";
	context.arc(this.x + GOO_RADIUS, 
				this.y + GOO_RADIUS, GOO_RADIUS, 0, 2*Math.PI, false);
	context.closePath();
	context.fill();
};
Goo.prototype.collide = function(other) {
	if(other.type === PLAYER && other !== this.owner) {
		other.dx += this.dx * GOO_PUSHFACTOR;
		other.dy += this.dy * GOO_PUSHFACTOR;
		this.die = true;
	}
};

