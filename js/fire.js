/***************
 * FIRE 
 ***************/

Fire.prototype = new Entity();
Fire.constructor = Fire;

var FIRE_W = 32;
var FIRE_H = 32;
var FIRE_SPAWN_MIN = 100;
var FIRE_SPAWN_RANGE = 50;

function Fire(room, x, y) {
	this.type = FIRE;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = FIRE_W;
	this.h = FIRE_H;  
	
	this.spawnTimer = FIRE_SPAWN_MIN + Math.random() * FIRE_SPAWN_RANGE;

	this.anim = assetManager.getAnim("gfx/misc/fire.png");
} 

Fire.prototype.landFunction = function() {
};

Fire.prototype.update = function() {
	if(spawnTimer > 0) {
		spawnTimer -= 1;
		if(spawnTimer <= 0) {
			spawnTimer = FIRE_SPAWN_MIN + Math.random() * FIRE_SPAWN_RANGE;
			entityManager.add(new FireParticle(this.room, this.x + Math.random() * this.w, this.y));
		}
	}
};
Fire.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Fire.prototype.collide = function(other) {
}

FireParticle.prototype = new Entity();
FireParticle.constructor = FireParticle;

function FireParticle(room, x, y) {
	this.anim = assetManager.getAnim("gfx/misc/flare_particle.png");
	this.solid = false;
	this.palpable = false;
}
FireParticle.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
