function Meteor() {
	var star = new Path.Circle({
        center: [0,0],
        radius: 5,
        fillColor: theme.fontColor,
        opacity: 0
    });
    star.name = 'star';
    var line = new Path.Line({
        from: [0, 0],
        to: [0, 0],
        strokeColor: theme.fontColor,
        strokeWidth: 1,
        opacity: 0
    });
    line.name = 'line';
	var meteor = new Group([star, line]);
    meteor.fallFrom = _meteor_fallFrom;
    meteor.falling = _meteor_falling;
	return meteor;
}

var _meteor_clock = null; 

function _meteor_fallFrom(pop){
    var _this = this;
    var color = theme.fontColor;
    var star = this.children['star'];
    star.position.x = pop.pos.x;
    star.position.y = pop.pos.y;
    star.style.strokeColor = color;
    star.opacity = 0.4;
    this.active = true;
    var line = this.children['line'];
    line.updateLinkPos(pop.pos, pop.pos);
    line.style.strokeColor = color;
    line.opacity = 0.4;
    _meteor_clock = setInterval(function(){
        _this.falling();
    }, 30);
}

function _meteor_falling(){
    var fallingAngle = 60;
    var fallingSpeed = 30;
    var x = fallingSpeed * Math.sin(fallingAngle * angleD2R);
    var y = fallingSpeed * Math.cos(fallingAngle * angleD2R);

    var star = this.children['star'];
    star.position.x += x;
    star.position.y += y;
    if(star.opacity.y < 1){
        star.opacity += 0.02;
    }
    if(star.position.y > Stage.board.size.height){
        this.active = false;
        star.opacity = 0;
    }

    var maxLen = 120;
    var line = this.children['line'];
    if(this.active){
        var endPos = star.position;
        var startPos = line.segments[0].point;
        var v = new Point(endPos.x - startPos.x, endPos.y - startPos.y);
        var d = endPos.getDistance(startPos);
        d = Math.min(maxLen, d);
        v = v.normalize(d);
        line.segments[0].point.x = endPos.x - v.x;
        line.segments[0].point.y = endPos.y - v.y;
        line.segments[1].point.x = endPos.x;
        line.segments[1].point.y = endPos.y;
        if(line.opacity < 1){
            line.opacity += 0.02;
        } 
    }else{
        line.opacity = 0;
        clearInterval(_meteor_clock);
    }
}