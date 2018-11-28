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
var bcast_message_event = new g.MessageEvent({}, undefined, false, 1);
var scene;
var font_size = 16;
var real_time_lines = 6;
var current = [];
var best    = {};
var ii = 0;
var game_sec = 15;
var safe_game_age = (game_sec + 3) * g.game.fps;
var check_point_age = {};
check_point_age[-1] = (layout.check.length + 1) * safe_game_age;
while(ii < layout.check.length) {
	check_point_age[ii] = (layout.check.length - ii - 1) * safe_game_age;
	++ii;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;
module.exports.current = current;

var realtime = function () {
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
		text: 'ランキング',
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

	var column = new g.Label({
		scene: scene,
		font: font.bitmap['16_default'],
		text: '場所: プレイヤー, タイム, 稼ぎ',
		fontSize: font_size,
		textColor:  '#000000',
		opacity: 1.0,
		x: 0.02 * g.game.width,
		y: 0.05 * g.game.height + font_size*2,
		touchable: false,
	});
	board.append(column);
	this.column = column;

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
			y: 0.05 * g.game.height + 16 * (ii + 4),
			touchable: false,
		});
		board.append(lines[ii]);
		++ii;
	}
	this.lines = lines;
	this.clear_score();

	var line_update = scene.setInterval(function real_time_lines_update() {
		var ii = 0;
		while (ii < real_time_lines) {
			if (current[ii] === undefined) {++ii; continue;}
			var c = current[ii];
			// [global_score, check_index, player_index, time, n_dollar]
			var check_point_name = (c[2] >= 0 ? layout.check[c[2]].name : 'スタート');
			var line = check_point_name + ': P' + (c[1]+1) + ' , ' + c[3] + ', ' + c[4];
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

realtime.prototype.get_number_of_participants = function () {
	return current.length;
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
	// console.log(best);
	var global_score = check_point_age[fi.check_index] + fi.time;
	var r = [global_score, fi.player_index, fi.check_index, fi.time, fi.n_dollar];
	console.log(current);
	console.log(current.length);
	if (current.length === 0) {
		current.push(r);
		console.log(current);
		if (current.length >= conf.players.min_elimination_players) {
			broadcast_age_min_players_attended();
		}
		return;
	}
	var si = 0;
	var length_before_file = current.length;

	while (si < length_before_file) {// delete an old record
		if (current[si][1] === fi.player_index) {
			current.splice(si, 1);
			console.log(current);
			break;
		}
		++si;
	}
	si = 0;
	if (current.length === 0) { // check if length zero after remove the old records
		current.push(r);
		console.log(current);
		return;
	}
	while (si < current.length) {
		if (global_score <= current[si][0]) {
			current.splice(si, 0, r);
			console.log(current);
			if (length_before_file < conf.players.min_elimination_players
				&& current.length >= conf.players.min_elimination_players) {
				broadcast_age_min_players_attended();
				//send message satisfy condition
			}
			return;
		}
		++si;
	}
	if (current.length < real_time_lines) current.push(r);
}
module.exports.file = file;

function broadcast_age_min_players_attended() {
	console.log('broadcast_message');
	// send satisfy min number of player to all to determine end age of elimination
	var current_age = g.game.age;
	bcast_message_event.data.destination = 'game_manager_set_age_min_players_attended';
	bcast_message_event.data.age = current_age;
	bcast_message_event.data.n_players = current.length;
	g.game.raiseEvent(bcast_message_event);
}
