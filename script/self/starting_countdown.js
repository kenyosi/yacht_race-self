/*
 * Starting countdown
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var starting_dialog;
// var player                     = require('./player');
var piece                      = require('../piece');
var font                         = require('./font');
var dialog                       = require('./dialog');
var wm                         = require('./window_manager');
var op                         = require('../operation');
var ma                         = require('../main');
var lpv;
var pop;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;
function set_lpv(p) { lpv = p;}
module.exports.set_lpv = set_lpv;

var joining = function () {
	var p = {
		label: {
			cssColor: 'black',
			opacity: 1.0,
		},
		background: {
			cssColor: '#CCCCCC',
			opacity: 0.5,
		},
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '選手を受付けます'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'このメッセージを'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると参加します'},
			{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*4, font_size: 16, s: ''},
		],
		callback_function: wait_other_joining,
		// callback_function: ma.wait_other_joining,
	};
	starting_dialog = new dialog.normal(p);
};

module.exports.joining = joining;

function wait_other_joining() {
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'P2で受付けました'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'ほかの参加者をお待ち下さい'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*4, font_size: 16, s: ''},
		],
		callback_function: undefined,
	};
	// will code login, here
	starting_dialog.set_text(q);
	wm.local_scene_player[2].set_local_scene();

	// var lpv = ma.lpv;
	var details = {
		local_scene: lpv,
		x: conf.local.area.x + conf.local.area.width / 2  - conf.yacht.width / 2,
		y: conf.local.area.y + conf.local.area.height / 2 - conf.yacht.height / 2,
		width: conf.yacht.width,
		height: conf.yacht.height,
		speed: ma.self_view.speed,
		direction: ma.self_view.direction,
		rudder: ma.self_view.rudder,
		throttle: 0,
		player_index: 2,
		piece: {
			scene: scene,
			src: scene.assets['boat_simple'],
			opacity: 1.0,
			width: conf.yacht.width,
			height: conf.yacht.height,
			srcX: conf.yacht.self.srcX,
			srcY: conf.yacht.self.srcY,
			srcWidth: conf.yacht.width,
			srcHeight: conf.yacht.height,
		},
		initial: {
			index: 2,
			piece: 0,
		},
	};
	ma.dd[2] = new piece.yacht(details);
	ma.dd[2].set_player_index(2);
	ma.dd[2].set_view_player_index(2);
	ma.dd[2].set_rudder(0.00);

	pop = new op.user_interface(details);
	module.exports.pop = pop;


}
