/*
 * dialog window
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
// var conf                       = require('../content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var font                       = require('./font');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var default_parameters = {
	label: {
		cssColor: 'black',
		opacity: 1.0,
	},
	background: {
		cssColor: '#FFFFFF',
		opacity: 0.5,
	},
	progress_bar: {
		cssColor: '#8888FF',
		opacity: 0.9,
	},
	text: [
		{x: 4, y:  14 + 18*0, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*4, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*5, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*6, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*7, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*8, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*9, font_size: 16, s: ''},
		{x: 4, y:  14 + 18*10, font_size: 16, s: ''},
	],
	callback_function: {
		tap: undefined,
		timeout: undefined,
	},
	time_out: 0,
};
module.exports.default_parameters = default_parameters;

var normal = function (p) {
	this.confirmed = false;
	// common parts
	var d_width = 0.55 * g.game.width;
	var d_height = 0.8 * g.game.height; // 0.8
	var group = new g.E({
		scene: scene,
		x: 0.05 * g.game.width,
		y: 0.1 * g.game.height,
		width: d_width,
		height: d_height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		tag: {
			type: 'absolute',
			confirmed: false,
			callback_function: {
				tap:  p.callback_function.tap,
				timeout: p.callback_function.timeout,
			},
			default :{
				font_size: 16,
				textColor: p.label.textColor,
			}
		},
		hidden: false,
		local:true,
	});
	this.group = group;
	scene.append(group);

	var background = new g.FilledRect({
		scene: scene,
		cssColor: p.background.cssColor,
		opacity: p.background.opacity,
		width: d_width,
		height: d_height,
		touchable: true,
		local:true,
		tag: {
			parent: group,
		}
	});
	group.append(background);
	this.background = background;

	var progress_bar = new g.FilledRect({
		scene: scene,
		cssColor: p.progress_bar.cssColor,
		opacity: p.progress_bar.opacity,
		width: 0 * d_width,
		height: 0.02 * d_height,
		y: 0.98 * d_height,
		touchable: true,
		local:true,
		tag: {
			parent: group,
			width: d_width,
			start_age: undefined,
			end_age: undefined,
			countdown_age: 0,
			background: background,
			timer_start: function(timeout_sec) {
				progress_bar.tag.countdown_age = timeout_sec * g.game.fps;
				progress_bar.tag.start_age = g.game.age;
				progress_bar.tag.end_age = g.game.age + timeout_sec * g.game.fps;
			},
			timer_countdown: timer_countdown,
		}
	});
	group.append(progress_bar);
	background.tag.progress_bar = progress_bar;
	this.progress_bar = progress_bar;

	function timer_countdown() {
		// if (g.game.age % 2 !== 0) return;
		if (g.game.age > progress_bar.tag.end_age) {
			progress_bar.width = 0;
			progress_bar.modified();
			progress_bar.tag.parent.hide();
			progress_bar.update.remove(timer_countdown);
			progress_bar.tag.parent.tag.callback_function.timeout();
			return;
		}
		progress_bar.width =  (g.game.age - progress_bar.tag.start_age)
		/ progress_bar.tag.countdown_age * progress_bar.tag.width;
		progress_bar.modified();
	}


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

	background.pointDown.add(function () {
		if (background.tag.parent.tag.callback_function.tap === undefined) return;
		if (background.tag.progress_bar.update.contains(timer_countdown)) {
			background.tag.progress_bar.update.remove(timer_countdown);
			console.log('removed timeout, pointDown');
		}
		background.tag.parent.hide();
		// background.tag.parent.tag.callback_function.tap();
		scene.setTimeout(function() {background.tag.parent.tag.callback_function.tap();}, 0);
	});
};
module.exports.normal = normal;

normal.prototype.set_text = function (p) {
	if (this.progress_bar.update.contains(this.progress_bar.tag.timer_countdown)) {
		this.progress_bar.update.remove(this.progress_bar.tag.timer_countdown);
		console.log('removed timeout, set_text');
	}
	var length_p_text = p.text.length;
	for (var i = 0; i < length_p_text; i++) {
		var tt = this.text[i];
		tt.text = p.text[i].s;
		tt.fontSize = (p.text[i].font_size === undefined ? this.group.tag.default.font_size : p.text[i].font_size);
		tt.textColor = (p.text[i].textColor === undefined ? this.group.tag.default.textColor : p.text[i].textColor);
		tt.invalidate();
		var tt_rect = tt.calculateBoundingRect();
		var rect_width = tt_rect.right - tt_rect.left;
		tt.x = tt.tag.parent.width / 2.0 - rect_width / 2.0;
		tt.y = p.text[i].y;
		tt.modified();
	}
	for (i = length_p_text; i < this.text.length; i++) {
		tt = this.text[i];
		tt.text = '';
		tt.invalidate();
		tt.modified();
	}
	this.group.tag.callback_function.tap = p.callback_function.tap;
	this.group.tag.callback_function.timeout = p.callback_function.timeout;
	if (this.group.tag.callback_function.timeout !== undefined) {
		this.progress_bar.tag.timer_start(p.count_down);
		this.progress_bar.update.add(this.progress_bar.tag.timer_countdown);
	}
	this.group.show();
};
