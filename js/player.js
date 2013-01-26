/***************
 * PLAYER
***************/

Player.prototype = new Entity();
Player.constructor = Player;
var PLAYER_H = 82;
var PLAYER_W = 58;
var PLAYER_ACCEL = 2;
var PLAYER_MIN_SPEED = 0.2;
var PLAYER_WALK_SPEED = 2;
var PLAYER_RUN_SPEED = 8;
var PLAYER_ROLL_SPEED = 7;

//Health in number of half hearts.
var PLAYER_MAX_HEALTH = 20;
var PLAYER_FRICTION = 0.7;
var PLAYER_ROLL_FRAMES = 30;
var PLAYER_ROLL_CD = 6;

var PLAYER_HURT_CD = 25; //Invul frames after getting hurt

var PLAYER_MELEE_DAMAGE = 12;
var PLAYER_ATTACK_CD = 15; //Bad naming scheme, better keep it.
var PLAYER_ATTACK_DELAY = 10;



var PLAYER_DEAD_SPOT_X = 400-PLAYER_W/2;
var PLAYER_DEAD_SPOT_Y = 380;

var PlayerStatus = {
	IDLE: 0,
	RUN_ATTACK: 1,
	JUMP: 2,
	RUN: 3,
	BLOCK: 4,
	LANDING: 5,
	JUMP_ATTACK: 6,
	STAND_ATTACK: 7
};
function Player(room, x, y) {
	this.type = PLAYER;
	
	this.health = PLAYER_MAX_HEALTH;
	this.room = room;
	this.x = x;
	this.y = y;

	this.w = PLAYER_W;
	this.h = PLAYER_H;  
	this.runAnim = assetManager.getAnim("gfx/walk.png");
	this.idleAnim = assetManager.getAnim("gfx/stand.png");
	//this.runAttackAnim = assetManager.getAnim("gfx/hero_running_strike.png");
	//this.jumpAnim = assetManager.getAnim("gfx/hero_jumping.png");
	//this.jumpAttackAnim = assetManager.getAnim("gfx/hero_jump_attack.png");
	//this.standAttackAnim = assetManager.getAnim("gfx/hero_standing_strike.png");
	//this.blockAnim = assetManager.getAnim("gfx/hero_block.png");
	
	//this.deathAnim = assetManager.getAnim("gfx/hero_defeated.png");
	
	this.status = PlayerStatus.IDLE;
	this.facingLeft = false;
	this.blocking = false;
	this.hurtTimer = 0;
	this.attackTimer = 0;
	this.currJumpSpeed = 0;
	this.landTimer = 0;
	this.landedEntity = false;
	this.blockingEntity = false;
	this.movingLeft = false;
	this.movingRight = false;
	this.dead = false;
} //so many flags, delicious spaghetti code. gotta love time constraints

Player.prototype.moveToDeadSpot = function() {
	var diffX = PLAYER_DEAD_SPOT_X - this.x;
	var diffY = PLAYER_DEAD_SPOT_Y - this.y;
	
	this.x += diffX / 80;
	this.y += diffY / 80;
}
Player.prototype.moveLeft = function() {
	if(this.attackTimer === 0) {
		if(!this.blocking)
			this.dx -= PLAYER_ACCEL;
		if(this.dx < -PLAYER_WALK_SPEED)
			this.dx = -PLAYER_WALK_SPEED;
		this.movingRight = true;
	}
	this.facingLeft = true;
}
Player.prototype.moveRight = function() {
	if(this.attackTimer === 0) {
		if(!this.blocking)
			this.dx += PLAYER_ACCEL;
		if(this.dx > PLAYER_WALK_SPEED)
			this.dx = PLAYER_WALK_SPEED;
		this.movingLeft = true;
	}
	this.facingLeft = false;
	
}
Player.prototype.block = function() {
	if(this.attackTimer === 0){
		this.blocking = true;
	}
	if(this.attackTimer === 0) {
		this.blockingEntity = true;
	}
}
Player.prototype.jumpPress = function() {
	if(this.landed)
	{
		this.status = PlayerStatus.JUMP;
		
		this.dy = -15;
		this.landed = false;
		this.jumping = true;
		this.jumpAnim.reset();
	}
}
Player.prototype.jumpRelease = function() {
	if(this.jumping && !this.landed) {
		if(this.dy < 0)
			this.dy = this.dy/2;
	}
}
Player.prototype.attack = function() {
	if(this.attackTimer === 0 && !this.blocking) {
		if(this.facingLeft) {
			entityManager.add(new PlayerAttack(this.room, this.x-25, this.y-15, this));
		}
		else {
			entityManager.add(new PlayerAttack(this.room, this.x+10, this.y-15, this));
		}
		this.attackTimer = PLAYER_ATTACK_CD;
		if(this.status === PlayerStatus.RUN && (this.movingLeft || this.movingRight)) {
			this.status = PlayerStatus.RUN_ATTACK;
			this.runAttackAnim.reset();
		} else if(this.status === PlayerStatus.JUMP) {
			this.status = PlayerStatus.JUMP_ATTACK;
			this.jumpAttackAnim.reset();
		} else {
			this.status = PlayerStatus.STAND_ATTACK;
			this.standAttackAnim.reset();
		}
		
	}
}

