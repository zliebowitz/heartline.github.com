/***************
 * BREAKABLE 
 ***************/

Breakable.prototype = new Entity();
Breakable.constructor = Breakable;

var BREAKABLE_W = 32;
var BREAKABLE_H = 32;
var BREAKABLE_LIFE = 10; //How many hits by goo before being destroyed
var BREAKABLE_NUM_PARTICLES = 20; //How many particles spawned when destroyed

function Breakable(room, x, y) {
	this.type = BREAKABLE;

	this.room = room;
	this.x = x;
	this.y = y;
	this.life = BREAKABLE_LIFE;	
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
	if(other.type === GOO) {
		other.die = true;
		this.life--;
		if(this.life <= 0) {
			this.die = true;
			for(var i = 0; i < BREAKABLE_NUM_PARTICLES; i++) {
				entityManager.add(new BreakableParticle(this.room, this.x + Math.random() * this.w, this.y + Math.random() * this.h));
			}
		}
	}
};

/*
   BreakableParticle
  */
BreakableParticle.prototype = new Entity();
BreakableParticle.constructor = BreakableParticle;

var BREAKABLE_PARTICLE_LIFETIME = 30;

function BreakableParticle(room, x, y) {
	this.room = room;
	this.x = x;
	this.y = y;
	this.dy = -5 * Math.random();
	this.dx = (Math.random() - 0.5) * 3;
	this.type = BREAK_PARTICLE;
	this.anim = assetManager.getAnim("gfx/misc/breakable_particle.png");
	this.solid = false;
	this.palpable = false;
	this.lifeTimer = FIRE_PARTICLE_LIFETIME;
}
BreakableParticle.prototype.update = function() {
	this.dy += GRAVITY;	
	this.x += this.dx;
	this.y += this.dy;

	this.lifeTimer -= 1;
	if(this.lifeTimer <= 0) {
		this.die = true;
	}
};
BreakableParticle.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
};
