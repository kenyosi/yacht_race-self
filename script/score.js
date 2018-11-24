/*
 * score view
 * yachet_race@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');

/*
score structure
ordered by gloal_socre
[global_score, check_index, player_index, time, n_dollar]
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var font                       = require('./self/font');
var layout                       = require('./layout');
var scene;
var font_size = 16;
var real_time_lines = 6;

var current = [];
var best    = {};

var check_point_age = [];
var ii = 0;
var game_sec = 15;
var game_age = game_sec * g.game.fps;
while(ii < layout.check.length) {
	check_point_age[ii] = (layout.check.length - ii - 1) * game_age;
	++ii;
}
console.log(check_point_age);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var realtime = function () {
// var view = function (details) {
	var clo = conf.local.operation;
	var pane = new g.Pane({
		scene: scene,
		x: clo.x,
		y: clo.y,
		width: clo.width,
		height: clo.height,
		tag:{
		},
	});
	pane.hide();
	scene.append(pane);
	this.pane = pane;
	var board = new g.E({
		scene: scene,
		width: clo.width,
		height: clo.height,
	});
	pane.append(board);
	this.operation = board;

	var title = new g.Label({
		scene: scene,
		font: font.bitmap['16_default'],
		text: 'リアルタイムランキング',
		fontSize: font_size,
		textColor:  '#000000',
		opacity: 1.0,
		x: 0,
		y: 0.05 * g.game.height,
		touchable: false,
	});
	var title_rect = title.calculateBoundingRect();
	var title_width = title_rect.right - title_rect.left;
	title.x = board.width / 2.0 - title_width / 2.0;
	board.append(title);
	this.title = title;

	var ii = 0;
	var lines =[];
	while (ii < real_time_lines) {
		lines[ii] = new g.Label({
			scene: scene,
			font: font.bitmap['16_default'],
			text: '',
			fontSize: font_size,
			textColor:  '#000000',
			opacity: 1.0,
			x: 0.02 * g.game.width,
			y: 0.05 * g.game.height + 16 * (ii + 2),
			touchable: false,
		});
		board.append(lines[ii]);
		++ii;
	}
	this.lines = lines;
	var line_update = scene.setInterval(function real_time_lines_update() {
		var ii = 0;
		while (ii < real_time_lines) {
			if (current[ii] === undefined) {++ii; continue;};
			var c = current[ii];
			// [global_score, check_index, player_index, time, n_dollar]
			var line = layout.check[c[2]].name + ': P' + (c[1]+1) + ' , ' + c[3] + ', ' + c[4];
			// console.log(line);
			if (lines[ii].text !== line) {
				lines[ii].text = line;
				lines[ii].invalidate();
			}
			++ii;
		}
	}, 2000); 
};
module.exports.realtime = realtime;
realtime.prototype.clear_score = function () {
	var ii = 0;
	while (ii < real_time_lines) {
		this.lines[ii].text = '';
		this.lines[ii].invalidate();
		++ii;
	}
	current = [];
};

function file(mes) {
	// console.log(mes);
	var fi = mes.data;
	var bo = best[mes.data.player_index];
	if (bo === undefined) best[mes.data.player_index] = {
		check_index: fi.check_index,
		time: fi.time,
		n_dollar: fi.n_dollar,
	};
	else {
		if (bo.check_index < fi.check_index) {
			bo.check_index = fi.check_index;
			bo.time = fi.time;
			bo.n_dollar = fi.n_dollar;
		}
		else if (bo.check_index == fi.check_index) {
			if (bo.time > fi.time) bo.time = fi.time;
			if (bo.n_dollar < fi.n_dollar) bo.n_dollar = fi.n_dollar;
		}
	}
	console.log(best);
	var global_score = check_point_age[fi.check_index] + fi.time;
	var r = [global_score, fi.player_index, fi.check_index, fi.time, fi.n_dollar];
	var cl = current.length;
	if (cl === 0) {
		current[0] = r;
		console.log(current);
		return;
	}
	var si = 0;
	while (si < current.length) {
		if (global_score <= current[si][0]) {
			current.splice(si, 0, r);
			console.log(current);
			break;
		}
		++si;
	}
	if (fi.check_index > 0) { // delete an old record
		while (si < current.length) {
			if (current[si][1] === fi.player_index) {
				current.splice(si, 1);
				console.log(current);
				return;
			}
			++si;
		}
	}

	// [global_score, check_index, player_index, time, n_dollar]
	current.append(r);
	console.log(best);
}
module.exports.file = file;