//Maybe pass damage to this function later
Player.prototype.hurt = function(amount) {
	if(this.dead)
		return;
	if(this.hurtTimer>0) {
		//Invul Frames; no damage taken :D
		return false;
	}
	else {
		soundManager.play("sfx/player_hurt.wav");
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
}

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
}

Player.prototype.update = function() {
	//Momentum from attacking while moving
	if(!this.dead && this.attackTimer > 0) {
		this.attackTimer--;
		if(this.status === PlayerStatus.RUN_ATTACK) {
			if(this.facingLeft)
				this.dx = -PLAYER_WALK_SPEED;
			else
				this.dx = PLAYER_WALK_SPEED;
		}
		if(this.attackTimer === 0 && this.status === PlayerStatus.JUMP_ATTACK) {
			if(!this.landed) {
				this.status = PlayerStatus.JUMP;
			}
		}
	}
	
	//Gravity
	this.dy+=GRAVITY;
	//Kinematics
	this.y+=this.dy;
	this.x+=this.dx;
	
	//Collision/Collision Flags
	this.landed = false;
	
	this.collideRoom();
	
	
	
	//Friction
	if(this.landed) {
		this.landFunction();
	}
	if(Math.abs(this.dx) < PLAYER_MIN_SPEED)
		this.dx = 0;
	
	if(this.hurtTimer > 0 ){
		this.hurtTimer--;
	}
	
	
	//Update animation statuses.
	
	
	if(!this.landed && !this.landedEntity) {
		if(this.status != PlayerStatus.JUMP && this.status != PlayerStatus.JUMP_ATTACK){
			//Then we're falling.
			if(!this.blocking)
			{
				this.status = PlayerStatus.JUMP;
				this.jumpAnim.reset();
			}
		}
	}
	this.landedEntity = false;
	this.blockingEntity = this.blocking;
	this.blocking = false;
	this.movingLeft = false;
	this.movingRight = false;
}
Player.prototype.draw = function(context) {
	if(this.dead) {
		this.deathAnim.draw(context, this.x, this.y, this.facingLeft);
		this.deathAnim.tick();
		return;
	}
	
	switch(this.status) {
		case(PlayerStatus.JUMP):
			this.jumpAnim.draw(context, this.x, this.y, this.facingLeft);
			if(this.jumpAnim.frame < this.jumpAnim.length-2) {
				this.jumpAnim.tick();
			}
			break;
		case(PlayerStatus.LANDING):
			this.jumpAnim.draw(context, this.x, this.y, this.facingLeft);
			this.jumpAnim.timer = this.jumpAnim.speed;
			this.jumpAnim.tick();
			
			break;
		case(PlayerStatus.IDLE):
			this.idleAnim.draw(context,this.x,this.y,this.facingLeft);
			break;
		case(PlayerStatus.BLOCK):
			this.blockAnim.draw(context, this.x, this.y, this.facingLeft);
			break;
		case(PlayerStatus.RUN):
			this.runAnim.draw(context, this.x, this.y, this.facingLeft);
			this.runAnim.tick();
			break;
		case(PlayerStatus.RUN_ATTACK):
			this.runAttackAnim.draw(context, this.x, this.y, this.facingLeft);
			this.runAttackAnim.tick();
			break;
		case(PlayerStatus.JUMP_ATTACK):
			this.jumpAttackAnim.draw(context, this.x, this.y, this.facingLeft);
			this.jumpAttackAnim.tick();
			break;
		case(PlayerStatus.STAND_ATTACK):
			this.standAttackAnim.draw(context, this.x, this.y, this.facingLeft);
			this.standAttackAnim.tick();
			break;
			
	}	
	
};
Player.prototype.collide = function(other) {
	if(other.type === WIZARDBLOCK) {
		if(other.deadly && (this.y > other.y+ other.h / 2)) {
			this.hurt(2);
			if(W/2 < this.x + this.w/2) {
				this.dx = -6;
			}
			else {
				this.dx = 6;
			}
		}
		else if(other.collideAble) {	
			this.collideEntity(other);
			if(this.landed) {
				this.landedEntity = true;
				this.landFunction();
			}
		}
	}
	else if(other.type === WIZARDBALL) {
		if((this.status === PlayerStatus.BLOCK) &&
			(other.y+other.h >= this.y) &&
				((this.facingLeft == true && other.dx > 0) ||
					(this.facingLeft == false && other.dx < 0))) {
			assetManager.getAsset("sfx/shield.wav").play();
			
		}
		else {
			this.hurt(1);
		}
		other.die = true;
	} else if(other.type === DRAGONLINK) {
		if(other.state === DragonPhase.DEAD) {
			return;
		}
		if((this.status === PlayerStatus.BLOCK) && (
			(this.facingLeft == true && other.dx > 0) ||
			(this.facingLeft == false && other.dx < 0))) {
			//successful block! play a sound here or something.
			if(assetManager.getAsset("sfx/shield.wav").playState === 0)
				assetManager.getAsset("sfx/shield.wav").play();
			if(this.facingLeft) {
				this.dx = 6;
			}
			else {
				this.dx = -6;
			}
		}
		else {
			if(other.parent.hurtTimer === 0)
				this.hurt(2);
		}
	} else if(other.type === DRAGONBOULDER) {
		this.hurt(2);
	}
	else if(other.type === KNIGHTATTACK) {
		if(this.status === PlayerStatus.BLOCK &&
			((this.facingLeft && !other.facingLeft) || (!this.facingLeft && other.facingLeft))) {
			assetManager.getAsset("sfx/shield.wav").play();
				
		}
		else {
			this.hurt(2);
			other.die = true;
		}
	}
	else if(other.type === WIZARDLASER) {
		if(other.facingLeft) {
			this.dx = -6;
		}
		else {
			this.dx = 6;
		}
		if(this.status === PlayerStatus.BLOCK) {
			if(other.facingLeft) {
				other.dx = -6;
			}
			else {
				other.dx = 6;
			}
		}
		else {
			this.hurt(2);
		}
	}
};


