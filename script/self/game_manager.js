/*
 * Starting countdown
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var elimination_game_sec = 15;
var elimination_game_milliseconds = elimination_game_sec * 1000;
var game_sec = 15;
var game_milliseconds = game_sec * 1000;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var bgm = new g.MusicAudioSystem('bgm', g.game);
var bgm_player = bgm.createPlayer();
var se = new g.SoundAudioSystem('se', g.game);
var se_player = se.createPlayer();
var voice = new g.SoundAudioSystem('voice', g.game);
var voice_player = voice.createPlayer();
var audience = new g.SoundAudioSystem('audience', g.game);
var audience_player = audience.createPlayer();

var starting_dialog;
var play_status = {
	// 0: configure game
	// 1: register game
	// 2: close registration, if P1 joins, or P1 closes registration or timeout
	// 3: elimination round x, timer_async to start timer sync and countdown
	// 4: elimination round x, in_play
	// 5: elimination round x, after goal, if the player joined
	// 6: wait result of elimination round x
	// 7: round x, resulting and bidding game w/o player
	// 8: round x, timer_sync to start timer sync and countdown
	// 9: round x, in_play
	// 10: round x, player only, after goal
	// 11: round x, wait result of elimination round x
	// 12: round x, resulting
	// 13: round x, balancing
	phase: 0,
	round: 0,
	starting_age: undefined,
	ending_age: undefined,

};
var player                     = require('./player');
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

var elimination_piece_index = 0; // always zero
var piece_index;
var view_piece_index;
var player_index;
var view_player_index;
var current_count;
var piece_handler_destination;

var check_area = [];
var cv0 = [
	conf.local.area.x + conf.local.area.width / 2 + 3*(1 - 8) * conf.local.area.width,
	conf.local.area.y + conf.local.area.height / 2 + 3*(1 - 8) * conf.local.area.height,
];
var check_index = 0;

var initial_lpv = {
	x: -(0 - cv0[0])/8,
	y: -(0 - cv0[1])/8,
};

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
	bgm_player.changeVolume(conf.audio.bgm.volume);
	se_player.changeVolume(conf.audio.se.volume);
	voice_player.changeVolume(conf.audio.voice.volume);
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
	while(ii < conf.players.max_sync_players) {
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
			player_index: conf.players.max_async_players, // leads no player
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
		};
		dd[ii] = new piece.yacht(details);
		ii++;
	}
	pop = new op.user_interface(details);

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
	bgm_player.play(scene.assets[conf.audio.bgm.util]);
	configure_game();
}
module.exports.init_game = init_game;

function configure_game () {
	play_status.phase = 0;
	lpv.x = initial_lpv.x; //<---
	lpv.y = initial_lpv.y; //<---
	if (play_status.match !== 0) se_player.play(scene.assets.decision3);
	check_index = 0;
	var ii = 0;
	while (ii < check_area.length) {
		var details = race.default_check_area;
		details.local_scene = lpv;
		details.x = layout.check[ii].x;
		details.y = layout.check[ii].y;
		check_area[ii].set_status(1); // tentative
		ii++;
	}
	check_area[0].set_status(2);
	piece.set_initial_operation();
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

function register_game () {
	play_status.phase = 1;
	scene.assets['decision3'].play();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'タップすると予選に参加します'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '予選タイムで本戦の開始位置を決めます'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: conf.players.max_sync_players + '名以上参加されたら'},
			{x: 4, y:  14 + 18*3, font_size: 16, s: '上位' + conf.players.max_sync_players +'名が本戦に出ることができます'},
		],
		callback_function: elimination_start_async,
	};
	starting_dialog.set_text(q);
}
module.exports.register_game = register_game;

function elimination_start_async() {
	play_status.phase = 3;
	player_index = player.join(g.game.player);// login, here
	view_player_index = player_index;
	wm.local_scene_player[view_player_index].set_local_scene();
	piece_index = elimination_piece_index;
	view_piece_index = elimination_piece_index;

	se_player.play(scene.assets.decision3);
	pop.set_default();
	pop.set_player_index(player_index);
	pop.set_viewer_player_index(view_player_index);
	dd[piece_index].set_player_index(player_index);
	dd[piece_index].set_view_player_index(view_player_index);
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: player.current[player_index].head + 'で受付けました'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		],
		callback_function: undefined,
	};
	starting_dialog.set_text(q);

	play_status.starting_age = g.game.age + g.game.fps * 6;
	play_status.ending_age   = g.game.age + g.game.fps * (5 + 60);// tentative number
	var mes = {
		data: {
			destination: 'game_manager_elimination_start_async_timer',
			player_index: 2,
			value: play_status,
		}
	};
	scene.update.add(view_piece_handler);
	scene.update.add(piece_handler);
	scene.message.fire(mes);
}

function elimination_start_async_timer(mes) {
	bgm_player.stop();
	play_status = mes.data.value;
	play_status.phase = 3;
	piece_handler_destination = 'game_manager_elimination_after_goal';
	scene.assets['info_girl1_info_girl1_zyunbihaiikana1'].play();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '予選スタートまで'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: Math.ceil((play_status.starting_age - g.game.age) / g.game.fps).toString()},
			{x: 4, y:  14 + 18*2, font_size: 16, s: '操船はスタート後です'},
		],
		callback_function: undefined,
	};
	starting_dialog.set_text(q);	
	starting_dialog.text[1].update.add(function countdown_timer(){
		current_count = play_status.starting_age - g.game.age;
		if (current_count === (g.game.fps * 3 + 10)) {
			bgm_player.play(scene.assets[conf.audio.bgm.play]);
			return;
		}
		if (current_count === (g.game.fps *2 + 10)) {
			voice_player.play(scene.assets.info_girl1_info_girl1_ready1);
			return;
		}
		if (current_count % g.game.fps != 0) return;
		var cn = current_count / g.game.fps;
		starting_dialog.text[1].text = cn.toString();
		starting_dialog.text[1].invalidate();
		if (cn != 0) return;
		play_status.phase = 4;
		voice_player.play(scene.assets.info_girl1_info_girl1_go2);
		starting_dialog.text[1].update.remove(countdown_timer);
		starting_dialog.group.hide();
		scene.setTimeout(game_timeout, elimination_game_milliseconds);
	});

}
module.exports.elimination_start_async_timer = elimination_start_async_timer;

function game_timeout() {
	var n_dollar = dd[piece_index].group.tag.global.score.n_dollar;
	// console.log('game_timeout');
	var mes = {
		data: {
			destination: piece_handler_destination,
			player_index: player_index,
			score: {
				time: undefined,
				n_dollar: n_dollar,
			},
		}
	};
	scene.message.fire(mes);
}

function elimination_after_goal(mes) {
	if (play_status.phase === 5) return; // avoid goal and timeup
	play_status.phase = 5;
	// bgm_player.stop();
	var is_goal = (mes.data.score.time === undefined ? false : true);
	if (is_goal) {
		// scene.clearTimeout(game_timeout); //doesn't work below statements
		voice_player.play(scene.assets.info_girl1_info_girl1_goal1);
		var q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'ゴール！'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
				{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (mes.data.player_index + 1) + ': ' + mes.data.score.time + '/' + mes.data.score.n_dollar},
				{x: 4, y:  14 + 18*3, font_size: 16, s: 'タップすると結果を表示します'},
			],
			callback_function: elimination_game_set,
		};
	}
	else {
		scene.update.remove(piece_handler); // <---
		voice_player.play(scene.assets.info_girl1_info_girl1_timeup2);
		q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'タイムアップ！'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
				{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (mes.data.player_index + 1) + ': なし/' + mes.data.score.n_dollar},
				{x: 4, y:  14 + 18*3, font_size: 16, s: 'タップすると結果を表示します'},
			],
			callback_function: elimination_game_set,
		};
	}
	starting_dialog.set_text(q);
}
module.exports.elimination_after_goal = elimination_after_goal;

function elimination_game_set(mes) {
	play_status.phase = 6;
	// bgm_player.stop();
	// voice_player.play(scene.assets.line_girl1_line_girl1_kekkawohappyoushimasu1);
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '途中結果'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		],
		callback_function: bidding_game,
		// callback_function: configure_game,
	};
	starting_dialog.set_text(q);
}
module.exports.elimination_game_set =  elimination_game_set;




function bidding_game(mes) {
	play_status.phase = 7;
	check_index = 0;
	scene.update.remove(view_piece_handler);

	var ii = 0;
	while (ii < check_area.length) {
		var details = race.default_check_area;
		details.local_scene = lpv;
		details.x = layout.check[ii].x;
		details.y = layout.check[ii].y;
		check_area[ii].set_status(1); // tentative
		ii++;
	}
	check_area[0].set_status(2);
	piece.set_initial_operation();

	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '結果'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '1位...'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: '2位...'},
		],
		callback_function: start_sync_timer,
	};
	starting_dialog.set_text(q);
}
module.exports.bidding_game =  bidding_game;


function start_sync_timer(mes) {
	play_status.phase = 8;
	// bgm_player.stop();
	// player_index = player.join(g.game.player);// login, here
	view_player_index = player_index;
	wm.local_scene_player[view_player_index].set_local_scene();
	piece_index = elimination_piece_index; // readdress pice index here
	view_piece_index = elimination_piece_index;

	piece_handler_destination = 'game_manager_after_goal';

	scene.assets['info_girl1_info_girl1_zyunbihaiikana1'].play();

	pop.set_default();
	pop.set_player_index(player_index);
	pop.set_viewer_player_index(view_player_index);
	dd[piece_index].set_player_index(player_index);
	dd[piece_index].set_view_player_index(view_player_index);
	scene.update.add(view_piece_handler);
	scene.update.add(piece_handler);


	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '本線スタートまで'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: Math.ceil((play_status.starting_age - g.game.age) / g.game.fps).toString()},
			{x: 4, y:  14 + 18*2, font_size: 16, s: '操船はスタート後です'},
		],
		callback_function: undefined,
	};
	starting_dialog.set_text(q);	

	play_status.starting_age = g.game.age + g.game.fps * 6;
	play_status.ending_age   = g.game.age + g.game.fps * (5 + 60);// tentative number

	starting_dialog.text[1].update.add(function countdown_timer(){
		current_count = play_status.starting_age - g.game.age;
		// if (current_count === (g.game.fps * 3 + 10)) {
		// 	bgm_player.play(scene.assets[conf.audio.bgm.play]);
		// 	return;
		// }
		if (current_count === (g.game.fps *2 + 10)) {
			voice_player.play(scene.assets.info_girl1_info_girl1_ready1);
			return;
		}
		if (current_count % g.game.fps != 0) return;
		var cn = current_count / g.game.fps;
		starting_dialog.text[1].text = cn.toString();
		starting_dialog.text[1].invalidate();
		if (cn != 0) return;
		play_status.phase = 9;
		voice_player.play(scene.assets.info_girl1_info_girl1_go2);
		starting_dialog.text[1].update.remove(countdown_timer);
		starting_dialog.group.hide();
		scene.setTimeout(game_timeout, game_milliseconds);
	});

}
module.exports.start_sync_timer = start_sync_timer;

function after_goal(mes) {
	if (play_status.phase === 10) return; // avoid goal and timeup
	play_status.phase = 10;
	// bgm_player.stop();
	var is_goal = (mes.data.score.time === undefined ? false : true);
	if (is_goal) {
		voice_player.play(scene.assets.info_girl1_info_girl1_goal1);
		audience_player.play(scene.assets.people_people_stadium_cheer1);
		var q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'ゴール！'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
				{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (mes.data.player_index + 1) + ': ' + mes.data.score.time + '/' + mes.data.score.n_dollar},
				{x: 4, y:  14 + 18*3, font_size: 16, s: 'タップすると結果を表示します'},
			],
			callback_function: game_set,
		};
	}
	else {
		voice_player.play(scene.assets.info_girl1_info_girl1_timeup2);
		q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'タイムアップ！'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
				{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (mes.data.player_index + 1) + ': なし/' + mes.data.score.n_dollar},
				{x: 4, y:  14 + 18*3, font_size: 16, s: 'タップすると結果を表示します'},
			],
			callback_function: game_set,
		};
	}
	starting_dialog.set_text(q);
}
module.exports.after_goal = after_goal;

function game_set(mes) {
	play_status.phase = 11;
	// bgm_player.stop();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '途中結果'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		],
		callback_function: game_result,
	};
	starting_dialog.set_text(q);
}
module.exports.elimination_game_set =  elimination_game_set;

function game_result(mes) {
	play_status.phase = 12;
	se_player.play(scene.assets.decision3);
	voice_player.play(scene.assets.line_girl1_line_girl1_kekkawohappyoushimasu1);
	bgm_player.play(scene.assets[conf.audio.bgm.util]);
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'レース結果'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると収支を計算します'},
		],
		callback_function: result_balance,
	};
		// will code login, here
	play_status.match++;
	starting_dialog.set_text(q);
	// starting_dialog.group.show();
}
module.exports.game_set = game_set;

function result_balance(mes) {
	play_status.phase = 13;
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'レースの収支'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると次のレースをします'},
		],
		callback_function: configure_game,
	};
	starting_dialog.set_text(q);
	scene.update.remove(view_piece_handler);
}

function view_piece_handler() {
	var xy = {
		x: dd[view_piece_index].group.tag.global.x + dd[view_piece_index].group.tag.global.width / 2,
		y: dd[view_piece_index].group.tag.global.y + dd[view_piece_index].group.tag.global.height / 2,
	};
	lpv.x = -(xy.x - cv0[0])/8;
	lpv.y = -(xy.y - cv0[1])/8;
}
function piece_handler() {
	// console.log(check_index);
	if (!check_area[check_index].validate(dd[piece_index])) return;
	var t = g.game.age - play_status.starting_age;
	dd[piece_index].group.tag.global.score.time = t;
	dd[piece_index].group.tag.global.score.n_dollar += check_area[check_index].group.tag.global.n_dollar;
	var n_dollar = dd[piece_index].group.tag.global.score.n_dollar;
	pop.set_line_message(dd[piece_index].report_check_point(t, check_area[check_index]));
	check_area[check_index].set_status(3);
	if (check_index >= check_area.length - 1) {// <----
		// console.log(piece_handler_destination);
		var mes = {
			data: {
				destination: piece_handler_destination,
				player_index: player_index,
				piece_index: piece_index,
				score: {
					time:t,
					n_dollar: n_dollar,
				},
			}
		};
		scene.message.fire(mes);
		scene.update.remove(piece_handler);
		return;
	}
	else {
		se_player.play(scene.assets.decision9);
	}
	check_index++;
	check_area[check_index].set_status(2);
}

