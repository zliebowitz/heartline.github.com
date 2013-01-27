var TILE_SIZE = 32;

//SCREEN dimemnsions in terms of tiles.
var SCREEN_HEIGHT = 16;
var SCREEN_WIDTH = 25;

var LEVEL_1_DOOR_COLUMN = 20;

function Room(json, openRooms, lastLevel) {
	this.fgTileset = assetManager.getTileset("gfx/tilesets/foreground.png");
	this.bgTileset = assetManager.getTileset("gfx/tilesets/background.png");
	if(lastLevel === undefined){
		this.fg = null;
		this.bg = null;
		this.coll = null;
		this.loadFromJSON(json);
	}else{
		this.generateLevelSelectRoom(openRooms, lastLevel);
	}
	
	this.rightCameraBound = this.width*TILE_SIZE;
	this.botCameraBound = this.height*TILE_SIZE;
	this.half_x = this.width*TILE_SIZE / 2;	
	
	this.processCollision();
	this.processFGTiles();
}

Room.prototype.generateLevelSelectRoom = function(openRooms, lastLevel){
	var lastLevelDoorCol = LEVEL_1_DOOR_COLUMN + 2*openRooms.length;
	var levelSelectScreenCols = lastLevelDoorCol+1 >= SCREEN_WIDTH ? lastLevelDoorCol+2 : SCREEN_WIDTH;
	this.width = levelSelectScreenCols;
	this.height = SCREEN_HEIGHT;
	this.fg = new Array(this.height);
	this.bg = new Array(this.height);	
	this.coll = new Array(this.height);
	this.entities = new Array();
	for(var i = 0; i < this.height; i++) {
		this.fg[i] = new Array(this.width);
		this.bg[i] = new Array(this.width);
		this.coll[i] = new Array(this.width);
		for(var j = 0; j < this.width; j++){
			if(i == 0 || i == this.height - 1 || j == 0 || j == this.width - 1){
				this.fg[i][j] = 0
				this.coll[i][j] = 1;
			}else{
				this.fg[i][j] = -1;
				this.coll[i][j] = 0;
			}
		}
	}
	for(var d = 0; d < openRooms.length; d++){
		this.entities[this.entities.length] = {
			"type": DOOR,
			"x": LEVEL_1_DOOR_COLUMN*TILE_SIZE + 2*d*TILE_SIZE,
			"y": (SCREEN_HEIGHT - 2)*TILE_SIZE,
			"id": d,
			"isNew": !openRooms[d]
		}
	}
	this.entities[this.entities.length] = {
		"type": SPAWN,
		"x": (LEVEL_1_DOOR_COLUMN + 2*lastLevel)*TILE_SIZE,
		"y": (SCREEN_HEIGHT - 2)*TILE_SIZE 
	}
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
			if(this.bg[i][j] < 0)
				continue;
			this.bgTileset.draw(context, j*TILE_SIZE, i*TILE_SIZE, this.bg[i][j]);
		}
	}
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
			if(this.solid(i, j-1) || j === 0) {
				this.collideFlags[i][j].LEFT = true;
			}
			
			if(this.solid(i, j+1) || j === this.width - 1) {
				this.collideFlags[i][j].RIGHT = true;
			}
			
			if(this.solid(i-1, j) || i === 0) {
				this.collideFlags[i][j].UP = true;
			}
			
			if(this.solid(i+1, j) || i === this.height - 1) {
				this.collideFlags[i][j].DOWN = true;
			}
		}
	}
};

