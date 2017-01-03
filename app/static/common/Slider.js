/**
 * Slider.js
 * 
 * Based on code by Dr. Stefan Goessner
 * Requires Node_Builder.js
 * 
 * @author Kevin Lindsey
 * @version 1.0
 * @copyright 2000-2001, Kevin Lindsey
 * @license http://www.kevlindev.com/license.txt
 */

/*
 * class variables
 */

Slider.VERSION = 1.1;
Slider.sliders = new Array();

/**
 * Slider
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} size
 * @param {Number} direction
 * @param {Function} callback
 * @param {SVGElement} parent
 */
function Slider(x, y, size, direction, callback, parent) {
	if (arguments.length > 0) this.initialize(x, y, size, direction, callback, parent);
}

/**
 * initialize
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} size
 * @param {Number} direction
 * @param {Function} callback
 * @param {SVGElement} parent
 */
Slider.prototype.initialize = function(x, y, size, direction, callback, parent) {
	this.x         = x;
	this.y         = y;
	this.size      = size;
	this.direction = direction;
	this.min       = 0;
	this.max       = size;
	this.value     = 0;
	this.active    = false;

	this.parent    = parent;
	this.body      = null;
	this.thumb     = null;

	this.callback  = callback;

	this.make_controls();
	Slider.sliders[Slider.sliders.length] = this;
};

/**
 * make_controls
 */
Slider.prototype.make_controls = function() {
	var serial = "_slider_" + Slider.sliders.length;
	var trans  = "translate(" + this.x + "," + this.y + ")";
	var rotate = "rotate(" + this.direction + ")";
	var body   = new Node_Builder("g", { id: serial, transform: trans + " " + rotate });
	var thumb  = new Node_Builder("g", { id: serial });

	body.appendTo(this.parent);
	this.make_body(body.node);

	thumb.appendTo(body.node);
	this.make_thumb(thumb.node);

	body.node.addEventListener("mousedown", SliderDown,  false);
	body.node.addEventListener("mouseup",   SliderUp,    false);
	body.node.addEventListener("mousemove", SliderMove,  false);
	body.node.addEventListener("click",     SliderClick, false);

	this.body  = body;
	this.thumb = thumb;
};

/**
 * make_body
 * 
 * @param {SVGElement} body
 */
Slider.prototype.make_body = function(body) {
	var part1 = new Node_Builder(
		"rect",
		{ x: -5, width: this.size + 10, height:20, fill: "#c0c0c0" }
	);
	var part2 = new Node_Builder(
		"line",
		{ x1:0, y1:6, x2:this.size, y2:6, stroke: "black", 'stroke-width': 2 }
	);
	var part3 = new Node_Builder(
		"line",
		{ x1:0, y1:8, x2:this.size, y2:8, stroke: "white", 'stroke-width': 2 }
	);

	part1.appendTo(body);
	part2.appendTo(body);
	part3.appendTo(body);

	for (var x = 0; x <= this.size; x += (this.size / 10)) {
		var tick = new Node_Builder(
			"line",
			{ x1:x, y1:16, x2:x, y2:20, stroke: "black", 'stroke-width': 2 }
		);

		tick.appendTo(body);
	}
};

/**
 * make_thumb
 * 
 * @param {SVGElement} thumb
 */
Slider.prototype.make_thumb = function(thumb) {
	var path = "M-4,2 4,2 4,11 0,15 -4,11 Z";
	var part1 = new Node_Builder("path", { d:path, transform: "translate(-1,-1)", stroke:"white", fill:"#ccc" });
	var part2 = new Node_Builder("path", { d:path, transform: "translate(1,1)", stroke:"black", fill:"#ccc" });
	var part3 = new Node_Builder("path", { d:path, stroke:"#ccc", fill:"#ccc" });

	part1.appendTo(thumb);
	part2.appendTo(thumb);
	part3.appendTo(thumb);
};


/*
 * Setters
 */

