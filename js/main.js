var windowWidth, windowHeight, centerX, centerY, centerPoint;
var draw;
var Comp = {};
var drawAnchor1, drawAnchor2, drawAnchor3, drawAnchor4, drawAnchor5;
var VReset = '%reset';
var Style =  {
    nodeShapeRadius : 8,
    nodeDotColor : '#aaa',
    nodeTextColor : '#666',
    nodeTextHoverColor : '#333',
    nodeLinkColor : '#666',
    nodeTextSize : 12,
    nodeTextSizeOnFocus: 16
}

var PhysicFilter = {
    default : 0x0001,
    node : 0x0002
}

var nnn = 0

$(function() {
	windowWidth = $(window).width();
    windowHeight = $(window).height();
    centerX = windowWidth * 0.5;
    centerY = windowHeight * 0.5;
    centerPoint = {x:centerX,y:centerY};

    $("body").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })

    $("#svgpaper").css({
        width: windowWidth + 'px',
        height: windowHeight + 'px'
    })
    draw = SVG().addTo('#svgpaper').size('100%', '100%');
    drawAnchor1 = draw.rect(0, 0).opacity(0).attr('idx','1');
    drawAnchor2 = draw.rect(0, 0).opacity(0).attr('idx','2');
    drawAnchor3 = draw.rect(0, 0).opacity(0).attr('idx','3');
    drawAnchor4 = draw.rect(0, 0).opacity(0).attr('idx','4');
    drawAnchor5 = draw.rect(0, 0).opacity(0).attr('idx','5');

    Model.init();
    Physic.init();
    Entry.init();
    Nodes.init();
});





