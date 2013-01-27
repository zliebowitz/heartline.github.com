//Canvas Dimension Constants
var W=800; var H=512;
//Key Code Constants
var UP=38,DOWN=40,LEFT=37,RIGHT=39, Z=90, X=88, C=67, SHIFT=16, ENTER=13, SPACE=32, M=77;

//StateManager Stuff
var States = {
	STATE_MENU: 0,
	STATE_LEVELSELECT: 1,
	STATE_PLAY: 2,
	STATE_ENDING: 3,
	STATE_CONFIG: 4,
	STATE_TRANSITION: 5
};

var TRANSITION_TIME = 30;
var nextState;

var state;
var prevState;//used for going to CONFIG
var transitionTimer;

var musicOn = true;
var grd; 
var assetManager = new AssetManager();
var canvas;
var context;
var tileSet;

var roomID;
var currRoom;

var entityManager;
var playerA;
var playerB;
var controllerA;
var controllerB;
var goal;
var openRooms;

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

var loadNextRoom = function() {
	if(state === States.STATE_LEVELSELECT){
		currRoom = new Room(null, openRooms, roomID);
	}else{
		currRoom = assetManager.rooms[roomID];
		if(currRoom === undefined) {
			//we're done!
			state = States.STATE_ENDING;
			return;
		}
	}
	
	entityManager.clear();
	var ents = currRoom.loadEntities(entityManager, openRooms);
	playerA = ents.a;
	playerB = ents.b;
	goal = ents.goal;
	if(!controllerA) {
		controllerA = new keyboard_controller(defaultPlayer1Bindings); 
	}
	if(!controllerB) {
		controllerB = new keyboard_controller(defaultPlayer2Bindings);
	}
	playerA.bind_controller(controllerA);
	playerB.bind_controller(controllerB);

	//Calculate the minimum zoom based on room dimensions.
	var a = W / (currRoom.width * TILE_SIZE); 
	var b = H / (currRoom.height * TILE_SIZE);
	if(a > b)
		camera.minZoom = a;
	else
		camera.minZoom = b;
		
}
var gamePadExists = function(id) {
	if (navigator.webkitGetGamepads()[id] != null) {
		return true;
	}
	return false;
}
var game_logic = function() {
				
	if(keyPressed['G'.charCodeAt(0)])
		entityManager.showBoundingBoxes = true
	else if (keyPressed['H'.charCodeAt(0)])
		entityManager.showBoundingBoxes = false
	
	entityManager.update();
	//Handle player deaths / respawn
	if(playerA.dead && playerB.dead) {
		switchState(States.STATE_LEVELSELECT);
	}
	else if(playerA.dead && playerA.deathTimer <= 0) {
		if(playerB.held && playerB.held.type === HEART) {
			playerA.respawnAt(playerB);
		}
		else {
			playerB.hurt(PLAYER_GRIEVE_RATE);
		}
	}
	else if(playerB.dead && playerB.deathTimer <= 0) {
		if(playerA.held && playerA.held.type === HEART) {
			playerB.respawnAt(playerA);
		} 
		else {
			playerA.hurt(PLAYER_GRIEVE_RATE);
		}
	}
	//Handle win condition
	if(goal) {
		if(goal.won) {
			if(!openRooms[roomID].time || goal.timer < openRooms[roomID].time) { 
				openRooms[roomID].time = goal.timer; 
			}
			if(!openRooms[roomID+1]) {
				openRooms[openRooms.length] = {"finished": false};
			}
			openRooms[roomID].finished = true;
			localStorage["openRooms"] = JSON.stringify(openRooms);
			switchState(States.STATE_LEVELSELECT);
		}
	}
};
var game_draw = function() {
	if(currRoom === undefined)
		return;
	//context.fillStyle = "#7DAA99";
	context.fillStyle = grd;
	context.fillRect(0, 0, W, H);

	context.save();
	// CLAMP CAMERA
	if(camera.x < W/(2*camera.zoom)) {
		camera.x = W/(2*camera.zoom);
	}
	else if(camera.x > (currRoom.width * TILE_SIZE) - (W/(2*camera.zoom))) {
		camera.x = currRoom.width * TILE_SIZE - W/(2*camera.zoom);
	}
	if(camera.y < H/(2*camera.zoom)) {
		camera.y = H/(2*camera.zoom);
	}
	else if(camera.y > (currRoom.height * TILE_SIZE) - (H/(2*camera.zoom))) {
		camera.y = currRoom.height * TILE_SIZE - H/(2*camera.zoom);
	}

	context.scale(camera.zoom, camera.zoom);
	if(camera.shake > 0) {
		context.translate(-camera.x + (Math.random() - 0.5)*CAMERA_SHAKE_FACTOR, -camera.y + (Math.random() - 0.5)*CAMERA_SHAKE_FACTOR);
		camera.shake--;
	}
	else {
		context.translate(-camera.x + W/(2*camera.zoom), -camera.y + H/(2*camera.zoom));
	}

	currRoom.drawBg(context);
	entityManager.draw(context);
	currRoom.drawFg(context);
	context.restore();
};
var game_gui_draw = function() {
	context.fillStyle = "#000000";
	context.fillRect(0, H-20, W, 20);
	context.fillStyle = "#aaaaff";
	context.fillRect(9, H-16, (W/2 - 18), 12);
	context.fillRect(W/2 + 9, H-16, (W/2 - 18), 12);
	context.fillStyle = "#4444aa";
	context.fillRect(10, H-15, (W/2 - 20) * playerA.health / PLAYER_MAX_HEALTH, 10);
	context.fillRect(W/2 + (W/2 - 10 - (W/2 -20) * playerB.health / PLAYER_MAX_HEALTH), H-15, (W/2 - 20) * playerB.health / PLAYER_MAX_HEALTH, 10);	
	
	context.font = "10pt Disposable";
	context.fillStyle = "black";	
	context.fillText(""+goal.timer / 50, 20, 10);
	
	if(openRooms[roomID] && openRooms[roomID].time) {
		if(goal.timer < openRooms[roomID].time) {
			context.fillStyle = "green";
		}
		else {
			context.fillStyle = "red";
		}
		context.fillText("" + openRooms[roomID].time / 50, 20, 20);
	}
};

