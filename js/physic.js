var Physic ={
	init: _phy_init,
	Engine: null,
	engine: null,
	World: null,
	world: null,
	Bodies: null,
	addLiquidChain: _phy_addLiquidChain,
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

function _phy_addLiquidChain(liquid){
	var liquidTop = liquid.top;
	var liquidWidth = liquid.width;

	var liquidNodeNum = liquid.amount;
	var liquidNodeWidth = 4;
	var gap = (liquidWidth - liquidNodeNum * liquidNodeWidth * 2) / (liquidNodeNum - 1);
    var liquidNodes = Matter.Composites.stack(liquidNodeWidth * 0.5, liquidTop, 10, 1, gap, 0, function(x, y) {
        var n = Matter.Bodies.circle(x,y,liquidNodeWidth);
        n.mass = 0.5;
        return n;
    });
    liquidNodes.idx = 'liquidNodes';
	liquidNodes.keep = true;
	this.objects.push(liquidNodes);
    
    Matter.Composites.chain(liquidNodes, 0.5, 0, -0.5, 0, { stiffness: 0.5, length: 5});

    var c1 = Matter.Constraint.create({
       // bodyA:Physic.getObjectByIdx('leftWall'),
       pointA:{x:0,y:liquidTop},
       bodyB:liquidNodes.bodies[0],
       pointB:{x:-5,y:0},
       stiffness: 0.8
    });
    var c2 = Matter.Constraint.create({
       pointA:{x:liquidWidth,y:liquidTop},
       bodyB:liquidNodes.bodies[liquidNodeNum-1],
       pointB:{x:5,y:0},
       stiffness: 0.8
    });
    this.World.add(this.world, [liquidNodes, c1, c2]);
}

function _phy_addObj(params, prevObj){
	var rect = this.Bodies.rectangle(params.x, params.y, params.w, params.h, params);
	this.World.add(this.world, [rect]);
	if(prevObj){
		var c = Matter.Constraint.create({
			bodyA: rect,
	       	// pointA:rect.position,
	       	bodyB:prevObj,
	       	// pointB:prevObj.position,
	       length: 50,
	       stiffness: 0.8
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