var Board = {
	init: _board_init,
	update: _board_update,
	release: _board_release,
	close: _board_close,
	getMapPos: _board_getMapPos,
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
			var t = span.text().replace('@','');
			t = t.substring(0, t.length - 1);
			span.text(t)
			Nodes.addNode(span);
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

    Board.ele.css('top', (windowHeight - Board.ele.height()) * 0.5);
    Nodes.updateBoardNodes();
}

function _board_release() {
	Nodes.releaseNodes();
	Board.ele.empty();
	Board.ele.fadeOut();
}

function _board_close() {
	Board.ele.html('');
	Board.ele.fadeOut();
}

function _board_getMapPos(point) {
	var w = Board.ele.width();
	var h = Board.ele.height();
	var marginLeft = (windowWidth - w) * 0.5;
	var marginTop = (windowHeight - h) * 0.5;
	var mapRectSize  = 100;
	var x = (marginLeft - mapRectSize) + (point.x - marginLeft) / w * mapRectSize;
	var y = (marginTop - mapRectSize) + (point.y - marginTop) / h * mapRectSize;
	return {x:x, y:y}
}
