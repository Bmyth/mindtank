var minNodeDistance = 100;
function Node(params){
	params = params || {};

	var node = new Group();
	node.uid = generateUid();
	node.uiGroup = new Group();
	
	if(params.ele){
		node.ele = $('<p class="node"></p>').text(params.ele.text()).appendTo(Nodes.ele);
		node.onBoard = true;
		params.ele.attr('uid', node.uid).addClass('opacity0');
		node.id = params.ele.attr('nid');
		node.prevUid = params.ele.attr('prevuid');

		var x,y;
		var rect = params.ele[0].getBoundingClientRect();
		x = rect.left + rect.width * 0.5;
		y = rect.top + rect.height * 0.5;

		var	uiFrame =  new Path.Rectangle({
	    	size: [rect.width, rect.height],
	    	strokeColor: '#666',
	    	strokeWidth: 1
	    });
	    uiFrame.bringToFront();
	    uiFrame.name = 'frame';
	    node.uiGroup.addChild(uiFrame);

	    node.phyObj = Physic.addObj({
			x: x,
			y: y,
			w: rect.width,
			h: rect.height,
			isStatic: true,
			mass: 10,
			frictionAir: 1
		});
		// console.log(node.phyObj)
	}

	if(node.prevUid){
		node.prevNode = Nodes.getNodeByUid(node.prevUid);
		var link = new Path.Line({
		    from: [node.posX, node.posY],
		    to: [node.prevNode.posX, node.prevNode.posY],
		    strokeColor: '#333',
		    strokeWidth: 0.5
		});
		link.dashArray = [10, 4];
		link.name = 'link';
		node.uiGroup.addChild(link);
		link.sendToBack();
	}

	node.onFrame = _node_onFrame;
	node.release = _node_release;
	node.updateBoardElePos = _node_updateBoardElePos;
	return node;
}

function _node_onFrame(i) {
	if(!this.phyObj.isStatic){
		// var x =  0.001 * Math.random() - 0.0005;
		// var y = 0.001 * Math.random() - 0.001;
		var x = 0;
		var y = 0;
		Physic.applyForce(this.phyObj, {x:x, y:y})
	}
	if(this.posX !=  this.phyObj.position.x || this.posY != this.phyObj.position.y){
		var uiFrame = this.uiGroup.children['frame'];
		var rect = this.ele[0].getBoundingClientRect();

		this.posX = this.phyObj.position.x;
		this.posY = this.phyObj.position.y;
		uiFrame.position.x = this.posX;
		uiFrame.position.y = this.posY;
		this.ele.css({left: this.posX - rect.width * 0.5, top: this.posY - rect.height * 0.5})

		if(this.prevNode){
			var link = this.uiGroup.children['link'];
			link.segments[0].point.x = this.posX;
			link.segments[0].point.y = this.posY;
			link.segments[1].point.x = this.prevNode.posX;
			link.segments[1].point.y = this.prevNode.posY;
		}
	}
}

function _node_release() {
	this.onBoard = false;
	Physic.setStatic(this.phyObj, false)
}

function _node_refreshText(node){
	if(node.ele.hasClass('node')){
		node.ele.text(Model.getText(node.id));
		var w = node.ele.width();
		var h = node.ele.height();
		var l = node.posX - w * 0.5;
		var t = node.posY - h * 0.5;
		node.ele.css({'left':l, 'top':t})
	}
}

function _node_updateBoardElePos(boardEle){
	var rect = boardEle[0].getBoundingClientRect();
	this.phyObj.position.x = rect.left + rect.width * 0.5;
	this.phyObj.position.y =  rect.top + rect.height * 0.5;
}

function generateUid(){
	var _uidLength = 12;
	var _uidSoup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  	var soupLength = _uidSoup.length;
  	var id = []
  	for (var i = 0; i < _uidLength; i++) {
    	id[i] = _uidSoup.charAt(Math.random() * soupLength);
  	}
  	return id.join('')
}