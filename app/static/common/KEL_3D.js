/**
 * KEL_3D.js
 * 
 * @author Kevin Lindsey
 * @version 1.0
 * @copyright 2000, Kevin Lindsey
 * @license http://www.kevlindev.com/license.txt
 */

/*
 * globals
 */
var svgns = "http://www.w3.org/2000/svg";

/**
 * Point3D
 * 
 * @constructor
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
function Point3D(x, y, z) {
	this.x3 = x;
	this.y3 = y;
	this.z3 = z;

	this.x2 = 0;
	this.y2 = 0;
}

/**
 * transform
 * 
 * @param {Array} transform
 * @param {Number} focus
 */
Point3D.prototype.transform = function(transform, focus) {
	var matrix = transform.matrix;
	var x = this.x3;
	var y = this.y3;
	var z = this.z3;

	var x3 = x * matrix[0] + y * matrix[4] + z * matrix[8]  + matrix[12];
	var y3 = x * matrix[1] + y * matrix[5] + z * matrix[9]  + matrix[13];
	var z3 = x * matrix[2] + y * matrix[6] + z * matrix[10] + matrix[14];

	this.x2 = focus * x3 / z3;
	this.y2 = focus * y3 / z3;
};

/**
 * project
 * 
 * @param {Number} focus
 */
Point3D.prototype.project = function(focus) {
	this.x2 = focus * this.x3 / this.z3;
	this.y2 = focus * this.y3 / this.z3;
};

/**
 * toString
 * 
 * @return {String}
 */
Point3D.prototype.toString = function() {
	return this.x2 + "," + this.y2;
};


/*
 * Vertex.js
 */

/**
 * Vertex
 * 
 * @constructor
 * @param {Number} v1
 * @param {Number} v2
 */
function Vertex(v1, v2) {
	this.v1    = v1;
	this.v2    = v2;
	this.node  = null;
	this.color = "purple";
}

/**
 * draw
 * 
 * @param {SVGElement} parent
 * @param {Array} vertices
 */
Vertex.prototype.draw = function(parent, vertices) {
	var vertex1 = vertices[this.v1];
	var vertex2 = vertices[this.v2];

	if (this.node == null) {
		var SVGDoc  = parent.ownerDocument;
		var line    = SVGDoc.createElementNS(svgns, "line");

		line.setAttributeNS(null, "stroke", this.color);

		parent.appendChild(line);
		this.node = line;
	}

	this.node.setAttributeNS(null, "x1", vertex1.x2);
	this.node.setAttributeNS(null, "y1", vertex1.y2);
	this.node.setAttributeNS(null, "x2", vertex2.x2);
	this.node.setAttributeNS(null, "y2", vertex2.y2);
};

/*
 * Mesh3D.js
 */

/**
 * Mesh3D
 * 
 * @param {SVGElement} parent
 */
function Mesh3D(parent) {
	this.vertices = new Array();
	this.edges    = new Array();

	this.parent   = parent;

	this.z_projection = 90;
}

/**
 * add_vertex
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
Mesh3D.prototype.add_vertex = function(x, y, z) {
	var length = this.vertices.length;

	this.vertices[length] = new Point3D(x, y, z);

	return length;
};

/**
 * add_edge
 * 
 * @param {Vertex} v1
 * @param {Vertex} v2
 */
Mesh3D.prototype.add_edge = function(v1, v2) {
	this.edges[this.edges.length] = new Vertex(v1, v2);
};

/**
 * draw
 * 
 * @param {Array} matrix
 */
Mesh3D.prototype.draw = function(matrix) {
	var vertices = this.vertices;
	var edges    = this.edges;

	for (var i = 0; i < vertices.length; i++) {
		vertices[i].transform(matrix, this.z_projection);
	}

	for (var i = 0; i < edges.length; i++) {
		edges[i].draw(this.parent, vertices);
	}
};

/*
 * Transform.js
 */

/**
 * Transform
 * 
 * @constructor
 */
function Transform() {
	this.matrix = new Array(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	);
}

/**
 * translate
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
Transform.prototype.translate = function(x, y, z) {
	var matrix = this.matrix;

	matrix[12] = x;
	matrix[13] = y;
	matrix[14] = z;
};

/**
 * rotate
 * 
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 */
Transform.prototype.rotate = function(x, y, z) {
	var matrix = this.matrix;

	var cosx = Math.cos(x);
	var sinx = Math.sin(x);
	var cosy = Math.cos(y);
	var siny = Math.sin(y);
	var cosz = Math.cos(z);
	var sinz = Math.sin(z);

	matrix[0]  = cosy*cosz + siny*sinx*sinz;
	matrix[1]  = -cosy*sinz + siny*sinx*cosz;
	matrix[2]  = -siny*cosx;
	matrix[4]  = cosx*sinz;
	matrix[5]  = cosx*cosz;
	matrix[6]  = sinx;
	matrix[8]  = siny*cosz - cosy*sinx*sinz;
	matrix[9]  = -siny*sinz - cosy*sinx*cosz;
	matrix[10] = cosy*cosx;
};
