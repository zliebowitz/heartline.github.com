var Controller = function() {
	this.DIRECTION_EVENT = "Direction Event";
	this.JUMP_PRESS_EVENT = "Jump Event";
	this.JUMP_RELEASE_EVENT = "Jump Release Event";
	this.LIFT_PRESS_EVENT = "Lift Press Event";
	this.LIFT_RELEASE_EVENT = "Lift Release Event";
	this.SHOOT_PRESS_EVENT = "Shoot Press Event";
	this.SHOOT_RELEASE_EVENT = "Shoot Release Event";

	this.isLifting = false;
	this.isJumping = false;
	this.isShooting = false;
	this.settingBind = null;

	var player = null;
};

var defaultPlayer1Bindings = {
    jump: 'B'.charCodeAt(0),
    lift: 'N'.charCodeAt(0),
    shoot: 'V'.charCodeAt(0),
    left: 'A'.charCodeAt(0),
    right: 'D'.charCodeAt(0),
    up: 'W'.charCodeAt(0),
    down: 'S'.charCodeAt(0),
};

var defaultPlayer2Bindings = {
    jump: 98,
    lift: 99,
    shoot: 97,
    left: 37,
    right: 39,
    up: 38,
    down: 40,
};


var KeyboardController = function(bindings) {
	this.type = "KEYBOARD";
	this.bindings = bindings;

    this.dir = {
        'x': 0,
        'y': 0,
    };

	this.event_listeners = {};

	for (var action in bindings) {
		keyPressed[bindings[action]] = false;
    }
};

var gamepad_buttons = {
FACE_1: 0, // Face (main) buttons
	FACE_2: 1,
	FACE_3: 2,
	FACE_4: 3,
	LEFT_SHOULDER: 4, // Top shoulder buttons
	RIGHT_SHOULDER: 5,
	LEFT_SHOULDER_BOTTOM: 6, // Bottom shoulder buttons
	RIGHT_SHOULDER_BOTTOM: 7,
	SELECT: 8,
	START: 9,
	LEFT_ANALOGUE_STICK: 10, // Analogue sticks (if depressible)
	RIGHT_ANALOGUE_STICK: 11,
	PAD_TOP: 12, // Directional (discrete) pad
	PAD_BOTTOM: 13,
	PAD_LEFT: 14,
	PAD_RIGHT: 15
};

var gamepad_axes = {
    LEFT_ANALOGUE_HOR: 0,
    LEFT_ANALOGUE_VERT: 1,
    RIGHT_ANALOGUE_HOR: 2,
    RIGHT_ANALOGUE_VERT: 3
};
var default_gamepad_bindings = {
    up: gamepad_buttons.PAD_TOP,
    down: gamepad_buttons.PAD_BOTTOM,
    left: gamepad_buttons.PAD_LEFT,
    right: gamepad_buttons.PAD_RIGHT,
    jump: gamepad_buttons.FACE_1,
    lift: gamepad_buttons.FACE_3,
    shoot: gamepad_buttons.RIGHT_SHOULDER,
    use_analog: false
};

var GamepadController = function(controllerIndex, bindings) {
	this.type = "GAMEPAD";
	this.bindings = bindings;
	this.controllerIndex = controllerIndex;
	this.event_listeners = {};
	this.dir = {
		'x': 0,
		'y': 0,
	};
}

//Event Listeners recieve the controller object that triggered the event
Controller.prototype.addEventListener = function(event_name, event_listener) {
	if (!this.event_listeners[event_name])
		this.event_listeners[event_name] = new Array();
	this.event_listeners[event_name].push(event_listener);
};

Controller.prototype.detach = function() {
	this.event_listeners = {};
};

Controller.prototype.pause = function() {
	this.paused = true;
};

Controller.prototype.unpause = function() {
	this.paused = false;
};

Controller.prototype.getDir = function() {
	return this.dir;
};

Controller.prototype.getIsJumping = function() {
	return this.isJumping;
};

Controller.prototype.getIsLifting = function() {
	return this.isLifting;
};

Controller.prototype.getIsShooting = function() {
	return this.isShooting;
};

Controller.prototype.getPlayer = function() {
	return this.player;
};

Controller.prototype.setPlayer = function(player) {
	this.player = player;
};

//SO, this might be a real poll, or it might just pretend to be polling
Controller.prototype.poll = function() {
	console.error("Polling not implemented");
};

var keyPressed = {};


window.addEventListener("keydown", function(e) {
			keyPressed[e.keyCode] = true
		}, true);
window.addEventListener("keyup", function(e) {
			keyPressed[e.keyCode] = false
		}, true);

Controller.prototype.getExistingBindings = function() {
	console.error("Get existing bindings not implemented");
};

//return -1 for no value found or compatible value for bindings
Controller.prototype.getBindingCode = function() {
	console.error("Get binding code not implemented");
};

/** 
  (		The Following methosd should not be called by external code
  (*/

