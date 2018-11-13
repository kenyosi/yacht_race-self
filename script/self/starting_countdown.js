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
var play_status = {
	// 0: play registration
	// 1: if the player joined, and waiting. It's still in registration phase
	// 2: Countdown
	// 3: in_play
	// 4: after goal
	phase: 0,
	starting_age: undefined,
	ending_age: undefined,
	// in_race: false,
};
// var player                     = require('./player');
var piece                      = require('../piece');
// var font                         = require('./font');
var dialog                       = require('./dialog');
var wm                         = require('./window_manager');
var op                         = require('../operation');
var ma                         = require('../main');
var lpv;
var pop;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.play_status = play_status;

function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;
function set_lpv(p) { lpv = p;}
module.exports.set_lpv = set_lpv;

var joining = function () {
	play_status.phase = 0;
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
		],
		callback_function: wait_other_joining,
	};
	if (starting_dialog === undefined) starting_dialog = new dialog.normal(p);
	starting_dialog.group.show();
};

module.exports.joining = joining;

function wait_other_joining() {
	play_status.phase = 1;
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'P2で受付けました'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '他の参加者を待っています'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		],
		callback_function: undefined,
	};
	// will code login, here
	starting_dialog.set_text(q);
	wm.local_scene_player[2].set_local_scene();

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

	play_status.starting_age = g.game.age + g.game.fps * 5;
	play_status.ending_age   = g.game.age + g.game.fps * (5 + 60);// tentative number
	var mes = {
		data: {
			destination: 'starting_countdown_sync_timer',
			player_index: 2,
			value: play_status,
		}
	};
	scene.message.fire(mes);

}

var current_count;
function sync_timer(mes) {
	play_status = mes.data.value;
	play_status.phase = 2;
	// current_count = mes.data.value.starting_age;
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'スタートまで'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: Math.ceil((play_status.starting_age - g.game.age) / g.game.fps).toString()},
			{x: 4, y:  14 + 18*2, font_size: 16, s: '操船はスタート後です'},
		],
		callback_function: undefined,
	};
	starting_dialog.set_text(q);

	starting_dialog.text[1].update.add(function countdown_timer(){
		current_count = play_status.starting_age - g.game.age;
		if (current_count % g.game.fps != 0) return;
		var cn = current_count / g.game.fps;
		starting_dialog.text[1].text = cn.toString();
		starting_dialog.text[1].invalidate();
		if (cn != 0) return;
		play_status.phase = 3;
		starting_dialog.text[1].update.remove(countdown_timer);
		starting_dialog.group.hide();
	});

}
module.exports.sync_timer = sync_timer;