PlayerAttack.prototype = new Entity();
PlayerAttack.constructor = PlayerAttack;

var PLAYERATTACK_LIFE = 10; //num. frames
var PLAYERATTACK_H = 75;
var PLAYERATTACK_W = 75;

function PlayerAttack(room, x, y, player) {
	this.type = PLAYERATTACK;
	this.room = room;
	this.x = x;
	this.y = y;
	this.offsetX = this.x - player.x;
	this.offsetY = this.y - player.y;
	this.w = PLAYERATTACK_W;
	this.h = PLAYERATTACK_H;
	this.player = player;
	this.life = PLAYERATTACK_LIFE;
}

PlayerAttack.prototype.update = function() {
	this.x = player.x + this.offsetX;
	this.y = player.y + this.offsetY;
	//if(this.life <= 0)
		//this.die = true;
	this.life--;
};

PlayerAttack.prototype.collide = function(other) {
	if(other.type === WIZARD) {
		if(other.health <= 0)
			return;
		other.hurt(PLAYER_MELEE_DAMAGE);
		this.die = true;
	} 
	else if(other.type === DRAGON) {
		other.hurt(PLAYER_MELEE_DAMAGE);
		this.die=true;

	}
	else if(other.type === DRAGONLINK) {
		if(other.isTail) {
			other.hurt(PLAYER_MELEE_DAMAGE);
			this.die=true;
		}
	}
	else if(other.type === KNIGHT) {
		other.hurt(PLAYER_MELEE_DAMAGE);
		this.die=true;
	}
}

