var Entry = {
	init: _entry_init,
    ele: null,
    onframe: _entry_onFrame,
    show: _entry_show,
    hide: _entry_hide,
    x: 0,
    y: 0,
    iclock: 0
}

function _entry_init(){
    Entry.ele = $('#entry');
    Entry.ele.focus();
    setTimeout(function(){
        $('body').on('keyup', _entry_Keyup);
        Entry.ele.on('compositionend', _entry_compositionend);
        $('body').on('click', _entry_click);
    }, 500)
    
    // $('body').on('mousemove', _.debounce(_entry_mousemove,10));
    // setInterval(_entry_onFrame, 1000)
}

function _entry_Keyup(e){
	var e  = e ||  window.e;          
　　	var key = e.keyCode || e.which;

	// console.log(key)
    //enter
    if(key == '13'){
        _entry_enter();
    }
    //delete
    else if(key == '46'){
        _entry_delete();
    }
    // left
    else if(key == '37'){
        
    }
    // right
    else if(key == '39'){

    }
    // up
    else if(key == '38'){
        _entry_direction('up', event.shiftKey);
    }
    // down
    else if(key == '40'){
        _entry_direction('down', event.shiftKey);
    }
    //esc
    else if(key == '27'){
        _entry_esc();
    }
    //ctrl +
    else if(e.ctrlKey || e.key == 'Control'){
        
    }else{
        _entry_compositionend(e);
    }
}

function _entry_compositionend(e) {
    if(!Nodes.nEdit){
        Nodes.handleNodeNext('point',{x:centerX,y:centerY})
    }
    Nodes.handleNodeTextUpdate();
}

function _entry_enter() {
    Nodes.handleKeyEnter();
}

function _entry_delete() {
    Nodes.handleKeyDelete();
}

function _entry_esc() {
    Nodes.handleKeyEsc();
}

function _entry_click(e) {
    if(e.target.tagName == 'svg'){
        Nodes.handleNodeNext('point', {x:e.clientX, y:e.clientY});
    }
}

function _entry_mousemove(e){
    Nodes.updateScope({x:e.clientX, y:e.clientY})
}

function _entry_show () {
    if(Nodes.nEdit.nid){
        var text = Model.getText(Nodes.nEdit.nid);
        Entry.ele.val(text)
    }

    Entry.ele.addClass('z30');
    var pos = Nodes.nEdit.getPos();
    var rect = Entry.ele[0].getBoundingClientRect();
    Entry.ele.css({left:pos.x - rect.width * 0.5, top: pos.y - rect.height * 0.5}).focus();
}

function _entry_hide(){
    if(_entry_isVisible()){
        Entry.ele.val('').focus();
        Entry.ele.removeClass('z30');
    }
}

function _entry_onFrame(){
    if(!_entry_isVisible()){
        return;
    }
    this.iclock -= 1;
    if(this.iclock == 0){
        this.hide();
    }
}

function _entry_isVisible(){
    return Entry.ele.hasClass('z30');
}