/*
 * Starting countdown
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var game_sec = 15;
var game_milliseconds = game_sec * 1000;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var game_set_timer;
var starting_dialog;
var play_status = {
	// 0: configure game
	// 1: register game
	// 2: wait_registeration, if the player joined, and waiting. It's still in registration phase
	// 3: bid game, watcher bidding
	// 4: timer_sync to start timer sync and countdown
	// 5: in_play
	// 6: after goal
	// 7: game set
	phase: 0,
	starting_age: undefined,
	ending_age: undefined,
};
// var player                     = require('./player');
var piece                      = require('../piece');
var race                      = require('../race');
var layout                      = require('../layout');
// var font                         = require('./font');
var dialog                       = require('./dialog');
var wm                         = require('./window_manager');
var op                         = require('../operation');
// var ma                         = require('../main');
var lpv;
var pop;

var check_area = [];
var cv0 = [
	// conf.local.area.x + conf.local.area.width / 2,
	conf.local.area.x + conf.local.area.width / 2 + 3*(1 - 8) * conf.local.area.width,
	conf.local.area.y + conf.local.area.height / 2 + 3*(1 - 8) * conf.local.area.height,
];
var in_goal = false;
var check_index = 0;


var dd = [];
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.play_status = play_status;
module.exports.dd = dd;

function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;
function set_op(p) { pop = p;}
module.exports.set_op = set_op;

function init_game (p) {
	play_status.phase = 0;
	scene.assets['nc10333'].play();
	lpv = p;
	var ii = 0;
	while (ii < layout.check.length) {
		var details = race.default_check_area;
		details.local_scene = lpv;
		details.x = layout.check[ii].x;
		details.y = layout.check[ii].y;
		details.n_dollar = layout.check[ii].n_dollar;
		details.name = layout.check[ii].name;
		details.status_index = (ii == 0 ? 2 : 1); // tentative
		check_area[ii] = new race.check_area(details);
		ii++;
	}
	ii = 0;
	while(ii < 3) {
		details = {
			local_scene: lpv,
			x: 0,
			y: 300 * ii,
			width: conf.yacht.width,
			height: conf.yacht.height,
			speed: 0*4,
			direction: 0,
			rudder: 0*4 / 360, // approximate
			throttle: 0,
			player_index: ii,
			piece: {
				scene: scene,
				src: scene.assets['boat_simple'],
				opacity: 1.0,
				width: conf.yacht.width,
				height: conf.yacht.height,
				srcX: conf.yacht.other.srcX,
				srcY: conf.yacht.other.srcY,
				srcWidth: conf.yacht.width,
				srcHeight: conf.yacht.height,
			},
			initial: {
				index: ii,
				piece: 0,
			},
		};
		dd[ii] = new piece.yacht(details);
		dd[ii].set_player_index(ii);
		dd[ii].set_view_player_index(-1);
		ii++;
	}
	pop = new op.user_interface(details);
	pop.set_viewer_player_index(-1);

	p = {
		label: {
			cssColor: 'black',
			opacity: 1.0,
		},
		background: {
			cssColor: '#CCCCCC',
			opacity: 0.5,
		},
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
		],
		callback_function: undefined,
	};
	starting_dialog = new dialog.normal(p);
	// return;

	scene.update.add(function() {
		var player_index = 2;
		if (dd[player_index] === undefined) return;
		// if (dd[player_index].player_index < 0) return; // <- tantative
		var xy = {
			x: dd[player_index].group.tag.global.x + dd[player_index].group.tag.global.width / 2,
			y: dd[player_index].group.tag.global.y + dd[player_index].group.tag.global.height / 2,
			width: dd[player_index].group.tag.global.width,
			height: dd[player_index].group.tag.global.height,
		};
		lpv.x = -(xy.x - cv0[0])/8;
		lpv.y = -(xy.y - cv0[1])/8;
		if (in_goal) return;
		if (check_area[check_index].validate(dd[player_index])) {
			// var t = g.game.age - game_manager.play_status.starting_age;
			var t = g.game.age - play_status.starting_age;
			dd[player_index].group.tag.global.score.time = t;
			dd[player_index].group.tag.global.score.n_dollar += check_area[check_index].group.tag.global.n_dollar;
			var n_dollar = dd[player_index].group.tag.global.score.n_dollar;
			// game_manager.pop.set_line_message('チェックタイム: ' + t);
			pop.set_line_message('チェックタイム: ' + t + ', 稼ぎ: ' + n_dollar);
			check_area[check_index].set_status(3);
			check_index++;
			if (check_index >= check_area.length) {
				// game_manager.pop.set_line_message('ゴールタイム: ' + t);
				pop.set_line_message('ゴールタイム: ' + t + ', 稼ぎ: ' + n_dollar);
				in_goal = true;
				var mes = {
					data: {
						destination: 'game_manager_after_goal',
						player_index: player_index,
						score: {
							time:t,
							n_dollar: n_dollar,
						},
					}
				};
				scene.message.fire(mes);
				return;
			}
			scene.assets['decision9'].play();
			check_area[check_index].set_status(2);
		}
	});

	configure_game();
}

module.exports.init_game = init_game;


function configure_game () {
	play_status.phase = 0;
	scene.assets['decision3'].play();
	// scene.assets['nc10333'].stop();
	// scene.assets['nc97718'].play();
	in_goal = false;
	check_index = 0;

	var ii = 0;
	while (ii < layout.check.length) {
		var details = race.default_check_area;
		details.local_scene = lpv;
		details.x = layout.check[ii].x;
		details.y = layout.check[ii].y;
		check_area[ii].set_status(1); // tentative
		ii++;
	}
	check_area[0].set_status(2);

	ii = 0;
	while(ii < 3) {
		var p = dd[ii].group.tag.global; 
		p.speed = 0.0;
		p.x = 0.0;
		p.y = 300 * ii;
		p.direction = 0.0;
		p.rudder = 0.0;
		p.throttle = 0.0;
		p.score = {
			time: undefined,
			n_dollar: 0,
		};
		dd[ii].set_view_player_index(-1);
		// dd[ii].group.modified();
		ii++;
	}
	pop.set_viewer_player_index(-1); //<-------------------

	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'ゲーム設定'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'ノーマル'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると選手を受付けます'},
			{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
		],
		callback_function: register_game,
	};
	starting_dialog.set_text(q);
}
module.exports.configure_game = configure_game;

// var joining = function () {
function register_game () {
	play_status.phase = 1;
	scene.assets['decision3'].play();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '選手を受付けます'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'このメッセージを'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると参加します'},
		],
		callback_function: wait_other_joining,
	};
	starting_dialog.set_text(q);
	var ii = 0;
	while(ii < 3) {
		dd[ii].group.modified();
		ii++;
	}
	// pop.set_viewer_player_index(2);

}
module.exports.register_game = register_game;

function wait_other_joining() {
	play_status.phase = 2;
	scene.assets['decision3'].play();
	pop.set_default();
	pop.set_viewer_player_index(2); //<-------------------
	// ma.dd[2].set_view_player_index(2);
	dd[2].set_view_player_index(2);

	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'P2で受付けました'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '他の選手を待っています'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		],
		callback_function: undefined,
	};
	// will code login, here
	starting_dialog.set_text(q);
	wm.local_scene_player[2].set_local_scene();
	// console.log(pop);

	play_status.starting_age = g.game.age + g.game.fps * 6;
	play_status.ending_age   = g.game.age + g.game.fps * (5 + 60);// tentative number
	var mes = {
		data: {
			destination: 'game_manager_sync_timer',
			player_index: 2,
			value: play_status,
		}
	};
	scene.message.fire(mes);
}

var current_count;
function sync_timer(mes) {
	play_status = mes.data.value;
	play_status.phase = 4;
	scene.assets['info_girl1_info_girl1_zyunbihaiikana1'].play();
	
	// scene.assets['nc97718'].stop();
	// scene.assets['nc10333'].play();

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
		if (current_count === (g.game.fps *2 + 10)) {
			scene.assets['info_girl1_info_girl1_ready1'].play();
			return;
		}
		if (current_count % g.game.fps != 0) return;
		var cn = current_count / g.game.fps;
		starting_dialog.text[1].text = cn.toString();
		starting_dialog.text[1].invalidate();
		if (cn != 0) return;
		play_status.phase = 5;
		scene.assets['info_girl1_info_girl1_go2'].play();
		starting_dialog.text[1].update.remove(countdown_timer);
		starting_dialog.group.hide();
		game_set_timer = scene.setTimeout(function() {
			var mes = {
				data: {
					destination: 'game_manager_game_set',
					player_index: undefined,
					score: {
						time: undefined,
						n_dollar: undefined,
					},
				}
			};
			scene.message.fire(mes);
		}, game_milliseconds);
	});

}
module.exports.sync_timer = sync_timer;

function after_goal(mes) {
	play_status.phase = 6;
	scene.assets['info_girl1_info_girl1_goal1'].play();
	scene.assets['people_people_stadium_cheer1'].play();
	var winner_index = mes.data.player_index;
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'ゴール！'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '順位:プレイヤー/タイム/稼ぎ'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: '1位:' + winner_index + '/' + mes.data.score.time + '/' + mes.data.score.n_dollar},
			{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
		],
		callback_function: game_set,
	};
	starting_dialog.set_text(q);
}
module.exports.after_goal = after_goal;

function game_set(mes) {
	play_status.phase = 7;
	scene.assets['info_girl1_info_girl1_timeup2'].play();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'タイムアップ！'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '結果を表示します'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップするとゲームの清算をします'},
		],
		callback_function: game_result,
	};
		// will code login, here
	starting_dialog.set_text(q);
	// starting_dialog.group.show();
}
module.exports.game_set = game_set;



function game_result(mes) {
	play_status.phase = 8;
	scene.assets['line_girl1_line_girl1_kekkawohappyoushimasu1'].play();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'レース結果'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると次のレースをします'},
		],
		callback_function: configure_game,
	};
		// will code login, here
	starting_dialog.set_text(q);
	// starting_dialog.group.show();
}
module.exports.game_set = game_set;
