/***************
 * GOAL 
 ***************/

Goal.prototype = new Entity();
Goal.constructor = Goal;

var GOAL_W = 32;
var GOAL_H = 32;
var GOAL_SPAWN_MIN = 180;
var GOAL_SPAWN_RANGE = 100;

function Goal(room, x, y) {
	this.type = GOAL;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = GOAL_W;
	this.h = GOAL_H;  
	this.solid = false;	

	this.spawnTimer = GOAL_SPAWN_MIN + Math.random() * GOAL_SPAWN_RANGE;

	this.anim = assetManager.getAnim("gfx/misc/goal.png");
} 

Goal.prototype.landFunction = function() {
};

Goal.prototype.update = function() {
	if(this.spawnTimer > 0) {
		this.spawnTimer -= 1;
		if(this.spawnTimer <= 0) {
			this.spawnTimer = GOAL_SPAWN_MIN + Math.random() * GOAL_SPAWN_RANGE;
			entityManager.add(new GoalParticle(this.room, this.x + Math.random() * this.w, 
										this.y + Math.random() * this.h));
		}
	}
};
Goal.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Goal.prototype.collide = function(other) {
}

/*
   		Goal particle
  */
GoalParticle.prototype = new Entity();
GoalParticle.constructor = GoalParticle;

var GOAL_PARTICLE_LIFT = 0.07;
var GOAL_PARTICLE_LIFETIME = 9*3;
function GoalParticle(room, x, y) {
	this.room = room;
	this.x = x;
	this.y = y;

	this.type = GOAL_PARTICLE;
	this.anim = assetManager.getAnim("gfx/misc/sparkle_particle.png");
	this.solid = false;
	this.palpable = false;
	this.lifeTimer = GOAL_PARTICLE_LIFETIME;
}
GoalParticle.prototype.update = function() {
	this.lifeTimer -= 1;
	if(this.lifeTimer <= 0) {
		this.die = true;
	}
};
GoalParticle.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
