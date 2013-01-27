/***************
 * FIRE 
 ***************/

Fire.prototype = new Entity();
Fire.constructor = Fire;

var FIRE_W = 32;
var FIRE_H = 32;
var FIRE_SPAWN_MIN = 10;
var FIRE_SPAWN_RANGE = 20;

function Fire(room, x, y) {
	this.type = FIRE;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = FIRE_W;
	this.h = FIRE_H;  
	this.solid = false;	
	this.spawnTimer = FIRE_SPAWN_MIN + Math.random() * FIRE_SPAWN_RANGE;

	this.anim = assetManager.getAnim("gfx/misc/fire.png");
} 

Fire.prototype.landFunction = function() {
};

Fire.prototype.update = function() {
	if(this.spawnTimer > 0) {
		this.spawnTimer -= 1;
		if(this.spawnTimer <= 0) {
			this.spawnTimer = FIRE_SPAWN_MIN + Math.random() * FIRE_SPAWN_RANGE;
			entityManager.add(new FireParticle(this.room, this.x + Math.random() * this.w, 
										this.y + Math.random() * this.h));
			entityManager.add(new Smoke(this.room, this.x + Math.random() * this.w, 
										this.y + Math.random() * this.h, 0, 0));
		}
	}
};
Fire.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Fire.prototype.collide = function(other) {
}

/*
   		Fire particle
  */
FireParticle.prototype = new Entity();
FireParticle.constructor = FireParticle;

var FIRE_PARTICLE_LIFT = 0.07;
var FIRE_PARTICLE_LIFETIME = 50;
function FireParticle(room, x, y) {
	this.room = room;
	this.x = x;
	this.y = y;

	this.type = FIRE_PARTICLE;
	this.anim = assetManager.getAnim("gfx/misc/flare_particle.png");
	this.solid = false;
	this.palpable = false;
	this.lifeTimer = FIRE_PARTICLE_LIFETIME;
}
FireParticle.prototype.update = function() {
	this.dy -= FIRE_PARTICLE_LIFT;	
	this.y += this.dy;
	this.lifeTimer -= 1;
	if(this.lifeTimer <= 0) {
		this.die = true;
	}
};
FireParticle.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
