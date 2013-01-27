/***************
 * PLAYER
 ***************/

Player.prototype = new Entity();
Player.constructor = Player;
var PLAYER_H = 20;
var PLAYER_W = 20;
var PLAYER_ACCEL = 2;
var PLAYER_MIN_SPEED = 0.2;
var PLAYER_WALK_SPEED = 2;
var PLAYER_RUN_SPEED = 8;
var PLAYER_MAX_HEALTH = 100;
var PLAYER_FRICTION = 0.7;

var PLAYER_HURT_CD = 25; //Invul frames after getting hurt

var PlayerStatus = {
	IDLE: 0,
	JUMP: 1,
	FALL: 2,
	RUN: 3,
	LANDING: 4
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

	this.status = PlayerStatus.IDLE;
	this.facingLeft = false;
	this.currJumpSpeed = 0;
	this.landTimer = 0;
	this.landedEntity = false;
	this.blockingEntity = false;
	this.movingLeft = false;
	this.movingRight = false;
	this.dead = false;
	
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
	if(this.landed)
	{
		this.status = PlayerStatus.JUMP;

		this.dy = -10;
		this.landed = false;
		this.jumping = true;
		this.jumpAnim.reset();
	}
};
Player.prototype.jumpRelease = function() {
	if(this.jumping && !this.landed) {
		if(this.dy < 0)
			this.dy = this.dy/2;
	}
};
Player.prototype.throwPress = function() {
	console.log("thorwpress");
	if(this.held && !this.carry) {
		this.carry = this.held;
		this.held = null;
	}
};
Player.prototype.throwRelease = function() {
	console.log("throwrelase");
	if(this.carry) {
		this.carry.isHeld = false;
		this.carry.dx = this.dx + (this.facingLeft ? -5 : 5);
		this.carry.dy = this.dy - 5;
		this.carry = null;
	}
};

//Maybe pass damage to this function later
Player.prototype.hurt = function(amount) {
	if(this.dead)
		return;
	if(this.hurtTimer>0) {
		//Invul Frames; no damage taken :D
		return false;
	}
	else {
		//soundManager.play("sfx/player_hurt.wav");
		//assetManager.getAsset("sfx/player_hurt.wav").play();
		this.hurtTimer = PLAYER_HURT_CD;
		this.health-=amount;	
		if(this.health <= 0) {
			this.dead = true;
			return true;
		}

		if(this.facingLeft) {
			this.dx = 4;
		}
		else {
			this.dx = -4;
		}
		this.dy = -4;
		return true;
	}
};

Player.prototype.landFunction = function() {
	this.dx*=PLAYER_FRICTION;
	this.jumping = false;

	if(this.status === PlayerStatus.JUMP) {
		this.status = PlayerStatus.LANDING;
		this.landTimer = 5;
	}
	if(this.blocking || this.blockingEntity)
		this.status = PlayerStatus.BLOCK;
	else if(this.attackTimer > 0) {
		if(this.status === PlayerStatus.JUMP_ATTACK) {
			this.attackTimer = 0;
		}
	}
	else if(this.landTimer > 0) {
		this.landTimer--;
	}
	else if(this.dx === 0 && this.status != PlayerStatus.IDLE)
		this.status = PlayerStatus.IDLE;
	else if(this.dx !== 0 && this.status != PlayerStatus.RUN){
		this.status = PlayerStatus.RUN;
		this.runAnim.reset();
	}
};

Player.prototype.update = function() {
	//Gravity
	this.dy+=GRAVITY;
	
	//Kinematics
	this.y+=this.dy;
	this.x+=this.dx;

	//Update held object's position.
	if(this.held) {
		this.held.x = this.x+1;
		this.held.y = this.y+1;
	}
	else if(this.carry) {
		this.carry.x = this.x+1;
		this.carry.y = this.y - 20;
	}

	//Collision/Collision Flags
	this.landed = false;

	this.collideRoom();

	//Friction
	if(this.landed) {
		this.landFunction();
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
	this.landedEntity = false;
	this.blockingEntity = this.blocking;
	this.blocking = false;
	this.movingLeft = false;
	this.movingRight = false;
};
Player.prototype.draw = function(context) {
	if(this.dead) {
		this.deathAnim.draw(context, this.x, this.y, this.facingLeft);
		this.deathAnim.tick();
		return;
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
};

