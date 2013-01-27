/*
	These constants are used in saving/loading entity data.
*/
var GRAVITY = 0.56;
//var GRAVITY = 0;

var SPAWN = 0;
var GOAL = 1;
var FIRE = 2;
var GRATE = 3;
var BREAKABLE = 4;
var FAN = 5;
var DOOR = 6;

var PLAYER = 99;
var HEART = 100;
var BREAK_PARTICLE = 101;
var GOO = 102;
var FIRE_PARTICLE = 103;
var GOAL_PARTICLE = 104;
var FAN_PARTICLE = 105;
var SMOKE = 106;

function Entity(room) {
    this.x = 0;
    this.y = 0;
    
    this.w = 0;
    this.h = 0;
    
    this.dx = 0;
    this.dy = 0;
	    
    this.die = false;
    this.room = room;
    this.landed = false;
    this.solid = true;
   	this.palpable = true; 
    this.bouncy = false;
}

Entity.prototype.outsideRoom = function() {
	if(this.x > this.room.width * TILE_SIZE)
		return true;
	if(this.x+this.w < 0)
		return true;
	if(this.y+this.h < 0)
		return true;
	if(this.y > this.room.height * TILE_SIZE)
		return true;
	return false;
}

//Simple A A B B check
Entity.prototype.checkCollide = function(other) {
	if(!this.palpable || !other.palpable)
		return false;
	if(this.x > other.x+other.w)
		return false;
	if(this.x+this.w < other.x)
		return false;
	if(this.y > other.y+other.h)
		return false;
	if(this.y+this.h < other.y)
		return false;
	return true;
};

Entity.prototype.collide = function(other) {
  
};

//Provides resolution similar to collideRoom
Entity.prototype.collideEntity = function(other) {
	var resolve_x = 0;
	var resolve_y = 0;
	
	var dXright = other.x+other.w - this.x;
	var dXleft = other.x - this.w - this.x;
	var dYup = other.y - this.h - this.y;
	var dYdown = other.y+other.h - this.y;
	
	
	if(Math.abs(dXright) < Math.abs(dXleft)) {
		if(Math.abs(dYup) < Math.abs(dYdown)) {
			if(Math.abs(dXright) < Math.abs(dYup)) { //dXright
				resolve_x = dXright;
			}
			else { //dYup
				resolve_y = dYup;
			}
		}
		else {
			if(Math.abs(dXright) < Math.abs(dYdown)) { //dXright
				resolve_x = dXright;
			}
			else { //dYdown
				resolve_y = dYdown;
			}
		}
	}
	else {
		if(Math.abs(dYup) < Math.abs(dYdown)) {
			if(Math.abs(dXleft) < Math.abs(dYup)) { //dXleft
				resolve_x = dXleft;
			}
			else { //dYup
				resolve_y = dYup;
			}
		}
		else {
			if(Math.abs(dXleft) < Math.abs(dYdown)) { //dXleft
				resolve_x = dXleft;
			}
			else { //dYdown
				resolve_y = dYdown;
			}
		}
	}
	
	if(this.dx>0 && resolve_x>0)
		resolve_x = 0;
	else if(this.dx < 0 && resolve_x < 0)
		resolve_x = 0;
	if(this.dy > 0 && resolve_y > 0)
		resolve_y = 0;
	else if(this.dy < 0 && resolve_y < 0)
		resolve_y = 0;
	if(resolve_y < 0)
		this.landedEntity = true;
		
	if(this.dy > 0 && resolve_y < 0) {
		if(this.bouncy) {
			this.dy = -this.dy;
		}
		else {
			this.dy = 0;
		}
	}
	else if(this.dy < 0 && resolve_y > 0) {
		if(this.bouncy) {
			this.dy = -this.dy;
		}
		else { 
			this.dy = 0; 
		}
	}
	if(this.dx > 0 && resolve_x < 0) {
		if(this.bouncy) {
			this.dx = -this.dx;
		}
		else {
			this.dx = 0;
		}
	}
	else if(this.dx < 0 && resolve_x > 0) {
		if(this.bouncy) {
			this.dx = -this.dx;
		}
		else {
			this.dx = 0;
		}
	}
	
	this.y += resolve_y;	
	this.x += resolve_x;
}

