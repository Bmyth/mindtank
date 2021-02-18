var Board = {
	init: _board_init,
	update: _board_update,
	release: _board_release,
	close: _board_close,
	getNodeEle: _board_getNodeEle,
	onEditNode: false,
	ele: null
}

function _board_init(){
	Board.ele = $('#board').hide().empty();
	_board_update();
}

function _board_update(val) {
	val = val || '';
	var html = Board.ele.html();
	if(val == '@'){
		if(!Board.onEditNode){
			Board.onEditNode = true;
			var prevUid;
			var prevspan = Board.ele.find('span').last();
			if(prevspan.length > 0){
				prevUid = prevspan.attr('uid');
			}else{
				prevUid = Nodes.path.length > 0 ? Nodes.path[Nodes.path.length - 1].uid : '';
			}
			html = html.substring(0,html.length-1);
			Board.ele.html(html + '<span></span>');
			var span = Board.ele.find('span').last();
			span.attr('prevuid',prevUid)
		}else{
			var span = Board.ele.find('span').last();
			var prevText = [];
			if(span.attr('prevuid')){
				prevText.push(Board.ele.find('[uid=' + span.attr('prevuid') + ']').text());
			}
			var t = span.text().replace('@','');
			t = t.substring(0, t.length - 1);
			span.text(t)
			Nodes.addNode(span, prevText);
			Board.onEditNode = false;
		}
		html = Board.ele.html();
		val = '';
	}

	val = val + '_';
	if(Board.onEditNode){
        var span = Board.ele.find('span').last();
        span.text('@' + val);
    }else{
    	html = html.substring(0,html.lastIndexOf('</span>')) + '</span>' + val;
       	Board.ele.html(html) 
    }

    if(Board.ele.html() == '' || Board.ele.html() == '_'){
    	Board.ele.fadeOut()
    }else{
    	Board.ele.fadeIn()
    }
    _board_updateTop();
}

function _board_release() {
	var span = Board.ele.find('span').last().clone();
	Board.ele.empty();
	Entry.ele.val('');
	span.appendTo(Board.ele)
	Nodes.releaseNodes();
	_board_updateTop();
	Nodes.updateBoardNodes();
}


function _board_updateTop() {
	var top = Board.ele.css('top');
	var predict = (windowHeight - Board.ele.height()) * 0.5;
	if(Math.abs(top - predict) > 1){
		Board.ele.css('top', (windowHeight - Board.ele.height()) * 0.5);
		Nodes.updateBoardNodes();
	}	
}

function _board_close() {
	Board.ele.html('');
	Board.ele.fadeOut();
}

function _board_getNodeEle(uid) {
	var ele = Board.ele.find('[uid=' + uid + ']');
	if(ele.length == 0){
		return null;
	}else{
		return ele;
	}
}

// function _board_getMapPos(point) {
// 	var w = Board.ele.width();
// 	var h = Board.ele.height();
// 	var marginLeft = (windowWidth - w) * 0.5;
// 	var marginTop = (windowHeight - h) * 0.5;
// 	var mapRectSize  = 100;
// 	var x = (marginLeft - mapRectSize) + (point.x - marginLeft) / w * mapRectSize;
// 	var y = (marginTop - mapRectSize) + (point.y - marginTop) / h * mapRectSize;
// 	return {x:x, y:y}
// }
