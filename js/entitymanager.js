function EntityManager() {
    this.entities = new Array();
	this.showBoundingBoxes = false;
};

EntityManager.prototype.update = function() {
	for(var i = 0; i < this.entities.length; i++) {
		this.entities[i].update();
		for(var j = 0; j < this.entities.length; j++) {
			if(i===j)
				continue;
			if(this.entities[i].checkCollide(this.entities[j]))
				this.entities[i].collide(this.entities[j]);
		}
	}
	for(var i = 0; i < this.entities.length; i++) {
		if(this.entities[i].die === true)
			delete(this.entities[i])
	}
	this.entities = this.entities.filter(function(){return true});
};


EntityManager.prototype.draw = function(context) {
	for(var i = 0; i < this.entities.length; i++) {
		this.entities[i].draw(context);
	}
	if(this.showBoundingBoxes) {
		for(var i = 0; i < this.entities.length; i++) {
			this.entities[i].drawBoundingBox(context);
		}
	}
};

EntityManager.prototype.add = function(entity) {
	this.entities.push(entity);
};


EntityManager.prototype.clear = function(context) {
	this.entities = new Array();
}
