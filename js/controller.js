var _controller = function() {
	this.DIRECTION_EVENT = "Direction Event"
	this.JUMP_PRESS_EVENT = "Jump Event"
	this.JUMP_RELEASE_EVENT = "Jump Release Event"
	this.LIFT_PRESS__EVENT = "Lift Press Event"
	this.LIFT_RELEASE_EVENT = "Lift Release Event"

	this.dir =
	{
		'x': 0,
		'y': 0,
	}

	this.isLifting = false
	this.isJumping = false

	this.event_listeners = {}

	var player = null

};

var keyboard_controller = function(bindings)
{
	this.bindings = bindings

	for (var action in bindings)
		keyPressed[bindings[action]] = false;
}

//Event Listeners recieve the controller object that triggered the event
_controller.prototype.addEventListener = function(event_name, event_listener)
{
	if (!this.event_listeners[event_name])
		this.event_listeners[event_name] = new Array()
	this.event_listeners[event_name].push(event_listener)
}

_controller.prototype.detach = function()
{
	this.event_listeners = {}
}

_controller.prototype.pause = function()
{
	this.paused = true
}

_controller.prototype.unpause = function()
{
	this.paused = false
}

_controller.prototype.getDir = function()
{
	return this.dir
}

_controller.prototype.getIsJumping = function()
{
	return this.isJumping
}

_controller.prototype.getIsLifting = function()
{
	return this.isLifting
}

_controller.prototype.getPlayer = function()
{
	return this.player
}

_controller.prototype.setPlayer = function(player)
{
	this.player = player
}

//SO, this might be a real poll, or it might just pretend to be polling
_controller.prototype.poll = function()
{
	console.error("Polling not implemented")
}

var keyPressed = {}


window.addEventListener("keydown", function(e)
{
	keyPressed[e.keyCode] = true
}, true)
window.addEventListener("keyup", function(e)
{
	keyPressed[e.keyCode] = false
}, true)





/** 
(		The Following methosd should not be called by external code
(*/

_controller.prototype.setDir2 = function(x,y)
{
	if (this.dir.x != x || this.dir.y != y)
	{
		this.dir.x = x
		this.dir.y = y
		if (this.event_listeners[this.DIRECTION_EVENT])
			for (var i = 0; i < this.event_listeners[this.DIRECTION_EVENT].length; i++)
				this.event_listeners[this.DIRECTION_EVENT][i](this)
	}
}

_controller.prototype.setDir = function(left,right,up,down)
{
	var x = 0;
	var y = 0;
	x += left ? -1 : 0;
	x += right ? 1 : 0;
	y += up ? 1 : 0;
	y += down ? -1 : 0;

	this.setDir2(x,y);

}

_controller.prototype.setJump = function(jump)
{
	if (this.isJumping == jump)
		return
	if (jump)
		if (this.event_listeners[this.JUMP_PRESS_EVENT])
			for (var i = 0; i < this.event_listeners[this.JUMP_PRESS_EVENT].length; i++)
				this.event_listeners[this.JUMP_PRESS_EVENT][i](this)
	else
		if (this.event_listeners[this.JUMP_RELEASE_EVENT])
		for (var i = 0; i < this.event_listeners[this.JUMP_RELEASE_EVENT].length; i++)
			this.event_listeners[this.JUMP_RELEASE_EVENT][i](this)
}

_controller.prototype.setLift = function(lift)
{
	if (this.isLifting == lift)
		return
	if (lift)
		if (this.event_listeners[this.LIFT_PRESS_EVENT])
			for (var i = 0; i < this.event_listeners[this.LIFT_PRESS_EVENT].length; i++)
			this.event_listeners[this.LIFT_PRESS_EVENT][i](this)
	else
		if (this.event_listeners[this.LIFT_RELEASE_EVENT])
			for (var i = 0; i < this.event_listeners[this.LIFT_RELEASE_EVENT]; i++)
			this.event_listeners[this.LIFT_RELEASE_EVENT][i](this)
}

var defaultPlayer1 =
{
	jump: 'Q'.charCodeAt(0),
	lift: 'E'.charCodeAt(0),
	left: 'A'.charCodeAt(0),
	right: 'D'.charCodeAt(0),
	up: 'W'.charCodeAt(0),
	down: 'S'.charCodeAt(0),
}

var defaultPlayer2 =
{
	jump: 'I'.charCodeAt(0),
	lift: 'P'.charCodeAt(0),
	left: 'K'.charCodeAt(0),
	right: ';'.charCodeAt(0),
	up: 'O'.charCodeAt(0),
	down: 'L'.charCodeAt(0),
}



keyboard_controller.prototype = new _controller()

keyboard_controller.prototype.poll = function()
{
	var b = this.bindings
	var up = keyPressed[b.up]
	var down = keyPressed[b.down]
	var left = keyPressed[b.left]
	var right = keyPressed[b.right]
	var jump = keyPressed[b.jump]
	var lift= keyPressed[b.hold]

	this.setDir(left,right,up,down)
	this.setJump(jump)
	this.setLift(lift)
}