Room.prototype.processFGTiles = function() {
	//SAFETY!
	var temp = new Array(this.height);
	for(var i = 0; i < this.height; i++){
		temp[i] = new Array(this.width);
		for(var j = 0; j < this.width; j++){
			temp[i][j] = this.fg[i][j];
			if(this.isTileValid(this.fg[i][j])){
				this.fg[i][j] = temp[i][j] = 0;
			}
		}
	}
	for(var r = 0; r < this.height; r++){
		for(var c = 0; c < this.width; c++){
			var test = false;//Use this just in case things get FUCKED...
			if (!this.isTileValid(this.fg[r][c]))
			{
				continue;
				if(test) console.out.log("ABORTED!");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 0;
				if(test) console.log("SELECTED!0");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 1;
				if(test) console.log("SELECTED!1");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 2;
				if(test) console.log("SELECTED!2");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 3;
				if(test) console.log("SELECTED!3");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 4;
				if(test) console.log("SELECTED!4");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 5;
				if(test) console.log("SELECTED!5");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 6;
				if(test) console.log("SELECTED!6");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 7;
				if(test) console.log("SELECTED!7");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 8 + 8;
				if(test) console.log("SELECTED!8");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 9 + 8;
				if(test) console.log("SELECTED!9");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 10 + 8;
				if(test) console.log("SELECTED!10");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 11 + 8;
				if(test) console.log("SELECTED!11");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 12 + 8;
				if(test) console.log("SELECTED!12");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 13 + 8;
				if(test) console.log("SELECTED!13");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 14 + 8;
				if(test) console.log("SELECTED!14");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 15 + 8;
				if(test) console.log("SELECTED!15");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 16 + 16;
				if(test) console.log("SELECTED!16");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 17 + 16;
				if(test) console.log("SELECTED!17");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 18 + 16;
				if(test) console.log("SELECTED!18");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 19 + 16;
				if(test) console.log("SELECTED!19");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 20 + 16;
				if(test) console.log("SELECTED!19");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 21 + 16;
				if(test) console.log("SELECTED!20");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 22 + 16;
				if(test) console.log("SELECTED!21");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 23 + 16;
				if(test) console.log("SELECTED!23");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 24 + 24;
				if(test) console.log("SELECTED!24");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 25 + 24;
				if(test) console.log("SELECTED!25");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 26 + 24;
				if(test) console.log("SELECTED!26");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 27 + 24;
				if(test) console.log("SELECTED!27");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 28 + 24;
				if(test) console.log("SELECTED!28");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 29 + 24;
				if(test) console.log("SELECTED!29");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 30 + 24;
				if(test) console.log("SELECTED!30");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 31 + 24;
				if(test) console.log("SELECTED!31");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 32 + 32;
				if(test) console.log("SELECTED!32");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) == 1)
			{
				temp[r][c] = 33 + 32;
				if(test) console.log("SELECTED!33");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c - 1) == 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 34 + 32;
				if(test) console.log("SELECTED!34");
			}
			if (this.findTile(r - 1, c - 1) == 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 35 + 32;
				if(test) console.log("SELECTED!35");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) == 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 36 + 32;
				if(test) console.log("SELECTED!36");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 37 + 32;
				if(test) console.log("SELECTED!37");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 38 + 32;
				if(test) console.log("SELECTED!38");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 39 + 32;
				if(test) console.log("SELECTED!39");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 40 + 40;
				if(test) console.log("SELECTED!40");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) == 1 &&
				this.findTile(r + 1, c + 1) != 1)
			{
				temp[r][c] = 41 + 40;
				if(test) console.log("SELECTED!41");
			}
			if (this.findTile(r - 1, c) != 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c - 1) != 1 &&
				this.findTile(r + 1, c) == 1)
			{
				temp[r][c] = 42 + 40;
				if(test) console.log("SELECTED!42");
			}
			if (this.findTile(r - 1, c - 1) != 1 &&
				this.findTile(r - 1, c) == 1 &&
				this.findTile(r, c - 1) == 1 &&
				this.findTile(r, c + 1) != 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 43 + 40;
				if(test) console.log("SELECTED!43");
			}
			if (this.findTile(r - 1, c) == 1 &&
				this.findTile(r - 1, c + 1) != 1 &&
				this.findTile(r, c - 1) != 1 &&
				this.findTile(r, c + 1) == 1 &&
				this.findTile(r + 1, c) != 1)
			{
				temp[r][c] = 44 + 40;
				if(test) console.log("SELECTED!44");
			}
			if(test) console.log("END SELECTING");
		}
	}
	//SAFETY!
	for(var i = 0; i < this.height; i++){
		for(var j = 0; j < this.width; j++){
			this.fg[i][j] = temp[i][j];
		}
	}
}

Room.prototype.wrapClampRow = function(row){
	var delta = this.height + 1;
	while (row < 0)
	{
		row += delta;
	}
	while (row > this.height)
	{
		row -= delta;
	}
	return row;
}

Room.prototype.wrapClampCol = function(col){
	var delta = this.width + 1;
	while (col < 0)
	{
		col += delta;
	}
	while (col > this.width)
	{
		col -= delta;
	}
	return col;
}

Room.prototype.findTile = function(row, col){
	//FUCK IT.
	var r = row;//this.wrapClampRow(row);
	var c = col;//this.wrapClampCol(col);
	if(r < 0 || r >= this.height){
		return 1;
	}
	if(c < 0 || c >= this.width){
		return 1;
	}
	return this.isTileValid(this.fg[r][c]) ? 1 : 0;
}

Room.prototype.isTileValid = function(id){
	return (id >= 0 && id < 8) ||
			(id >= 16 && id < 24) ||
			(id >= 32 && id < 40) ||
			(id >= 48 && id < 56) ||
			(id >= 64 && id < 72) ||
			(id >= 80 && id < 88);
}

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
	var ents = {
		
	};
	console.log("Loading entities...");
	for(var i = 0; i < this.entities.length; i++) {
		switch(this.entities[i].type) {
			case SPAWN:
				var playerA= new Player(this, this.entities[i].x, this.entities[i].y);

				var playerB = new Player(this, this.entities[i].x, this.entities[i].y);
				var heart = new Heart(this, this.entities[i].x, this.entities[i].y);
				entityManager.add(playerA);
				entityManager.add(playerB);
				entityManager.add(heart);
				ents.a = playerA;
				ents.b = playerB;
				ents.heart = heart;
				break;
			case FIRE:
				entityManager.add(new Fire(this, this.entities[i].x, this.entities[i].y));
				break;
			case GOAL:
				var goal = new Goal(this, this.entities[i].x, this.entities[i].y);
				entityManager.add(goal);
				ents.goal = goal;
				break;
			case GRATE:
				entityManager.add(new Grate(this, this.entities[i].x, this.entities[i].y));
				break;
			case BREAKABLE:
				entityManager.add(new Breakable(this, this.entities[i].x, this.entities[i].y));
				break;
			case FAN:
				entityManager.add(new Fan(this, this.entities[i].x, this.entities[i].y));
				break;
			case DOOR:
				var door = new Door(this, this.entities[i].x, this.entities[i].y);
				door.doorRoomID = this.entities[i].id;
				door.doorIsNew = this.entities[i].isNew;
				entityManager.add(door);
				break;
		}
	}
	return ents;
};