Controller.prototype.setDir2 = function(x,y) {
	if (this.dir.x != x || this.dir.y != y) {
		this.dir.x = x;
		this.dir.y = y;
		if (this.event_listeners[this.DIRECTION_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.DIRECTION_EVENT].length; i++) {
				this.event_listeners[this.DIRECTION_EVENT][i](this);
			}
		}
	}
};

Controller.prototype.setDir = function(left,right,up,down) {
	var x = 0;
	var y = 0;
	x += left ? -1 : 0;
	x += right ? 1 : 0;
	y += up ? 1 : 0;
	y += down ? -1 : 0;

	this.setDir2(x,y);
};

Controller.prototype.setJump = function(jump) {
	if (this.isJumping == jump) {
		return;
	}
	this.isJumping = jump;
	if (jump)
	{
		if (this.event_listeners[this.JUMP_PRESS_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.JUMP_PRESS_EVENT].length; i++) {
				this.event_listeners[this.JUMP_PRESS_EVENT][i](this);
			}
		}
	}
	else
	{
		if (this.event_listeners[this.JUMP_RELEASE_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.JUMP_RELEASE_EVENT].length; i++) {
				this.event_listeners[this.JUMP_RELEASE_EVENT][i](this);
			}
		}
	}
	
};

Controller.prototype.setLift = function(lift) {
	if (this.isLifting == lift)
		return;
	this.isLifting = lift;
	if (lift) {
		if (this.event_listeners[this.LIFT_PRESS_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.LIFT_PRESS_EVENT].length; i++) {
				this.event_listeners[this.LIFT_PRESS_EVENT][i](this);
			}
		}
	}
	else {
		if (this.event_listeners[this.LIFT_RELEASE_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.LIFT_RELEASE_EVENT].length; i++) {
				this.event_listeners[this.LIFT_RELEASE_EVENT][i](this);
			}
		}
	}
};

Controller.prototype.setShoot = function(shoot) {
	if (this.isShooting == shoot)
		return;
	this.isShooting = shoot;
	if (shoot) {
		if (this.event_listeners[this.SHOOT_PRESS_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.SHOOT_PRESS_EVENT].length; i++) {
				this.event_listeners[this.SHOOT_PRESS_EVENT][i](this);
			}
		}
	}
	else {
		if (this.event_listeners[this.SHOOT_RELEASE_EVENT]) {
			for (var i = 0; i < this.event_listeners[this.SHOOT_RELEASE_EVENT].length; i++) {
				this.event_listeners[this.SHOOT_RELEASE_EVENT][i](this);
			}
		}
	}
}




KeyboardController.prototype = new Controller();

KeyboardController.prototype.poll = function() {
	var b = this.bindings;
	var up = keyPressed[b.up];
	var down = keyPressed[b.down];
	var left = keyPressed[b.left];
	var right = keyPressed[b.right];
	var jump = keyPressed[b.jump];
	var lift= keyPressed[b.lift];
	var shoot = keyPressed[b.shoot];

	this.setDir(left,right,up,down);
	this.setJump(jump);
	this.setLift(lift);
	this.setShoot(shoot);
};

KeyboardController.prototype.getExistingBindings = function() {
	return this.bindings;
}


KeyboardController.prototype.setBindingCode = function(val) {
	var that = this;

	var process = function(e) {
		that.bindings[val] = e.keyCode;
		document.removeEventListener("keydown", process, true);
		that.settingBind = null;
	};

	if(this.settingBind === null) {
		this.settingBind = val;
		document.addEventListener("keydown", process, true);
	}
};

GamepadController.prototype = new Controller();

GamepadController.prototype.poll = function() {

	var controller = navigator.getGamepads()[this.controllerIndex];
	var threshold = .15;
	var pressed = function(button) {
		return controller.buttons[button].pressed && (controller.buttons[button].value > threshold);
	};
	var b = this.bindings;

	var up;
	var down;
	var left;
	var right;

	if (!b.use_analog) {
		up = pressed(b.up);
		down = pressed(b.down);
		left = pressed(b.left);
		right = pressed(b.right);
	} 
    else {
		up = controller.axes[gamepad_axes.LEFT_ANALOGUE_VERT] < -threshold;
		down = controller.axes[gamepad_axes.LEFT_ANALOGUE_VERT] > threshold;
		left = controller.axes[gamepad_axes.LEFT_ANALOGUE_HOR] < -threshold;
		right = controller.axes[gamepad_axes.LEFT_ANALOGUE_HOR] > threshold;
	}

	var jump = pressed(b.jump);
	var lift = pressed(b.lift);
	var shoot = pressed(b.shoot);

	this.setDir(left, right, up, down);
	this.setJump(jump);
	this.setLift(lift);
	this.setShoot(shoot);
};

GamepadController.prototype.getExistingBindings = function() {
	return this.bindings;
};

GamepadController.prototype.setBindingCode = function(val) {
	while(true) {
		var controller = navigator.getGamepads()[this.controllerIndex];
		for (var i = 0; i < controller.buttons.length; i++) {
			if (controller.buttons[i].pressed) {
				this.bindings[val] = i;
				return;
			}
		}
	}
};
