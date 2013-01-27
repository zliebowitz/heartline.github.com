/***************
 * FAN 
 ***************/

Fan.prototype = new Entity();
Fan.constructor = Fan;

var FAN_W = 32;
var FAN_H = 32;
var FAN_SPAWN_TIMER = 1;
var FAN_MAX_POWER = 200;
var FAN_POWER_THRESHOLD = 100; //How much power needed to spin
var FAN_GOO_POWER = 50; //How much power one goo gives
var FAN_POWER_UPKEEP = 1; //How much power lost per frame

function Fan(room, x, y) {
	this.type = FAN;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = FAN_W;
	this.h = FAN_H;  
	//this.solid = false;	
	this.spawnTimer = FAN_SPAWN_TIMER;
	this.power = 0;
	this.animOn = assetManager.getAnim("gfx/misc/fan_on.png");
	this.animOff = assetManager.getAnim("gfx/misc/fan_off.png");
} 

Fan.prototype.landFunction = function() {
};

Fan.prototype.update = function() {
	if(this.spawnTimer > 0 && this.power > FAN_POWER_THRESHOLD) {
		this.spawnTimer -= 1;
		if(this.spawnTimer <= 0) {
			this.spawnTimer = FAN_SPAWN_TIMER;
			entityManager.add(new FanParticle(this.room, this.x + Math.random() * this.w, 
										this.y + this.h / 1.5));
		}
	}

	if(this.power > 0) {
		this.power -= FAN_POWER_UPKEEP;
	}
};
Fan.prototype.draw = function(context) {
	if(this.power > FAN_POWER_THRESHOLD) {
		this.animOn.draw(context, this.x, this.y, false);
		this.animOn.tick();
	}
	else
	{
		this.animOff.draw(context, this.x, this.y, false);
	}
};
Fan.prototype.collide = function(other) {
	if(other.type === GOO) {
		this.power += FAN_GOO_POWER;
		if(this.power > FAN_MAX_POWER) {
			this.power = FAN_MAX_POWER;
		}
		other.die = true;
	}
}

/*
   		Fan particle
  */
FanParticle.prototype = new Entity();
FanParticle.constructor = FanParticle;

var FAN_PARTICLE_DRAG = 0.13;
var FAN_PARTICLE_INITIAL_SPEED = -8;
var FAN_PARTICLE_LIFETIME = 65;
var FAN_PUSH_FACTOR = 0.4;
function FanParticle(room, x, y) {
	this.room = room;
	this.x = x;
	this.y = y;
	this.dy = FAN_PARTICLE_INITIAL_SPEED;
	this.type = FAN_PARTICLE;
	//this.solid = false;
	this.lifeTimer = FAN_PARTICLE_LIFETIME;
}
FanParticle.prototype.update = function() {
	this.dy += FAN_PARTICLE_DRAG;	
	this.y += this.dy;
	this.lifeTimer -= 1;
	if(this.lifeTimer <= 0) {
		this.die = true;
	}
};
FanParticle.prototype.draw = function(context) {
	context.strokeStyle = "rgba(255, 255, 255, 100)";
	context.lineWidth = 1;
	context.beginPath();
	context.moveTo(this.x, this.y);
	context.lineTo(this.dx+this.x, this.dy+this.y);
	context.closePath();
	context.stroke();
};
FanParticle.prototype.collide = function(other) {
	if(other.type === PLAYER || other.type === HEART ||
			other.type === GOO) {
		this.die = true;
		if(other.dy > this.dy)
			other.dy += this.dy * FAN_PUSH_FACTOR;
		
	}
	
};
