/***************
 * GOAL 
 ***************/

Goal.prototype = new Entity();
Goal.constructor = Goal;

var GOAL_W = 32;
var GOAL_H = 32;
var GOAL_SPAWN_MIN = 180;
var GOAL_SPAWN_RANGE = 100;
var GOAL_WIN_ANIMATION_TIME = 40;

function Goal(room, x, y) {
	this.type = GOAL;

	this.room = room;
	this.x = x;
	this.y = y;
	
	this.w = GOAL_W;
	this.h = GOAL_H;  
	this.solid = false;	
	this.winTimer = 0;
	this.won = false;
	this.spawnTimer = GOAL_SPAWN_MIN + Math.random() * GOAL_SPAWN_RANGE;
	this.winConditionsMet = 0;
	this.anim = assetManager.getAnim("gfx/misc/goal.png");
} 

Goal.prototype.landFunction = function() {
};

Goal.prototype.update = function() {
	if(this.won) {
		return;
	}
	if(this.winTimer > 0) {
		this.winTimer--;

		if(this.winTimer <= 0)
			this.won = true;
		return;
	}
	if(this.spawnTimer > 0) {
		this.spawnTimer -= 1;
		if(this.spawnTimer <= 0) {
			this.spawnTimer = GOAL_SPAWN_MIN + Math.random() * GOAL_SPAWN_RANGE;
			entityManager.add(new GoalParticle(this.room, this.x + Math.random() * this.w, 
										this.y + Math.random() * this.h));
		}
	}
	// 2 players + 1 heart = 3 win conditions
	if(this.winConditionsMet === 3 && this.winTimer === 0 && !this.won) { 
		this.winTimer = GOAL_WIN_ANIMATION_TIME;	
		for(var i = 0; i < 30; i++) {
			var ang = Math.PI * 2 * i / 30;
			var dirX = Math.cos(ang);
			var dirY = Math.sin(ang);
			var particle = new GoalParticle(this.room, this.x + 16, this.y + 16 );
			particle.dx = dirX * 3;
			particle.dy = dirY * 3;
			entityManager.add(particle);
		}
	}
	this.winConditionsMet= 0;
};
Goal.prototype.draw = function(context) {
	if(this.winTimer > 0 || this.won) {
		context.globalAlpha = 1.0 - (GOAL_WIN_ANIMATION_TIME - this.winTimer ) / GOAL_WIN_ANIMATION_TIME;
		this.anim.draw(context, this.x, this.y, false);
		this.anim.tick();
		context.globalAlpha = 1.0;
		return;
	}
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
Goal.prototype.collide = function(other) {
	if(other.type === PLAYER) {
		this.winConditionsMet++;
		if(other.held && other.held.type === HEART) {
			this.winConditionsMet++;
		}
	}	
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
	this.dx = 0;
	this.dy = 0;
	this.type = GOAL_PARTICLE;
	this.anim = assetManager.getAnim("gfx/misc/sparkle_particle.png");
	this.solid = false;
	this.palpable = false;
	this.lifeTimer = GOAL_PARTICLE_LIFETIME;
}
GoalParticle.prototype.update = function() {
	this.x += this.dx;
	this.y += this.dy;
	this.lifeTimer -= 1;
	if(this.lifeTimer <= 0) {
		this.die = true;
	}
};
GoalParticle.prototype.draw = function(context) {
	this.anim.draw(context, this.x, this.y, false);
	this.anim.tick();
};
