var Physic ={
	init: _phy_init,
	addCircle: _phy_addCircle,
	addConstraint: _phy_addConstraint,
	setStatic: _phy_setStatic,
	setPosition: _phy_setPosition,
	deleteObject: _phy_deleteObject,
	applyForce: _phy_applyForce
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

    //default 2
    // this.engine.constraintIterations = 2;
    //default 6
	// this.engine.positionIterations = 4;
	//default 4
	// this.engine.velocityIterations = 2;
	this.Engine.run(this.engine);

	var l1 = this.Bodies.rectangle(windowWidth * 0.5, 0, windowWidth, 1, {isStatic: true});
	var l2 = this.Bodies.rectangle(0, windowHeight * 0.5, 1, windowHeight, {isStatic: true});
	var l3 = this.Bodies.rectangle(windowWidth, windowHeight * 0.5, 1, windowHeight, {isStatic: true});
	var l4 = this.Bodies.rectangle(windowWidth * 0.5, windowHeight, windowWidth, 1, {isStatic: true});
	this.World.add(this.world, [l1,l2,l3,l4]);
}

function _phy_addCircle(params){
	var circle = this.Bodies.circle(params.x, params.y, params.r, params);
	this.World.add(this.world, [circle]);
	return circle;
}

function _phy_addConstraint(obj1, obj2, params){
	params = params || {}
	stiffness = params.stiffness || 0.005;
	stiffness = 1;
	length = params.length || 50;
	var constraint = this.Constraint.create({ 
		bodyA: obj1,
        bodyB: obj2,
        length: length,
        stiffness: stiffness
    })
	this.World.add(this.world, constraint);
	return constraint;
}

function _phy_setStatic(obj, isStatic) {
	this.Body.setStatic(obj, isStatic);
}

function _phy_setPosition(obj, position) {
	this.Body.setPosition(obj, position);
}

function _phy_deleteObject(o){
	this.World.remove(this.world, o);
}

function _phy_applyForce(obj, force){
	Matter.Body.applyForce(obj, obj.position, force);
}
