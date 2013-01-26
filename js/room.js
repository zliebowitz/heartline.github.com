var TILE_SIZE = 32;

//SCREEN dimemnsions in terms of tiles.
var SCREEN_HEIGHT = 16;
var SCREEN_WIDTH = 25;

function Room(json) {
	this.fg = null;
	this.bg = null;
	this.coll = null;

	this.fgTileset = assetManager.getTileset("gfx/tilesets/foreground.png");
	this.bgTileset = assetManager.getTileset("gfx/tilesets/foreground.png");
	console.log(this.fgTileset);
	this.loadFromJSON(json);
	
	this.rightCameraBound = this.width*TILE_SIZE;
	this.botCameraBound = this.height*TILE_SIZE;
	this.half_x = this.width*TILE_SIZE / 2;	
	
	this.processCollision();
}

Room.prototype.solid = function(y, x) {
	if(y<0 || y >= this.height || x < 0 || x >= this.width)
		return true;	
	if(this.coll[y][x] === 1)
		return true;
	return false;
};

Room.prototype.draw = function(context) {
	var startX = Math.max(Math.floor(camera.x / TILE_SIZE - W/(2*camera.zoom)), 0);
	var endX = Math.min(Math.ceil((camera.x + W/(2*camera.zoom)) / TILE_SIZE), this.width);
	var startY = Math.max(Math.floor(camera.y / TILE_SIZE - H/(2*camera.zoom)), 0);
	var endY = Math.min(Math.ceil((camera.y + H/(2*camera.zoom)) / TILE_SIZE), this.height);
	for(var i = startY; i < endY; i++) {
		for(var j = startX; j < endX; j++) {
			if(this.fg[i][j] < 0)
				continue;
			this.fgTileset.draw(context, j*TILE_SIZE, i*TILE_SIZE, this.fg[i][j]);
		}
	}
};

//I was going to use bitfields... but memory is free, right? :)
Room.prototype.processCollision = function() {
	console.log(this.coll);
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
	this.width = d.width;
	this.height = d.height;
	this.fg = new Array(this.height);
	this.bg = new Array(this.height);	
	this.coll = new Array(this.height);
	this.entities = new Array();
	for(var i = 0; i < this.height; i++) {
		this.fg[i] = new Array(this.width);
		this.bg[i] = new Array(this.width);
		this.coll[i] = new Array(this.width);
	}
	var gids = {
		"foreground": 0,
		"background": 0,
		"entities": 0,
		"collision": 0
	};
	for(var i = 0; i < d.tilesets.length; i++) {
		gids[d.tilesets[i].name] = d.tilesets[i].firstgid;
	}
	for(var i = 0; i < d.layers.length; i++) {
		var layer = d.layers[i];
		console.log("Loading layer: " + layer.name);
		if(layer.name === "foreground") {
			this.loadLayer(this.fg, layer, gids["foreground"]);
		}
		else if(layer.name === "background") {
			this.loadLayer(this.bg, layer, gids["background"]);
		}	
		else if(layer.name === "collision") {
			this.loadLayer(this.coll, layer, gids["collision"]);
		}
		else if(layer.name === "entities") {
			this.loadEntityLayer(layer, gids["entities"]);
		}
	}
};

 
Room.prototype.loadLayer = function(dest, layer, gidStart) {
	for(var i = 0; i < this.height; i++) {
		for(var j = 0; j < this.width; j++) {
			dest[i][j] = layer.data[i*this.width + j] - gidStart;
		}
	}
};

Room.prototype.loadEntityLayer = function(layer, gidStart) {
	for(var i = 0; i < this.height; i++) {
		for(var j = 0; j < this.width; j++) {
			var entId = layer.data[i*this.width + j] - gidStart;
			if(entId < 0)
				continue;
			this.entities[this.entities.length] = {
				"type": entId,
				"x": j * TILE_SIZE,
				"y": i * TILE_SIZE 
			}
		}
	}
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
Room.prototype.loadEntities = function(entityManager) {
	var players = {
		
	};
	console.log("Loading entities...");
	for(var i = 0; i < this.entities.length; i++) {
		console.log(this.entities[i]);
		switch(this.entities[i].type) {
			case SPAWN:
				var playerA= new Player(this, this.entities[i].x, this.entities[i].y);

				var playerB = new Player(this, this.entities[i].x, this.entities[i].y);
				entityManager.add(playerA);
				entityManager.add(playerB);
				players.a = playerA;
				players.b = playerB;
				break;
		}
	}
	return players;
};