var mouseX;
var mouseY;

var config_logic = function() {

};

var mouseInside = function(x, y, w, h) {
	if(mouseX > x && mouseY > y-h && mouseX < x+w && mouseY < y) {
		return true;
	}
	return false;
};
var drawHoverText = function(text, x, y, w, h) {
	if(mouseInside(x,y,w,h))
		context.fillStyle = 'blue';
	else
		context.fillStyle = 'white';

	context.fillText(text, x, y);

};

var config_draw = function() {
	context.fillStyle = 'gray';
	context.fillRect(0, 0, W, H);
	context.fillStyle = 'black';
	for(var i = 0; i < W; i+= 80) {
		for(var j = 0; j < H; j+= 32) {
			if(mouseX > i && mouseY > j && mouseX < i + 80 && mouseY < j +32) {
				context.fillStyle = 'red';
			}	
			else {
				context.fillStyle = 'black';
			}
			context.fillRect(i, j, 80, 32);
		}
	}
	context.fillStyle = 'white';
	context.font = "32pt Disposable";
	context.fillText("Configuration - ESCAPE to return", 80 * 1, 32 * 2);

	for(var p = 0; p < 2; p++) {
		var cnt; //controller
		if(p === 0) {
			cnt = playerA.controller;
		}
		else {
			cnt = playerB.controller;
		}
		var x = p * 400 + 80;
		drawHoverText("Rebind  All", x, 32 * 4, 240, 32);
		drawHoverText("LEFT", x, 32 * 6, 160, 32);
		drawHoverText("RIGHT", x, 32 * 7, 160, 32);
		drawHoverText("UP", x, 32 * 8, 160, 32);
		drawHoverText("DOWN", x, 32 * 9, 160, 32);
		drawHoverText("JUMP", x, 32 * 10, 160, 32);
		drawHoverText("SHOOT", x, 32 * 11, 160, 32);
		drawHoverText("THROW", x, 32 * 12, 160, 32);
		
		if(cnt.type === "KEYBOARD")
			drawHoverText(cnt.type, x, 32*14, 160, 32);
		else	
			drawHoverText("GAMEPAD " + cnt.controllerIndex, x, 32*14, 160, 32);
		context.fillStyle = 'gray';
		context.fillText(cnt.bindings.left, x+160, 32 * 6);
		context.fillText(cnt.bindings.right, x+160, 32 * 7);
		context.fillText(cnt.bindings.up, x+160, 32 * 8);
		context.fillText(cnt.bindings.down, x+160, 32 * 9);
		context.fillText(cnt.bindings.jump, x+160, 32 * 10);
		context.fillText(cnt.bindings.shoot, x+160, 32 * 11);
		context.fillText(cnt.bindings.lift, x+160, 32 * 12);
	}
};
var configClick = function() {
	for(var p = 0; p < 2; p++) {
		var plyr;
		if(p === 0) {
			plyr = playerA;
		}
		else {
			plyr = playerB;
		}
		var cnt = plyr.controller;
		var x = p * 400 + 80;
		if(mouseInside(x, 32*14, 160, 32)) {
			if(cnt.type === "KEYBOARD") {
				for(var i = 0; i < 4; i++) {
					if(gamePadExists(i)) {
						cnt = new gamepad_controller(i, null);
					}
				}
			}
			else if(cnt.type === "GAMEPAD") {
				for(var i = cnt.controllerIndex+1; i <= 4; i++) {
					if(i === 4) {
						if(p === 0)
							cnt = new keyboard_controller(defaultPlayer1Bindings);
						else
							cnt = new keyboard_controller(defaultPlayer2Bindings);
						break;
					}
					if(gamePadExists(i)) {
						cnt = new gamepad_controller(i, null);
						break;
					}
					
				}
			}

			
			plyr.unbind_controller();
			plyr.bind_controller(cnt);
			
			if(p === 0)
				controllerA = cnt;
			else
				controllerB = cnt;	
		}
	}
	
};
var switchState = function(s) {
	transitionTimer = TRANSITION_TIME;
	nextState = s;
	state = States.STATE_TRANSITION;
};
var doTransition = function() {
	if(transitionTimer === 0) {
		state = nextState;
		loadNextRoom();
		return;
	}
	transitionTimer--;
	context.fillStyle = "rgba(0,0,0,"+(1.0 - (transitionTimer / TRANSITION_TIME))+")";
	context.fillRect(0, 0, W, H);
};
var step = function() {
	switch(state) {
		case States.STATE_LEVELSELECT:
			game_logic();
			game_draw();
			var maxDoorID = Math.max(playerA.doorID, playerB.doorID);
			if(maxDoorID != -1){
				roomID = maxDoorID;
				switchState(States.STATE_PLAY);
			}
		break;
		case States.STATE_PLAY:
			game_logic();
			game_draw();
			game_gui_draw();
		break;
		case States.STATE_CONFIG:
			config_logic();
			config_draw();
		break;
		case States.STATE_TRANSITION:
			doTransition();
		break;
	}
	if(playerA.dead) {
		camera.moveTo(playerB.x, playerB.y);
	}
	else if(playerB.dead) {
		camera.moveTo(playerA.x, playerA.y);
	}
	else {
		camera.moveTo((playerA.x + playerB.x) / 2, (playerA.y + playerB.y) / 2 );
	}
};

