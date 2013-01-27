/***************
 * PLAYER
 ***************/

Player.prototype = new Entity();
Player.constructor = Player;
var PLAYER_H = 20;
var PLAYER_W = 20;
var PLAYER_ACCEL = 2;
var PLAYER_MIN_SPEED = 0.2;
var PLAYER_WALK_SPEED = 2.3;
var PLAYER_RUN_SPEED = 9;
var PLAYER_WALK_SPEED = 2.3;
var PLAYER_RUN_SPEED = 8;
var PLAYER_MAX_HEALTH = 1000;
var PLAYER_GOO_COST = 9;
var PLAYER_HEART_REGEN = 6;
var PLAYER_FRICTION = 0.7;
var PLAYER_FIRE_DAMAGE = 18;
var PLAYER_DEATH_TIME = 50; //frames before respawn
var PLAYER_GRIEVE_RATE = 6; //Damage taken if partner is dead.
var GRAVITY_CARRY = 0.73;	//gravity is higher while carrying an item (realism is for pansies)

var PLAYER_HURT_CD = 25; //Invul frames after getting hurt

var PlayerStatus = {
	IDLE: 0,
	JUMP: 1,
	FALL: 2,
	RUN: 3
};
function Player(room, x, y) {
	this.type = PLAYER;

	this.health = PLAYER_MAX_HEALTH;
	this.room = room;
	this.x = x;
	this.y = y;
	this.held = null;
	this.carry = null;
	this.w = PLAYER_W;
	this.h = PLAYER_H;
	this.deathTimer = 0;
	this.controller - null;

	this.status = PlayerStatus.IDLE;
	this.facingLeft = false;
	this.currJumpSpeed = 0;
	this.landedEntity = false;
	this.blockingEntity = false;
	this.movingLeft = false;
	this.movingRight = false;
	this.dead = false;
	this.touchingGrate = false;	
	this.doorID = -1;
	
	this.runAnim = assetManager.getAnim("gfx/player/walk.png");
	this.idleAnim = assetManager.getAnim("gfx/player/stand.png");
	this.jumpAnim = assetManager.getAnim("gfx/player/jump.png");
	this.fallAnim = assetManager.getAnim("gfx/player/fall.png");
	
	this.runAnimC = assetManager.getAnim("gfx/player/walk_carry.png");
	this.idleAnimC = assetManager.getAnim("gfx/player/stand_carry.png");
	this.jumpAnimC = assetManager.getAnim("gfx/player/jump_carry.png");
	this.fallAnimC = assetManager.getAnim("gfx/player/fall_carry.png");
} 
Player.prototype.moveLeft = function() {
	this.dx -= PLAYER_ACCEL;
	if(this.dx < -PLAYER_WALK_SPEED)
		this.dx = -PLAYER_WALK_SPEED;
	this.movingRight = true;
	this.facingLeft = true;
};
Player.prototype.moveRight = function() {
	this.dx += PLAYER_ACCEL;
	if(this.dx > PLAYER_WALK_SPEED)
		this.dx = PLAYER_WALK_SPEED;
	this.movingLeft = true;
	this.facingLeft = false;

};
Player.prototype.jumpPress = function() {
	if(this.landed || this.landedEntity)
	{
		this.status = PlayerStatus.JUMP;

		this.dy = -10;
		this.landed = false;
		this.jumping = true;
		this.jumpAnim.reset();
	}
};
Player.prototype.jumpRelease = function() {
	if(this.jumping && !(this.landed || this.landedEntity)) {
		if(this.dy < 0)
			this.dy = this.dy/2;
	}
};