/**
 * set_min
 * 
 * @param {Number} min
 */
Slider.prototype.set_min = function(min) {
	this.min = min;
	if (this.min < this.max) {
		if (this.value < min) this.value = min;
	} else {
		if (this.value < max) this.value = max;
	}
	this.set_value(this.value, true);
};

/**
 * set_max
 * 
 * @param {Number} max
 */
Slider.prototype.set_max = function(max) {
	this.max = max;
	if (this.min < this.max) {
		if (this.value > max) this.value = max;
	} else {
		if (this.value > min) this.value = min;
	}
	this.set_value(this.value, true);
};

/**
 * set_minmax
 * 
 * @param {Number} min
 * @param {Number} max
 */
Slider.prototype.set_minmax = function(min, max) {
	this.min = min;
	this.max = max;
	if (this.min < this.max) {
		if (this.value < min) this.value = min;
	} else {
		if (this.value < max) this.value = max;
	}
	if (this.min < this.max) {
		if (this.value > max) this.value = max;
	} else {
		if (this.value > min) this.value = min;
	}
	this.set_value(this.value, true);
};

/**
 * set_value
 * 
 * @param {Number} value
 * @param {Boolean} call_callback
 */
Slider.prototype.set_value = function(value, call_callback) {
	var range    = this.max - this.min;
	var position = ( value - this.min ) / range * this.size;

	this.value = value;
	this.thumb.node.setAttributeNS(null, "transform", "translate(" + position + ", 0)");

	if (call_callback && this.callback) this.callback(value);
};

/**
 * set_position
 * 
 * @param {Number} position
 * @param {Boolean} call_callback
 */
Slider.prototype.set_position = function(position, call_callback) {
	var range = this.max - this.min;
	var value = this.min + position / this.size * range;

	this.thumb.node.setAttributeNS(null, "transform", "translate(" + position + ", 0)");
	this.value = value;
	if (call_callback && this.callback) this.callback(value);
};

/**
 * find_position
 * 
 * @param {MouseEvent} event
 */
Slider.prototype.find_position = function(event) {
	var x_delta  = event.clientX - this.x;
	var y_delta  = event.clientY - this.y;
	var s_angle  = this.direction * Math.PI / 180;
	var t_angle  = 5*Math.PI/2 - Math.atan2(x_delta, y_delta);
	var angle    = t_angle - s_angle;
	var length   = Math.sqrt( x_delta*x_delta + y_delta*y_delta );
	var position = length * Math.cos(angle);

	if (position < 0) {
		this.set_position(0, true);
	} else if (position > this.size) {
		this.set_position(this.size, true);
	} else {
		this.set_position(position, true);
	}
};

/*
 * Event Handlers
 */

/**
 * SliderDown
 * 
 * @param {MouseEvent} event
 */
function SliderDown(event) {
	var slider = Slider.Find_Slider(event.target.parentNode);

	slider.active = true;
};

/**
 * SliderUp
 * 
 * @param {MouseEvent} event
 */
function SliderUp(event) {
	var slider = Slider.Find_Slider(event.target.parentNode);

	slider.active = false;
};

/**
 * SliderMove
 * 
 * @param {MouseEvent} event
 */
function SliderMove(event) {
	var slider = Slider.Find_Slider(event.target.parentNode);

	if (slider.active) slider.find_position(event);
};

/**
 * SliderClick
 * 
 * @param {MouseEvent} event
 */
function SliderClick(event) {
	var slider = Slider.Find_Slider(event.target.parentNode);

	slider.find_position(event);
};

/*
 * class methods
 */

/**
 * Find_Slider
 * 
 * @param {SVGElement} slider
 */
Slider.Find_Slider = function(slider) {
	var result = null;
	var id     = slider.getAttributeNS(null, "id") + "";
	var match  = id.match(/(\d+)$/);

	if (match != null) {
		var index = match[1];
		result = Slider.sliders[index];
	}

	return result;
};
