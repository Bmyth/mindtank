var Physic ={
	init: _phy_init,
	addObj: _phy_addObj,
	setStatic: _phy_setStatic,
	getObjectByIdx: _phy_getObjectByIdx,
	deleteObject: _phy_deleteObject,
	applyForce: _phy_applyForce,
	clear: _phy_clear,
	objects: []
}

function _phy_init(){
	this.Engine = Matter.Engine;
    this.World = Matter.World;
    this.engine = this.Engine.create();
    this.world = this.engine.world;
    this.world.gravity.y = 0;
    this.Bodies = Matter.Bodies;
    this.Body = Matter.Body;
    this.Composite = Matter.Composite;
    this.Composites = Matter.Composites;
    this.Constraint = Matter.Constraint;

	this.Engine.run(this.engine);

	var l1 = this.Bodies.rectangle(windowWidth * 0.5, 0, windowWidth, 1, {isStatic: true});
	var l2 = this.Bodies.rectangle(0, windowHeight * 0.5, 1, windowHeight, {isStatic: true});
	var l3 = this.Bodies.rectangle(windowWidth, windowHeight * 0.5, 1, windowHeight, {isStatic: true});
	var l4 = this.Bodies.rectangle(windowWidth * 0.5, windowHeight, windowWidth, 1, {isStatic: true});
	this.World.add(this.world, [l1,l2,l3,l4]);
}

function _phy_setStatic(obj, isStatic) {
	this.Body.setStatic(obj, isStatic);
}

function _phy_addObj(params, prevObj){
	var rect = this.Bodies.rectangle(params.x, params.y, params.w, params.h, params);
	this.World.add(this.world, [rect]);
	if(prevObj){
		var c = Matter.Constraint.create({
			bodyA: rect,
	       	bodyB:prevObj,
	       	length: 70,
	       	stiffness: 0.7
	    });
	    this.World.add(this.world, [c]);
	}
	
	
	return rect;
}

function _phy_getObjectByIdx(idx){
	return this.objects.find(function(i){
		return i.idx == idx;
	})
}

function _phy_deleteObject(params){

}

function _phy_applyForce(obj, force){
	Matter.Body.applyForce(obj, obj.position, force);
}

function _phy_clear(){
	this.objects.forEach(function(o){
		if(!o.keep){
			Physic.World.remove(Physic.world, o);
		}
	})
}