Player.prototype.shoot = function() {
	var dir = this.controller.getDir();	
	var yc = dir.y;
	var xc = dir.x;
	if(xc === 0 && yc === 0)
	{
		xc = this.facingLeft ? -1 : 1;
	}
	this.hurt(PLAYER_GOO_COST);
	entityManager.add(new Goo(this.room, this.x+5, this.y+5, 
				 xc * 10, yc * -10, this));
};
Player.prototype.dropAll = function() {
	if(this.held) {
		this.held.isHeldBy = null;
		this.held = null;
	}
	if(this.carry) {
		this.carry.isHeldBy = null;
		this.carry = null;
	}
};
Player.prototype.throwPress = function() {
	if(this.held && !this.carry) {
		this.carry = this.held;
		this.held = null;
	}
};
Player.prototype.throwRelease = function() {
	if(this.carry) {
		var dir = this.controller.getDir();

		this.carry.isHeldBy = null;
		this.carry.dx = this.dx + dir.x * 5;
		this.carry.dy = this.dy - 5 + dir.y * -3;
		this.carry = null;
	}
};

Player.prototype.hurt = function(amount) {
	if(this.dead)
		return;
	/*
	if(this.hurtTimer>0) {
		//Invul Frames; no damage taken :D
		return false;
		this.dead = false;
		this.deathTimer = 0;
		this.dy = 0;
		this.dx = 0;
		this.health = PLAYER_MAX_HEALTH;

	}
	this.hurtTimer = PLAYER_HURT_CD;
	*/
	this.health-=amount;	
	if(this.health <= 0) {
		this.kill();	
		return true;
	}
	return true;
};
Player.prototype.kill = function() {
	this.health = 0;
	this.dead = true;
	for(var i = 0; i < 20; i++) {
		var rand = Math.random() * 2 * Math.PI;
		var xDir = Math.cos(rand) * 3;
		var yDir = Math.sin(rand) * 3;
		this.deathTimer = PLAYER_DEATH_TIME;
		entityManager.add(new Goo(this.room, this.x+5, this.y+5, 
			 xDir, yDir, this));
		this.dropAll();
	}
};
Player.prototype.landFunction = function() {
	this.dx*=PLAYER_FRICTION;
	this.jumping = false;

	if(this.dx === 0 && this.status != PlayerStatus.IDLE)
		this.status = PlayerStatus.IDLE;
	else if(this.dx !== 0 && this.status != PlayerStatus.RUN){
		this.status = PlayerStatus.RUN;
		this.runAnim.reset();
	}
};

Player.prototype.respawnAt = function(otherPlayer) {
	this.dead = false;
	this.dy = 0;
	this.dx = 0;
	this.health = PLAYER_MAX_HEALTH;
	this.x = otherPlayer.x;
	this.y = otherPlayer.y;
	this.status = PlayerStatus.IDLE;
	for(var i = 0; i < 16; i++) {
		var angle = 2 * Math.PI * i / 16;
		var dirX = Math.cos(angle);
		var dirY = Math.sin(angle);
		entityManager.add(new Goo(this.room, this.x - dirX * 60, this.y - dirY * 60, dirX * 10, dirY * 10, this));
	}
};

