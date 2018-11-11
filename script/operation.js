/*
 * Operation in board
 * reversi@self, Akashic content
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');
var board_cell_half_size       = {x: conf.board.cell.size.x / 2, y: conf.board.cell.size.y / 2};
var n_piece0                   = conf.piece.n - 1;
var timeout_delta_frame        = 3 * g.game.fps;
var two_pi_to_360 = 360.0 / (2.0 * Math.PI);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;

var process                    = require('./self/process');
var player                     = require('./self/player');
var pointer                    = require('./self/pointer');
var wm                         = require('./self/window_manager');
var font                       = require('./self/font');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var user_interface = function (details) {
	this.view_player_index = details.player_index; // tentative
	this.player_index = details.player_index;
	this.text_message_y      = 0;
	this.text_message_height = 12;
	var clo = conf.local.operation;
	var opp = new g.Pane({
		scene: scene,
		x: clo.x,
		y: clo.y,
		width: clo.width,
		height: clo.height,
	});
	scene.append(opp);
	this.opp = opp;
	var operation = new g.E({
		scene: scene,
		// x: clo.x,
		// y: clo.y,
		width: clo.width,
		height: clo.height,
	});
	opp.append(operation);
	this.operation = operation;

	var piece = new g.Sprite({
		scene: scene,
		src: scene.assets['boat_simple'],
		x: 0.2*clo.x,
		opacity: 1.0,
		width: conf.yacht.width,
		height: conf.yacht.height,
		srcX: conf.yacht.self.srcX,
		srcY: conf.yacht.self.srcY,
		srcWidth: conf.yacht.width,
		srcHeight: conf.yacht.height,
	});
	operation.append(piece);

	var line_text = new g.Label({
		scene: scene,
		// font: conf.default_font,
		font: font.bitmap['14_default'],
		text: '',
		textColor:  '#AAAAAA',
		fontSize: 14,
		x: 0,
		y: 0,
	});
	operation.append(line_text);
	this.line_text = line_text;


	var rudder_background = new g.FilledRect({
		scene: scene,
		cssColor: '#0062ff',
		opacity: 0.5,
		x: 0.10 * clo.width,
		y: 0.80 * clo.height,
		width: 0.8 * clo.width,
		height: 0.2 * clo.height,
	});
	operation.append(rudder_background);
	this.rudder_background = rudder_background;
	var rudder = new g.FilledRect({
		scene: scene,
		cssColor: '#0062ff',
		opacity: 1.0,
		x: 0.40 * clo.width,
		y: 0.80 * clo.height,
		width: 0.2 * clo.width,
		height: 0.2 * clo.height,
		touchable: true,
		tag: {
			range: [0.10 * clo.width, 0.7 * clo.width],
			x: 0.45 * clo.width,
			value: 0.5,
			player_index: details.player_index
		}
	});
	operation.append(rudder);
    
	var throttle_background = new g.FilledRect({
		scene: scene,
		cssColor: '#0062ff',
		opacity: 0.5,
		x: 0.80 * clo.width,
		y: 0.10 * clo.height,
		width: 0.2 * clo.width,
		height: 0.6 * clo.height,
	});
	operation.append(throttle_background);
	this.throttle_background = throttle_background;
	var throttle = new g.FilledRect({
		scene: scene,
		cssColor: '#0062ff',
		opacity: 1.0,
		x: 0.80 * clo.width,
		y: 0.30 * clo.height,
		width: 0.2 * clo.width,
		height: 0.2 * clo.height,
		touchable: true,
		tag: {
			range: [0.10 * clo.height, 0.5 * clo.height],
			y: 0.40 * clo.height,
			value: 0.5,
			player_index: details.player_index
		}
	});
	operation.append(throttle);

	rudder.pointDown.add(function () {
	});
	rudder.pointMove.add(function (ev) {
		rudder.tag.x += ev.prevDelta.x;
		var x = rudder.tag.x;
		x = (x >= rudder.tag.range[0] ? x : rudder.tag.range[0]);
		x = (x <= rudder.tag.range[1] ? x : rudder.tag.range[1]);
		rudder.tag.value = ((x - rudder.tag.range[0]) / (0.6 * clo.width) - 0.5);
		rudder.tag.value /= 128;
		rudder.x = x;
		send('piece_set_rudder', rudder.tag.player_index, rudder.tag.value);
		rudder.modified();
	});

	throttle.pointMove.add(function (ev) {
		throttle.tag.y += ev.prevDelta.y;
		var y = throttle.tag.y;
		y = (y >= throttle.tag.range[0] ? y : throttle.tag.range[0]);
		y = (y <= throttle.tag.range[1] ? y : throttle.tag.range[1]);
		throttle.tag.value = -((y - throttle.tag.range[0]) / (0.6 * clo.width) - 0.5);
		throttle.tag.value /= 2;
		throttle.y = y;
		send('piece_set_throttle', throttle.tag.player_index, throttle.tag.value);
		throttle.modified();
	});


};
module.exports.user_interface = user_interface;

user_interface.prototype.set_line_message = function (text) {
	this.line_text.text = text;
	this.line_text.invalidate();
};


function send(function_name, player_index, value) {
	var mes = {
		data: {
			destination: function_name,
			player_index: player_index,
			value: value,
		}
	};
	scene.message.fire(mes);
	return mes;
}