Entity.prototype.collideRoom = function() {
	var resolve_x = 0;
	var resolve_y = 0;
	
	var startx = Math.max(Math.floor(this.x / TILE_SIZE), 0);
	var starty = Math.max(Math.floor(this.y / TILE_SIZE), 0);
	var endx = Math.min(Math.floor((this.x+this.w) / TILE_SIZE), this.room.width-1);
	var endy = Math.min(Math.floor((this.y+this.h) / TILE_SIZE), this.room.height-1);;

	//Top + Bot
	for(var i = startx; i <= endx; i++) {
		for(var j = starty; j <= endy; j++) {
			if(!this.room.solid(j,i)) {
				continue;
			}
			
			//Let's do a form of SAT here. 2 axis, 4 directions we compare.
			var dXright = (i+1)*TILE_SIZE - this.x;
			var dXleft = i*TILE_SIZE - this.w - this.x;
			var dYup = j*TILE_SIZE - this.h - this.y;
			var dYdown = (j+1)*TILE_SIZE - this.y;
			
			//These variables stand for 'Skip [D]irection'.
			//	TODO: If needed, this area can be optimized. But premature optimization is a trap!
			var sr = this.room.collideFlags[j][i].RIGHT;
			var sl = this.room.collideFlags[j][i].LEFT;
			var su = this.room.collideFlags[j][i].UP;
			var sd = this.room.collideFlags[j][i].DOWN;
		
			
			//Sigh... hard coded binary tree for efficiency.
			//We find the minimal translation axis by comparing 4 directions.
			if(Math.abs(dXright) < Math.abs(dXleft)) {
				if(Math.abs(dYup) < Math.abs(dYdown)) {
					if(!sr && (Math.abs(dXright) < Math.abs(dYup))) { //dXright
						resolve_x = dXright;
					}
					else if(!su){ //dYup
						resolve_y = dYup;
					}
				}
				else {
					if(!sr && (Math.abs(dXright) < Math.abs(dYdown))) { //dXright
						resolve_x = dXright;
					}
					else if(!sd) { //dYdown
						resolve_y = dYdown;
					}
				}
			}
			else {
				if(Math.abs(dYup) < Math.abs(dYdown)) {
					if(!sl && (Math.abs(dXleft) < Math.abs(dYup))) { //dXleft
						resolve_x = dXleft;
					}
					else if(!su) { //dYup
						resolve_y = dYup;
					}
				}
				else {
					if(!sl && (Math.abs(dXleft) < Math.abs(dYdown))) { //dXleft
						resolve_x = dXleft;
					}
					else if(!sd) { //dYdown
						resolve_y = dYdown;
					}
				}
			}
		}
	}
	
	if(this.dx>0 && resolve_x>0)
		resolve_x = 0;
	else if(this.dx < 0 && resolve_x < 0)
		resolve_x = 0;
	if(this.dy > 0 && resolve_y > 0)
		resolve_y = 0;
	else if(this.dy < 0 && resolve_y < 0)
		resolve_y = 0;
		
	if(resolve_y < 0)
		this.landed = true;
	//if(resolve_y != 0)
	//	console.log(resolve_y);
	if(this.dy > 0 && resolve_y < 0) {
		if(this.bouncy) {
			this.dy = -this.dy;
		}
		else {
			this.dy = 0;
		}
	}
	else if(this.dy < 0 && resolve_y > 0) {
		if(this.bouncy) {
			this.dy = -this.dy;
		}
		else { 
			this.dy = 0; 
		}
	}
	if(this.dx > 0 && resolve_x < 0) {
		if(this.bouncy) {
			this.dx = -this.dx;
		}
		else {
			this.dx = 0;
		}
	}
	else if(this.dx < 0 && resolve_x > 0) {
		if(this.bouncy) {
			this.dx = -this.dx;
		}
		else {
			this.dx = 0;
		}
	}
	this.y += resolve_y;	
	this.x += resolve_x;
};

Entity.prototype.update = function() {
};

Entity.prototype.draw = function(elapsed)
{
	
};

Entity.prototype.drawBoundingBox = function(context) {
	context.beginPath();
	context.rect(this.x, this.y, this.w, this.h);
	//context.fillStyle = "#0000FF";
	//context.fill();
	context.lineWidth=1;
	context.strokeStyle = "red";
	context.stroke();
};
