function cubeProtoTypeInject(){
	Item.prototype.initCube = _cube_init;
}

function _cube_init(pt){
	this.idx = pt.idx;

    var text = new PointText({
	        name: 'text',
	        content: pt.t,
	        // justification: 'right',
	        fontSize: 16,
	        fillColor: '#333'
	    });
    // text.
    text.bounds.right = 300;
    text.name = 'text';
    text.idx = pt.idx;
    text.on('click', _cube_onClick);

    var textWidth = text.bounds.width;
    var textHeight = text.bounds.height;

	var back = new Path.Rectangle({
    	size: [textWidth, textHeight],
    	fillColor: new Color(20, 20, 20, 0.02),
    	strokeColor: '#666'
    });
    back.opacity = 0.01;
	back.name = 'back';
	back.idx = pt.idx;
	back.on('click', _cube_onClick);

	this.pos = {};
    this.onFrame = _cube_onFrame;
	if(pt.x != null && pt.y != null){
		this.pos.x = Comp.liquid.width * pt.x;
    	this.pos.y = Comp.liquid.height * pt.y;
	}else{
		//random x 
		var w = Comp.liquid.width - textWidth;
		this.pos.x = textWidth * 0.5 + w * Math.random();
		this.pos.y = -30;
	}
	this.angle = pt.r || 0;
	this.aboveWater = Comp.liquid.isAbove(this.pos.y);
	this.originPos = {
		x: this.pos.x,
		y: this.pos.y,
		r: this.angle
	}
	this.addChild(back);
    this.addChild(text);
    Physic.addRect({x:this.pos.x,y:this.pos.y,w: text.bounds.width,h: text.bounds.height, idx:pt.idx, frictionAir: 0.1});
    this.phyObj = Physic.getObjectByIdx(this.idx);
    this.phyObj.mass = 1.5;
}

_cube_floatForce = 0.01;

function _cube_onFrame() {
	var aboveWater = this.pos.y < Comp.liquid.top;
	if(this.float && !aboveWater){
		Physic.applyForce(this.phyObj, {x:0, y:-_cube_floatForce})
	}
	this.pos.x = this.phyObj.position.x;
	this.pos.y = this.phyObj.position.y;
	this.angle = this.phyObj.angle; 
	_cube_syncPos(this);

	if(this.float || this.aboveWater){
		//drop to water
		if(this.aboveWater && !aboveWater){
			this.phyObj.frictionAir = 0.8;
			this.aboveWater = false;
			if(Comp.liquid.still){
				Comp.liquid.waveAt(this.pos.x, 4);
			}
		}
		//raise to water
		if(this.float && aboveWater){
			if(Comp.liquid.still){
				Comp.liquid.waveAt(this.pos.x, 2);
			}
			// this.phyObj.isStatic = true;
			this.float = false;
		}
	}
}

function _cube_syncPos(cube) {
	var back = cube.children['back'];
	var text = cube.children['text'];
	back.position.x = text.position.x = cube.pos.x;
	back.position.y = text.position.y = cube.pos.y;
	var d = cube.angle - text.rotation;
	if(Math.abs(d) > 0.1){
		back.rotate(d);
		text.rotate(d);
	}
}

function _cube_hover() {

}

function _cube_onClick() {
	var cube = this.parent;
	ViewController.executeOption(this.idx, 'trackRootNode');
}