var doKeyDown = function(e) {
	//If escape is pressed
	if(e.keyCode === 27) {
		if(state === States.STATE_CONFIG) {
			state = prevState;
		}else{
			prevState = state;
			state = States.STATE_CONFIG;
		}
	}
};

var doMouseMove = function(e) {
	var rect = canvas.getBoundingClientRect();
	mouseX = e.clientX - rect.left;
	mouseY = e.clientY - rect.top;
};
var doMouseDown = function(e) {
	e.preventDefault();
	if(state === States.STATE_CONFIG) {
		configClick();	
	}
};
var initialize_game = function() {
	console.log("Initializing game...");
	state = States.STATE_LEVELSELECT;
	prevState = state;
	tileSet = assetManager.getTileset("gfx/tileset.png");
	roomID = 0;
	if(localStorage["openRooms"])
		openRooms = JSON.parse(localStorage["openRooms"]);
	if(!openRooms) {
		openRooms = new Array();
		openRooms["0"] = {"finished": false};
	}

	entityManager = new EntityManager();
	loadNextRoom();
	continueMenu = 0;
	grd = context.createLinearGradient(0, 0, 0, H);
	//context.fillStyle = "#7DAA99";
	grd.addColorStop(0, '#7DAA99');
	grd.addColorStop(1, '#6D9A66');
	return setInterval(step, 20); 
};

window.onload = function() {
	canvas = document.getElementById("gamecanvas");
	context = canvas.getContext("2d");
	context.font = "12pt Calibri";
	
	context.fillStyle = "#6666aa";
	context.fillRect(0, 0, W, H);
	
	window.addEventListener('keydown', doKeyDown, true);
	canvas.addEventListener('mousemove', doMouseMove, false);	
	canvas.addEventListener('mousedown', doMouseDown, false);
	// downloadAll ( success, fail, complete )
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