Player.prototype.update = function() {
	if(this.dead) {
		this.deathTimer -= 1;
		return;
	}
	this.controller.poll();
	if(this.controller.getDir().x < 0)
		this.moveLeft();
	else if (this.controller.getDir().x > 0)
		this.moveRight();
	
	if (this.controller.getIsShooting())
		this.shoot();

	//Regen Heart
	if(this.held && this.held.type === HEART) {
		this.health += PLAYER_HEART_REGEN;
		if(this.health > PLAYER_MAX_HEALTH) {
			this.health = PLAYER_MAX_HEALTH;
		}
	}


	//Gravity
	if (this.held||this.carry)
		this.dy+=GRAVITY_CARRY;
	else
		this.dy+=GRAVITY;

	//Check if within level bounds
	if(this.x + this.width < 0) {
		this.kill();
	}
	else if(this.x > this.room.width * TILE_SIZE) {
		this.kill();
	}
	else if(this.y > this.room.height * TILE_SIZE) {
		this.kill();
	}
	
	//Kinematics
	this.y+=this.dy;
	this.x+=this.dx;

	//Update held object's position.
	if(this.held) {
		this.held.x = this.x+1;
		this.held.y = this.y+1;
		this.held.dx = this.dx;
		this.held.dy = this.dy;
	}
	else if(this.carry) {
		this.carry.x = this.x+1;
		this.carry.y = this.y - 20;
	}

	//Collision/Collision Flags

	this.landed = false;
	this.collideRoom();

	//Friction
	if(this.landed || this.landedEntity) {
		this.landFunction();
	}
	else if(this.status !== PlayerStatus.JUMP) {
		this.status = PlayerStatus.FALL;
	}
	if(Math.abs(this.dx) < PLAYER_MIN_SPEED)
		this.dx = 0;

	//Update animation statuses.

	if(!this.landed && !this.landedEntity) {
		if(this.status != PlayerStatus.FALL && this.dy > 0){
			//Then we're falling.
			this.status = PlayerStatus.FALL;
			this.fallAnim.reset();
		}
	}
	this.touchingGrate = false;
	this.landedEntity = false;
	this.movingLeft = false;
	this.movingRight = false;
};
Player.prototype.draw = function(context) {
	if(this.dead) {
		return;
	}
	if(this.held) {
		this.held.drawSelf(context);
	} else if(this.carry) {
		this.carry.drawSelf(context);
	}
	switch(this.status) {
		case(PlayerStatus.JUMP):
			if(this.carry) {
				this.jumpAnimC.draw(context, this.x, this.y, this.facingLeft);
			}
			else {
				this.jumpAnim.draw(context, this.x, this.y, this.facingLeft);
			}
			this.jumpAnimC.tick();
			this.jumpAnim.tick();
			break;
		case(PlayerStatus.FALL):
			if(this.carry) {
				this.fallAnimC.draw(context, this.x, this.y, this.facingLeft);
			}
			else {
				this.fallAnim.draw(context, this.x, this.y, this.facingLeft);
			}
			this.fallAnim.tick();
			this.fallAnimC.tick();
			break;
		case(PlayerStatus.IDLE):
			if(this.carry) {
				this.idleAnimC.draw(context,this.x,this.y,this.facingLeft);
			}
			else {
				this.idleAnim.draw(context,this.x,this.y,this.facingLeft);
			}
			break;
		case(PlayerStatus.RUN):
			if(this.carry) {
				this.runAnimC.draw(context, this.x, this.y, this.facingLeft);
			}
			else {
				this.runAnim.draw(context, this.x, this.y, this.facingLeft);
			}
			this.runAnim.tick();
			this.runAnimC.tick();
			break;

	}	

};

Player.prototype.collide = function(other) {
	if(other.type === BREAKABLE) {
		this.collideEntity(other);
	}
	else if(other.type === GRATE) {
		this.touchingGrate = true;
	}
	else if(other.type === FIRE) {
		this.hurt(PLAYER_FIRE_DAMAGE);
	}
	else if(other.type === DOOR) {
		if(this.controller.getDir().y > 0 && this.held && this.held.type === HEART){
			this.doorID = other.doorRoomID;
			other.open();
		}
	}
};

Player.prototype.bind_controller = function(controller) {
	if (this.controller)
		console.error("adding controller on top of other controller");

	this.controller = controller;
	var that = this;
	controller.addEventListener(controller.JUMP_PRESS_EVENT, function() {that.jumpPress()});
	controller.addEventListener(controller.JUMP_RELEASE_EVENT, function() {that.jumpRelease()});
	controller.addEventListener(controller.LIFT_PRESS_EVENT, function() {that.throwPress()});
	controller.addEventListener(controller.LIFT_RELEASE_EVENT, function() {that.throwRelease()});
};

Player.prototype.unbind_controller = function() {
	if (!this.controller)
		console.error("removing nonexistant controller");
	else
	{
		this.controller.detach();
		this.controller = null;
	}
};

