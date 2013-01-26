var DIALOG_MAX_WIDTH = 200;
var LINE_HEIGHT = 25;
var BOX_CORNER_RADIUS = 8;
var BOX_PADDING = 10;
var BOX_V_OFFSET = 30;
var NARRATIVE_PADDING = 20;
var FONT = "25pt Disposable";
function Message(txt) {
	this.text = txt;
	this.lines = new Array();
}
//dont care about that spelling
function Dialog(cutsceneData) {
	this.index = 0;
	this.type = "narrative";
	this.messages = new Array();
	for(var i = 0; i < cutsceneData.length; i++) {
		if(cutsceneData[i].text !== undefined) {
			this.messages.push(new Message(cutsceneData[i].text));
		}
		else {
			this.messages.push(new Message(""));
		}
	}
			
	this.visible = true;
	this.wrapText();
}


//Processes all messages to properly be wrapped
Dialog.prototype.wrapText = function() {

	context.font = FONT;
//	console.log("USing Font: " + FONT);
	if(this.type === "narrative") {
		for( var i = 0; i < this.messages.length; i++) {
			var words = this.messages[i].text.split(" ");
			var line = "";
			var lineCount = 0;
			var testLine = "";
			for(var j = 0; j < words.length; j++) {
				testLine = line + words[j] + " ";
				var metrics = context.measureText(testLine);
				var testWidth = metrics.width;
				//onsole.log(testLine+" : " +testWidth + " > " + (W) + " ? ");
				if(testWidth > W - 2*NARRATIVE_PADDING) {
					this.messages[i].lines.push(line);
					line = words[j] + " ";
				}
				else {
					line = testLine;
				}
			}
			this.messages[i].lines.push(line);
		}
		
		return;
	}
	for( var i = 0; i < this.messages.length; i++) {
		var words = this.messages[i].text.split(" ");
		var line = "";
		var lineCount = 0;
		
		for(var j = 0; j < words.length; j++) {
			var testLine = line + words[j] + " ";
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;
			if(testWidth > DIALOG_MAX_WIDTH) {
				this.messages[i].lines.push(line);
				line = words[j] + " ";
			}
			else {
				line = testLine;
			}
		}
		this.messages[i].lines.push(line);
	}
};

Dialog.prototype.show = function() {
	this.visible = true;
};
Dialog.prototype.hide = function() {
	this.visible = false;
};
Dialog.prototype.next = function() {
	this.index = (this.index+1);
	if(this.index >= this.messages.length)
		this.hide();
};
//Position to draw at is the very bottom of the speech bubble.
Dialog.prototype.draw = function(context, x, y) {
	if(!this.visible)
		return;
	if(this.type === "narrative") {
		if(this.messages[this.index].text === "")
			return;
		var text = this.messages[this.index].lines;
		
		context.fillStyle="black";
		context.fillRect(10, H-text.length*LINE_HEIGHT-33, W-20, (text.length+1)*LINE_HEIGHT);
		
		context.font = FONT;
		context.fillStyle = "white";
			
		for(var i = 0; i < text.length; i++) {
		
			context.fillText(text[i], NARRATIVE_PADDING, (H-(text.length-i)*LINE_HEIGHT));
		}
		return;
	}
	//else: type === speech box
	var text = this.messages[this.index].lines;
	
	var startX = x - DIALOG_MAX_WIDTH/2;
	var startY = y - ((text.length+1) * LINE_HEIGHT) - BOX_V_OFFSET;
	var endX = startX + DIALOG_MAX_WIDTH;
	var endY = startY + ((text.length+1) * LINE_HEIGHT);
	startX-=BOX_PADDING;
	endX+=BOX_PADDING;
	startY-=BOX_PADDING;
	endY+=BOX_PADDING;
	
	context.fillStyle="white";
	//Draw the actual box, clockwise path
	context.beginPath();
	//context.moveTo(startX+BOX_CORNER_RADIUS, startY);
	context.moveTo(endX - BOX_CORNER_RADIUS, startY);
	context.arcTo(endX, startY, 
			endX, startY + BOX_CORNER_RADIUS, BOX_CORNER_RADIUS);
	context.lineTo(endX, endY-BOX_CORNER_RADIUS);
	context.arcTo(endX, endY, endX - BOX_CORNER_RADIUS, endY, BOX_CORNER_RADIUS);
	context.lineTo(x+10, endY);
	context.lineTo(x, y);
	context.lineTo(x-10, endY);
	context.arcTo(startX, endY, startX, endY-BOX_CORNER_RADIUS, BOX_CORNER_RADIUS);
	context.lineTo(startX, startY+BOX_CORNER_RADIUS);
	context.arcTo(startX, startY, startX+BOX_CORNER_RADIUS, startY, BOX_CORNER_RADIUS);
	context.closePath();
	context.fill();
	

	context.font = FONT;
	context.fillStyle = "black";
	
		
	for(var i = 0; i < text.length; i++) {
	
		context.fillText(text[i], x - DIALOG_MAX_WIDTH/2, (y-(text.length-i)*LINE_HEIGHT) - BOX_V_OFFSET);
	}
};
