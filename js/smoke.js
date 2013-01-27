/***************
 * SMOKE 
 ***************/

Smoke.prototype = new Entity();
Smoke.constructor = Smoke;

var SMOKE_WIDTH = 32;
var SMOKE_HEIGHT = 32;
var SMOKE_LIFETIME = 50;
var SMOKE_AIR_LIFT = 0.09;
var SMOKE_PUSHEDFACTOR = 0.01;
function Smoke(room, x, y, dx, dy) {
	this.type = SMOKE;
	this.room = room;
	this.x = x;
	this.y = y;
	this.dx = dx + Math.random() - 0.5;
	this.dy = dy + Math.random() - 0.5;
	
	this.w = SMOKE_WIDTH;
	this.h = SMOKE_HEIGHT;
	
	this.isHeld = false;
	this.solid = false;
	this.palpable = false;
	this.landTimer = 0;
	this.landedEntity = false;
	this.dieTimer = SMOKE_LIFETIME;
	this.anim = assetManager.getAnim ("gfx/misc/smoke_particle.png");
} 

Smoke.prototype.landFunction = function() {
	
};

Smoke.prototype.update = function() {
	//Gravity
	this.dy -= SMOKE_AIR_LIFT;
	//Kinematics
	this.y+=this.dy;
	this.x+=this.dx;
	//Collision/Collision Flags

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
};
Smoke.prototype.draw = function(context) {
	context.globalAlpha = this.dieTimer / SMOKE_LIFETIME;
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
	context.globalAlpha = 1.0;
};
Smoke.prototype.collide = function(other) {
};

