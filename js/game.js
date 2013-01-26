//Canvas Dimension Constants
var W=800; var H=512;
//Key Code Constants
var UP=38,DOWN=40,LEFT=37,RIGHT=39, Z=90, X=88, C=67, SHIFT=16, ENTER=13, SPACE=32, M=77;

//StateManager Stuff
var States = {
	STATE_MENU: 0,
	STATE_LEVELSELECT: 1,
	STATE_PLAY: 2,
	STATE_ENDING: 3
};
var state = States.STATE_PLAY;

var musicOn = true;

var bossHealthAmount = 1;
var assetManager = new AssetManager();
var canvas;
var context;
var tileSet;

var roomID;
var currRoom;

var entityManager;
var player;
var boss;

var cutScene ;

var continueMenu;


var Difficulty = {
	NORMAL: 0,
	HARDCORE: 1
};

var GUI = {
	BOSS_FILL: 1
};

var difficulty = Difficulty.NORMAL;

var CAMERA_SHAKE_FACTOR = 10;
var camera = {
	x: 0,
	y: 0,
	minZoom: 0.5,//calculate this at beginning of each room.
	zoom: 1,
	shake: 0, //0 is normal, > 0 is a timer for shaking,
	setZoom: function(z) {
		this.zoom = z;
		if(this.zoom < this.minZoom) {
			this.zoom = this.minZoom;
		}
	},
	moveTo: function(tx, ty) {
		this.x = (tx - this.x)*0.1 + this.x;
		this.y = (ty - this.y)*0.1 + this.y;
	}
};

var keys = new Array();
var prevKeys = new Array();


var doKeyDown = function(e) {
	keys[e.keyCode] = true;
	//console.log(e.keyCode);
	e.preventDefault();
};
var doKeyUp = function(e) {
	keys[e.keyCode] = false;
	e.preventDefault();
};
var loadNextRoom = function() {
	currRoom = assetManager.rooms[roomID];
	if(currRoom === undefined) {
		//we're done!
		state = States.STATE_ENDING;
		return;
	}
	roomID++;
	if(player==undefined)
		player = new Player(currRoom, 0, 0);
	
	entityManager.clear();
	currRoom.loadEntities(entityManager, player, boss);
	player.room =currRoom;
	//Calculate the minimum zoom based on room dimensions.
	var a = W / (currRoom.width * TILE_SIZE); 
	var b = H / (currRoom.height * TILE_SIZE);
	if(a > b)
		camera.minZoom = a;
	else
		camera.minZoom = b;
		
	if(currRoom.cutscenes !== undefined && currRoom.cutscenes.length > 0) {
		cutScene = new Cutscene(currRoom.cutscenes);
	}
	else {
		cutScene = new Cutscene();
	}
	bossHealthAmount = 1;
	if(difficulty === Difficulty.NORMAL) {
		player.health = PLAYER_MAX_HEALTH;
	}
	else {
		//No recharged health if you're hardcore!
	}
	GUI.BOSS_FILL = 1;
}
var tryAgain = function() {
	roomID--;
	entityManager = new EntityManager();
	player = undefined;
	loadNextRoom();
};
var game_logic = function() {
	if(keys[DOWN]) {
		player.block(); 
	}
	if(keys[LEFT]) {
		player.moveLeft(); 
	}
	if(keys[RIGHT]) {
		player.moveRight();
	}
	if((keys[Z] && !prevKeys[Z]) ||
		(keys[UP] && !prevKeys[UP])){
		player.jumpPress();
	}
	else if((!keys[Z] && prevKeys[Z]) ||
		  ((!keys[UP] && prevKeys[UP]) )) {
		player.jumpRelease();
	}
	if((keys[X] && !prevKeys[X]) ||
		(keys[SPACE] && !prevKeys[SPACE]))
		player.attack();
	entityManager.update();
	//Keep track of last frame's key state, so we can detect key presses properly
	prevKeys[Z] = keys[Z];
	prevKeys[X] = keys[X];
	prevKeys[UP] = keys[UP];
	prevKeys[SHIFT] = keys[SHIFT];
	prevKeys[SPACE] = keys[SPACE];
};
var game_draw = function() {
	if(currRoom === undefined)
		return;
	context.fillStyle = "black";
	context.fillRect(0, 0, W, H);
	
	context.save();
	context.scale(camera.zoom, camera.zoom);
	if(camera.shake > 0) {
		context.translate(-camera.x + (Math.random() - 0.5)*CAMERA_SHAKE_FACTOR, -camera.y + (Math.random() - 0.5)*CAMERA_SHAKE_FACTOR);
		camera.shake--;
	}
	else {
		context.translate(-camera.x, -camera.y);
	}
	if(!player.dead) {
		currRoom.draw(context);
		entityManager.draw(context);
		context.restore();
	}
	else {
		context.restore();
	
		player.draw(context);
		
		//draw Continue? options
	}
};
var menuStage = 0; // 0: splash , 1: A GAME BY, 2: NAMES 3:SMILE, 4:forword, 5:open eyes
var menuAnimTimer = 0;
var which = false;

