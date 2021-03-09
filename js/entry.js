var Entry = {
	init: _entry_init,
    ele: null,
    show: _entry_show,
    hide: _entry_hide,
    x: 0,
    y: 0
}

function _entry_init(){
    Entry.ele = $('#entry');
    Entry.ele.focus();
    Entry.ele.on('keyup', _entry_Keyup);
    Entry.ele.on('compositionend', _entry_compositionend);
    $('body').on('click', _entry_click);
    // $('body').on('mousemove', _.debounce(_entry_mousemove,10));
}

function _entry_Keyup(e){
	var e  = e ||  window.e;          
　　	var key = e.keyCode || e.which;

	// console.log(key)
    if(key == '13'){
        _entry_enter();
    }
    // left
    else if(key == '37'){
        _entry_direction('left');
    }
    // right
    else if(key == '39'){
        _entry_direction('right');
    }
    // up
    else if(key == '38'){
        _entry_direction('up', event.shiftKey);
    }
    // down
    else if(key == '40'){
        _entry_direction('down', event.shiftKey);
    }
    else if(key == '27'){
        _entry_esc();
    }else{
        _entry_compositionend();
    }
}

function _entry_compositionend() {
    var val = Entry.ele.val();
    // Nodes.handleNodeTextUpdate(val);
}

function _entry_enter() {
    Nodes.handleNodeEnter();
}

function _entry_esc() {
    Nodes.handleEsc();
}

function _entry_click(e) {
    if(e.target.tagName == 'svg'){
        Nodes.handleNodeNext('point', {x:e.clientX, y:e.clientY});
    }
}

function _entry_mousemove(e){
    Nodes.updateScope({x:e.clientX, y:e.clientY})
}

function _entry_direction(direction){
    if(Entry.ele.is(":focus")){
        Nodes.handleNodeTextUpdate();
    }
}

function _entry_show () {
    var text = '';
    if(Nodes.nEdit.nid){
        text = Model.getText(Nodes.nEdit.nid)
    }

    Entry.ele.val(text).show();
    var pos = Nodes.nEdit.getPos();
    var rect = Entry.ele[0].getBoundingClientRect();
    Entry.ele.css({left:pos.x - rect.width * 0.5, top: pos.y - rect.height * 0.5}).focus();
}

function _entry_hide(){
    Entry.ele.val('').hide();
}