/*
 * dialog window
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var font                       = require('./font');





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var normal = function (p) {
	this.confirmed = false;
	// common parts
	var group = new g.E({
		scene: scene,
		x: 0.3 * g.game.width,
		y: 0.3 * g.game.height,
		width: 0.4 * g.game.width,
		height: 0.4 * g.game.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		tag: {
			type: 'absolute',
			confirmed: false,
			callback_function: p.callback_function,
		},
		hidden: false,
	});
	this.group = group;
	scene.append(group);

	var background = new g.FilledRect({
		scene: scene,
		cssColor: p.background.cssColor,
		opacity: p.background.opacity,
		width: 0.4 * g.game.width,
		height: 0.4 * g.game.height,
		touchable: true,
		tag: {
			parent: group,
		}
	});
	group.append(background);

	var tt = [];
	var length_p_text = p.text.length;
	for (var i = 0; i < length_p_text; i++) {
		var t = p.text[i];
		tt[i] = new g.Label({
			scene: scene,
			font: font.bitmap['16_default'],
			text: t.s,
			fontSize: t.font_size,
			textColor:  p.label.cssColor,
			opacity: p.label.opacity,
			x: t.x,
			y: t.y,
			touchable: false,
			tag: {
				parent: group,
			},
		});
		var tt_rect = tt[i].calculateBoundingRect();
		var rect_width = tt_rect.right - tt_rect.left;
		tt[i].x = group.width / 2.0 - rect_width / 2.0;
		group.append(tt[i]);
	}
	this.text = tt;
	// common parts

	background.pointDown.add(function (ev) {
		if (background.tag.parent.tag.callback_function === undefined) return;
		background.tag.parent.hide();
		background.tag.parent.tag.callback_function();
	});
};
module.exports.normal = normal;

normal.prototype.set_text = function (p) {
	var length_p_text = p.text.length;
	for (var i = 0; i < length_p_text; i++) {
		var tt = this.text[i];
		tt.text = p.text[i].s;
		tt.invalidate();
		var tt_rect = tt.calculateBoundingRect();
		var rect_width = tt_rect.right - tt_rect.left;
		tt.x = tt.tag.parent.width / 2.0 - rect_width / 2.0;
		tt.modified();
	}
	this.group.tag.callback_function = p.callback_function;
	this.group.show();
};