var menu_logic = function() {
	if((keys[Z] && ! prevKeys[Z]) || (keys[SPACE] && ! prevKeys[SPACE])) {
		menuStage++;
		if(menuStage > 5) {
			state = States.STATE_PLAY;
			
		}
	}
	prevKeys[Z] = keys[Z];
	prevKeys[SPACE] = keys[SPACE];
};


var endingFrame = 0;
var ending_step = function() {
	if((keys[Z] && ! prevKeys[Z]) || (keys[SPACE] && ! prevKeys[SPACE])) {
		endingFrame++;
		if(endingFrame > 2) {
			endingFrame = 2;
		}
	}
	menuAnimTimer++;
	if(menuAnimTimer === 8) {
		menuAnimTimer = 0;
		which = !which;
	}
	switch(endingFrame) {
		case 0:
			if(which) {
				context.drawImage(assetManager.getAsset("gfx/ending1.png"), 0, 0);
			}
			else {
				context.drawImage(assetManager.getAsset("gfx/ending2.png"), 0, 0);
			}
			break;
		case 1:
		
			if(which) {
				context.drawImage(assetManager.getAsset("gfx/smile1.png"), 0, 0);
			}
			else {
				context.drawImage(assetManager.getAsset("gfx/smile2.png"), 0, 0);
			}
		break;
		case 2:
		
			if(which) {
				context.drawImage(assetManager.getAsset("gfx/credits1.png"), 0, 0);
			}
			else {
				context.drawImage(assetManager.getAsset("gfx/credits2.png"), 0, 0);
			}
		break;
	}
	
	prevKeys[Z] = keys[Z];
	prevKeys[SPACE] = keys[SPACE]
};


var step = function() {
	if(keys[M] && !prevKeys[M]) {
		for(var i in soundManager.sounds) {
		    soundManager.sounds[i].toggleMute();
		}
		//assetManager.getAsset("sfx/boss1.ogg").toggleMute();
	}
	switch(state) {
		case States.STATE_PLAY:
			game_logic();
			game_draw();
		break;
		case States.STATE_ENDING:
			ending_step();
		break;
	}
	prevKeys[M] = keys[M];
};

var initialize_game = function() {
	tileSet = assetManager.getTileset("gfx/tileset.png");
	roomID = 0;
	entityManager = new EntityManager();
	loadNextRoom();
	continueMenu = 0;
	
	return setInterval(step, 20); 
};

window.onload = function() {
	canvas = document.getElementById("gamecanvas");
	context = canvas.getContext("2d");
	context.font = "12pt Calibri";
	
	window.addEventListener('keydown', doKeyDown, true);
	window.addEventListener('keyup', doKeyUp, true);
	
	context.fillStyle = "#7777cc";
	context.fillRect(0, 0, W, H);
	
	assetManager.downloadAll( function(path){
					console.log("Loaded: " + path);
					context.fillStyle = "white";
					
					context.fillText(path, Math.floor((11+(assetManager.successCount + assetManager.errorCount)*11) / H) * W/4, 6+((assetManager.successCount + assetManager.errorCount)*11)%H);
					
					//LOADING BAR
					context.beginPath();
					context.rect(100, H/2-25, W-200, 50);
					context.lineWidth=2;
					context.strokeStyle = "black";
					context.stroke();
					
					var ratio = assetManager.successCount / assetManager.getNumAssets();
					context.beginPath();
					context.rect(100, H/2-25, (W-200)*ratio, 50);
					context.fillStyle = "white";
					context.fill();
					context.lineWidth=2;
					context.strokeStyle = "black";
					context.stroke();
					
				}, function(path){
					console.log("!! Failed to load: " + path);
					context.fillStyle = "red";
					context.fillText(path, Math.floor((11+(assetManager.successCount + assetManager.errorCount)*11) / H) * W/4, 6+((assetManager.successCount + assetManager.errorCount)*11)%H);
					
					//LOADING BAR
					context.beginPath();
					context.rect(100, H/2-25, W-200, 50);
					context.lineWidth=2;
					context.strokeStyle = "black";
					context.stroke();
					
					var ratio = assetManager.successCount / assetManager.getNumAssets();
					context.beginPath();
					context.rect(100, H/2-25, (W-200)*ratio, 50);
					context.fillStyle = "white";
					context.fill();
					context.lineWidth=2;
					context.strokeStyle = "black";
					context.stroke();
					
				}, function() {
					initialize_game();
				});
};
