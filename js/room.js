var TILE_SIZE = 32;

//SCREEN dimemnsions in terms of tiles.
var SCREEN_HEIGHT = 16;
var SCREEN_WIDTH = 25;

var TileType = {
	VOID: -1,
	WALL: 1,
	FLOOR: 2
};

function Room(tileset, w, h) {
	if(w === undefined) { 
		//Rooms are passed the tileset on creation.
		this.loadFromJSON(tileset);
	}
	else {
		//Empty room
		this.width = w;
		this.height = h;
		this.tileset = tileset;
		
		this.data = new Array(this.height);
		this.entities = new Array();	
		for(var i = 0; i < this.height; i++) {
			this.data[i] = new Array(this.width);
			for(var j = 0; j < this.width; j++) {
				this.data[i][j] = TileType.VOID;
			}
		}
	}
	
	this.rightCameraBound = this.width*TILE_SIZE;
	this.botCameraBound = this.height*TILE_SIZE;
	this.half_x = this.width*TILE_SIZE / 2;
	
	
	this.processCollision();
}

Room.prototype.solid = function(y, x) {
	if(y<0 || y >= this.height || x < 0 || x >= this.width)
		return true;
	if(this.data[y][x] != TileType.VOID)
		return true;
	return false;
};

Room.prototype.draw = function(context) {
	var startX = Math.max(Math.floor(camera.x / TILE_SIZE), 0);
	var endX = Math.min(Math.ceil((camera.x + W/camera.zoom) / TILE_SIZE), this.width);
	var startY = Math.max(Math.floor(camera.y / TILE_SIZE), 0);
	var endY = Math.min(Math.ceil((camera.y+H/camera.zoom) / TILE_SIZE), this.height);
	for(var i = startY; i < endY; i++) {
		for(var j = startX; j < endX; j++) {
			if(this.data[i][j] === TileType.VOID)
				continue;
			//tileSet.draw(context, j*TILE_SIZE, i*TILE_SIZE, this.data[i][j]);
		}
	}
};

//I was going to use bitfields... but memory is free, right? :)
Room.prototype.processCollision = function() {
	//console.log("Processing collision data for room "+ this.id);
	this.collideFlags = new Array(this.height);
	for(var i = 0; i < this.height; i++) {
		this.collideFlags[i] = new Array(this.width);
		for(var j = 0; j < this.width; j++) {
			this.collideFlags[i][j] = {
				LEFT: false,
				RIGHT: false,
				UP: false,
				DOWN: false
			};
		}
	}
	for(var i = 0; i < this.height; i++) {
		for(var j = 0; j < this.width; j++) {
			if(this.solid(i, j-1)) {
				this.collideFlags[i][j].LEFT = true;
			}
			
			if(this.solid(i, j+1)) {
				this.collideFlags[i][j].RIGHT = true;
			}
			
			if(this.solid(i-1, j)) {
				this.collideFlags[i][j].UP = true;
			}
			
			if(this.solid(i+1, j)) {
				this.collideFlags[i][j].DOWN = true;
			}
		}
	}
};

Room.prototype.getFlagState = function(x, y, direction) {
	if(this.collideFlags[y][x] | direction > 0)
		return true;
	return false;
};

Room.prototype.loadFromJSON = function(d) {
	this.id = d.id;
	this.width = d.width;
	this.height = d.height;
	this.data = new Array(this.height);
		
	for(var i = 0; i < this.height; i++) {
		this.data[i] = new Array(this.width);
	}
	
	for(var i = 0; i < this.height; i++) {
		for(var j = 0; j < this.width; j++) {
			this.data[i][j] = d.data[i*this.width + j]-1;
			if(this.data[i][j] === 63)
				this.data[i][j] = TileType.VOID;
		}
	}
	this.entities = d.entities;
	this.cutscenes = d.cutscenes;
};



/*
	Saves data FROM the entityManager to the room.
*/
Room.prototype.saveEntities = function(entityManager) {
	this.entities.clear();
};


/*
	Loads room data INTO the entityManager
	We pass in player to this function so game.js can assign a
		a reference to the player object when it is loaded into 
		the room.
*/
Room.prototype.loadEntities = function(entityManager, player) {
	for(var i = 0; i < this.entities.length; i++) {
		switch(this.entities[i].type) {
			case PLAYER:
//				console.log("Player loaded!");
				player.x = this.entities[i].x;
				player.y = this.entities[i].y;
				entityManager.add(player);
				break;
		}
	}
};




/*
	ROOM EDITING FUNCTIONS
	=====================
	for level editor use only
*/

Room.prototype.resize = function(w, h) {
	if(w === undefined || h === undefined || w < 1 || h < 1) {
		console.log("Room.resize(w, h) failed!")
		return;
	}
};


