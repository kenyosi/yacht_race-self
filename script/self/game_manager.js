/*
 * Starting countdown
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var default_message_sec = 7;
var ready_go_sec         = 6;
var elimination_game_sec = 15;
var elimination_game_milliseconds = elimination_game_sec * 1000;
var game_sec = 15;
var game_milliseconds = game_sec * 1000;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization

var bgm = new g.MusicAudioSystem('bgm', g.game);
var bgm_player = bgm.createPlayer();
var se = new g.SoundAudioSystem('se', g.game);
var se_player = se.createPlayer();
var voice = new g.SoundAudioSystem('voice', g.game);
var voice_player = voice.createPlayer();
var audience = new g.SoundAudioSystem('audience', g.game);
var audience_player = audience.createPlayer();

var bcast_message_event = new g.MessageEvent({}, undefined, false, 1);

var scene;
// var navigation_scene;

var starting_dialog;
// play_status.phase
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
var play_status = {
	phase: 0,
	round: 0,
	starting_age: undefined,
	ending_age: undefined,
	end_wait_elimination_age: undefined,
	elimination_round_player: [],
	round_player: [],
};
var number_count_down_pointer; // testing purpose

var score                      = require('../score');
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
var player_index = -1;      // -1 means anonimous user
var view_player_index = -1; // -1 means anonimous user
var current_count;
var piece_handler_destination;
var check_area = [];
var cv0 = [
	conf.local.area.x + conf.local.area.width / 2 + 3 * (1 - 8) * conf.local.area.width,
	conf.local.area.y + conf.local.area.height / 2 + 3 * (1 - 8) * conf.local.area.height,
];
var check_index = 0;

var initial_lpv = {
	x: -(0 - cv0[0])/8,
	y: -(0 - cv0[1])/8,
};

var dd = [];
var score_realtime;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.play_status = play_status;
module.exports.dd = dd;
module.exports.score_realtime = score_realtime;

function set_scene(sc, nv) {
	scene = sc;
	navigation_scene = nv;
	score.set_scene(scene);
	op.set_scene(scene);
}
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
	score_realtime = new score.realtime();
	p = dialog.default_parameters;
	starting_dialog = new dialog.normal(p);
	// var countdown_line = 2;
	// number_count_down_pointer = starting_dialog.text[countdown_line];
	bgm_player.play(scene.assets[conf.audio.bgm.util]);
	// configure_game();
	// scene.setInterval(function(){
	// 	console.log('hb');
	// }, 1000);
}
module.exports.init_game = init_game;

// function configure_game () {
function start () {
	// console.log(scene);
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
		++ii;
	}
	check_area[0].set_status(2);
	piece.set_initial_operation();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'ヨットレース、ガイド'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'ヨットでゴールを目指します'},
			{x: 4, y:  14 + 18*3, font_size: 16, s: '予選と本戦が1サイクルです'},
			{x: 4, y:  14 + 18*4, font_size: 16, s: '予選は誰でも参加できます'},
			{x: 4, y:  14 + 18*5, font_size: 16, s: '本戦は予選の上位' + conf.players.max_sync_players +'名が出ます'},
			{x: 4, y:  14 + 18*6, font_size: 16, s: 'スタート位置はタイム順です'},
			{x: 4, y:  14 + 18*7, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*8, font_size: 16, s: '出場しなくても楽しめます'},
			{x: 4, y:  14 + 18*9, font_size: 16, s: 'どの選手が勝つのか賭けることができます'},
			{x: 4, y:  14 + 18*10, font_size: 16, s: 'レースに風を起こすことができます'},
		],
		callback_function: {
			tap: register_game,
			timeout: register_game,
			// tap: sw_scene,
			// timeout: sw_scene,
		},
		count_down: default_message_sec,
	};
	starting_dialog.set_text(q);
}
module.exports.start = start;

// function sw_scene() {
// 	g.game.replaceScene(navigation_scene, true);
// 	console.log('after sw');
// }

function register_game () {
	play_status.phase = 1;
	scene.assets['decision3'].play();
	console.log(player_index);
	console.log(player.current);
	console.log(g.game.player);

	wm.local_scene_player[conf.players.max_sync_players].set_local_scene(); //<--- conf.players.max_async_players, // leads no player
	piece_index = conf.players.max_sync_players;
	view_piece_index = conf.players.max_sync_players;

	play_status.elimination_round_player =[];
	score_realtime.clear_score();
	score_realtime.pane.show();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '予選の参加受付'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: '誰でも参加できます'},
			{x: 4, y:  14 + 18*3, font_size: 16, s: 'タップしてタイムアタックして下さい'},
			{x: 4, y:  14 + 18*4, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*5, font_size: 16, s: 'スロットルとラダーでヨットを動かします'},
			{x: 4, y:  14 + 18*6, font_size: 16, s: '風に乗れば加速します'},
			{x: 4, y:  14 + 18*7, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*8, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*9, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*10, font_size: 16, s: ''},
		],
		callback_function: {
			tap: elimination_start_async,
			timeout: undefined,
		},
		count_down: default_message_sec,
	};
	starting_dialog.set_text(q);
	var registration_closing = scene.setInterval(function (){
		if (play_status.phase != 1) {scene.clearInterval(registration_closing); return;}
		// if (score_realtime.get_number_of_participants() < conf.players.min_elimination_players) return;
		play_status.phase = 2;
		console.log('reach to min. num players');
		// scene.clearInterval(registration_closing);
		q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'まもなく予選の参加受付を終了します'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*2, font_size: 16, s: '誰でも参加できます'},
				{x: 4, y:  14 + 18*3, font_size: 16, s: 'タップしてタイムアタックして下さい'},
				{x: 4, y:  14 + 18*4, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*5, font_size: 16, s: 'スロットルとラダーでヨットを動かします'},
				{x: 4, y:  14 + 18*6, font_size: 16, s: '風に乗れば加速します'},
				{x: 4, y:  14 + 18*7, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*8, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*9, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*10, font_size: 16, s: ''},
			],
			callback_function: {
				tap: elimination_start_async,
				timeout: elimination_game_wait,
			},
			count_down: default_message_sec,
		};
		starting_dialog.set_text(q);		
	}, 1000);
}
module.exports.register_game = register_game;

function elimination_start_async() {
	play_status.phase = 3;
	se_player.play(scene.assets.decision3);

	player_index = player.join(g.game.player);// login, here
	view_player_index = player_index;
	wm.local_scene_player[elimination_piece_index].set_local_scene(); //<--- piece index
	piece_index = elimination_piece_index;
	view_piece_index = elimination_piece_index;

	pop.set_default();
	pop.set_player_index(player_index);
	pop.set_view_player_index(view_player_index);
	pop.set_piece_index(elimination_piece_index);
	pop.set_view_piece_index(elimination_piece_index);

	dd[elimination_piece_index].set_player_index(player_index);
	dd[elimination_piece_index].set_view_player_index(view_player_index);

	// send initial state to score board
	bcast_message_event.data.destination = 'score_file';
	bcast_message_event.data.player_index = player_index;
	bcast_message_event.data.piece_index = elimination_piece_index; // <-- tentative
	bcast_message_event.data.check_index = -1;
	bcast_message_event.data.time = 0;
	bcast_message_event.data.n_dollar = 0;
	g.game.raiseEvent(bcast_message_event);

	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: player.current[player_index].head + 'で受付けました'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: ''},
		],
		callback_function: {
			tap: undefined,
			timeout: undefined,
		},
	};
	starting_dialog.set_text(q);

	play_status.starting_age = g.game.age + g.game.fps * ready_go_sec;
	play_status.ending_age   = g.game.age + g.game.fps * (ready_go_sec + game_sec);
	var mes = {
		data: {
			destination: 'game_manager_elimination_start_async_timer',
			player_index: player_index,
			value: play_status,
		}
	};
	//initialize view
	view_piece_handler();
	piece_handler();
	scene.message.fire(mes);
}

function elimination_start_async_timer(mes) {
	bgm_player.stop();
	play_status = mes.data.value;
	play_status.phase = 3;
	scene.assets['info_girl1_info_girl1_zyunbihaiikana1'].play();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '予選'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'スタートまで'},
			{x: 4, y:  14 + 18*3, font_size: 32, s: Math.ceil((play_status.starting_age - g.game.age) / g.game.fps).toString()},
			{x: 4, y:  14 + 18*6, font_size: 16, s: 'スロットルとラダーはスタート後、使います'},
			{x: 4, y:  14 + 18*7, font_size: 16, s: '風に乗ればヨットは加速します'},
			{x: 4, y:  14 + 18*8, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*9, font_size: 16, s: ''},
		],
		callback_function: {
			tap: undefined,
			timeout: undefined,
		},
	};
	starting_dialog.set_text(q);
	var countdown_line = 2;
	starting_dialog.text[countdown_line].update.add(function elimination_countdown_timer(){
	// number_count_down_pointer.update.add(function elimination_countdown_timer(){
		if (play_status.phase !== 3) return;
		current_count = play_status.starting_age - g.game.age;
		if (current_count === (g.game.fps * 3 + 10)) {
			bgm_player.play(scene.assets[conf.audio.bgm.play]);
			piece_handler_destination = 'game_manager_elimination_after_goal';
			scene.update.add(view_piece_handler);
			scene.update.add(piece_handler);
			return;
		}
		if (current_count === (g.game.fps *2 + 10)) {
			voice_player.play(scene.assets.info_girl1_info_girl1_ready1);
			return;
		}
		if (current_count % g.game.fps != 0) return;
		var cn = current_count / g.game.fps;
		starting_dialog.text[countdown_line].text = cn.toString();
		starting_dialog.text[countdown_line].invalidate();
		// number_count_down_pointer.text = cn.toString();
		// number_count_down_pointer.invalidate();
		if (current_count > 0) return;
		play_status.phase = 4;
		voice_player.play(scene.assets.info_girl1_info_girl1_go2);
		starting_dialog.group.hide();
		starting_dialog.text[countdown_line].update.remove(elimination_countdown_timer);
		// number_count_down_pointer.update.remove(elimination_countdown_timer);
	});

}
module.exports.elimination_start_async_timer = elimination_start_async_timer;

function elimination_game_wait(mes) {
	play_status.phase = 6;
	play_status.starting_age = g.game.age + g.game.fps * ready_go_sec;
	play_status.ending_age   = g.game.age + g.game.fps * (ready_go_sec + game_sec);
	// var waiting_sec = (play_status.end_wait_elimination_age -  g.game.age) / g.game.fps;
	var waiting_sec = (play_status.ending_age -  g.game.age) / g.game.fps;
	// var end_age_of_elimination = 
	console.log(waiting_sec);
	console.log(piece_index);
	// bgm_player.stop();
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '予選中です'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: '結果が揃うまで'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'しばらくお待ち下さい'},
		],
		callback_function: {
			tap: undefined,
			// timeout: bidding_game,
			timeout: undefined,
		},
		count_down: waiting_sec,
	};
	starting_dialog.set_text(q);
	piece_handler_destination = 'game_manager_elimination_after_goal';
	// scene.update.add(view_piece_handler); // no mean
	scene.update.add(piece_handler);
	// scene.update.add(function elimination_wait(){
	// 	if (g.game.age > play_status.ending_age) {
	// 		game_timeout();
	// 		return;
	// 	}
	// });
}
module.exports.elimination_game_wait =  elimination_game_wait;

function game_timeout() {
// function game_timeout(destionation_function) {
	var n_dollar = 0;
	console.log('game_timeout');
	console.log(piece_index);

	if (piece_index !== conf.players.max_sync_players) {
		n_dollar = dd[piece_index].group.tag.global.score.n_dollar;
	}
	var mes = {
		data: {
			destination: piece_handler_destination,
			// destination: destionation_function,
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
	console.log('elimination_after_goal');
	if (play_status.phase !== 4 && play_status.phase !== 6) return; // avoid come here twice at goal and timeup 
	play_status.phase = 5;
	// bgm_player.stop();
	var is_goal = (mes.data.score.time === undefined ? false : true);
	// var waiting_sec = (play_status.end_wait_elimination_age -  g.game.age) / g.game.fps;
	//////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////
	var waiting_sec = 6; // not determined here now!
	//////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////
	if (is_goal) {
		// scene.clearTimeout(game_timeout); //doesn't work
		voice_player.play(scene.assets.info_girl1_info_girl1_goal1);
		var q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'ゴール！'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
				{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (mes.data.player_index + 1) + ': ' + mes.data.score.time + '/' + mes.data.score.n_dollar},
				{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*4, font_size: 16, s: '予選結果がそろうまで'},
				{x: 4, y:  14 + 18*5, font_size: 16, s: 'しばらくお待ち下さい'},
			],
			callback_function: {
				tap: undefined,
				timeout: bidding_game,
			},
			// count_down: default_message_sec,
			count_down: waiting_sec,
		};
	}
	else {
		voice_player.play(scene.assets.info_girl1_info_girl1_timeup2);
		q = {
			text: [
				{x: 4, y:  14 + 18*0, font_size: 16, s: 'タイムアップ！'},
				{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
				{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (mes.data.player_index + 1) + ': なし/' + mes.data.score.n_dollar},
				{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
				{x: 4, y:  14 + 18*4, font_size: 16, s: '集計中です'},
				{x: 4, y:  14 + 18*5, font_size: 16, s: 'しばらくお待ち下さい'},
			],
			callback_function: {
				tap: undefined,
				timeout: bidding_game,
			},
			// count_down: default_message_sec,
			count_down: waiting_sec,
		};
	}
	scene.update.remove(view_piece_handler); //<-- added in phase 3
	scene.update.remove(piece_handler);      //<-- added in phase 3
	starting_dialog.set_text(q);
}
module.exports.elimination_after_goal = elimination_after_goal;



function bidding_game(mes) {
	play_status.phase = 7;
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
			{x: 4, y:  14 + 18*0, font_size: 16, s: '予選結果と賭けの対象の表示(TBD)'},
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
			tap: game_matching,
			timeout: game_matching,
		},
		count_down: default_message_sec,
	};
	// tentative scoring board
	// var r = [global_score, fi.player_index, fi.check_index, fi.time, fi.n_dollar];
	var sr = score_realtime.get_result();
	var sb = score_realtime.get_best();
	console.log(sr);
	var n_players = (sr.length > conf.players.max_sync_players ? conf.players.max_sync_players : sr.length);
	var is_ranked = false;
	var result_line;
	ii = 0;
	console.log(player_index);
	while (ii < n_players) {
		var result_player_index = sr[ii][1];
		result_line = (ii+1) + '位, P' + (result_player_index+1);
		if (sr[ii][2] === 2) result_line += ', タイム=' +  sr[ii][3];
		if (sb[result_player_index].check_index === 2) result_line += ', ベスト=' + sb[result_player_index].time;
		if (result_player_index == player_index) {
			is_ranked = true;
			q.text[ii + 1].textColor = '#FF0000';
			result_line += ' ←あなた';
		}
		q.text[ii + 1].s = result_line;
		++ii;
	}
	starting_dialog.set_text(q);
}
module.exports.bidding_game =  bidding_game;

function game_matching(mes) {
	console.log('game_matching');
	play_status.phase = 8;

	// re-address piece index here
	// var r = [global_score, fi.player_index, fi.check_index, fi.time, fi.n_dollar];
	var sr = score_realtime.get_result();
	score_realtime.clear_score();
	var n_players = (sr.length > conf.players.max_sync_players ? conf.players.max_sync_players : sr.length);

	var ii = 0;
	while (ii < n_players) {
		dd[ii].set_player_index(sr[ii][1]);
		dd[ii].set_view_player_index(player_index);
		if (sr[ii][1] === player_index) {
			// set scene for the player
			wm.local_scene_player[ii].set_local_scene();
			piece_index = ii;
			view_piece_index = ii;
			// set opration GUI
			pop.set_default();
			pop.set_player_index(player_index);
			pop.set_view_player_index(view_player_index);
			pop.set_piece_index(ii);
			pop.set_view_piece_index(ii);

			// send initial state to score board
			bcast_message_event.data.destination = 'score_file';
			bcast_message_event.data.player_index = player_index;
			bcast_message_event.data.piece_index = piece_index; // <-- tentative
			bcast_message_event.data.check_index = -1;
			bcast_message_event.data.time = 0;
			bcast_message_event.data.n_dollar = 0;
			g.game.raiseEvent(bcast_message_event);
		}
		++ii;
	}
	while (ii < conf.players.max_sync_players) {
		dd[ii].set_player_index(conf.players.max_async_players); // leads no player
		dd[ii].set_view_player_index(-1);
		++ii;
	}

	console.log(player.current);
	console.log(g.game.player);

	// sync this timer over players
	// if (player_index !== 0) return;
	if (player.current[0].id !== g.game.player.id) return;
	// scene.message.fire({data: { /* doesn't work */ }});
	bcast_message_event.data = {
		destination: 'game_manager_game_start_sync_count_down',
		starting_age: g.game.age + g.game.fps * ready_go_sec,
		ending_age: g.game.age + g.game.fps * (ready_go_sec + game_sec), // tentative number
	};
	g.game.raiseEvent(bcast_message_event);
	// async version
	// var age = play_status.end_wait_elimination_age;
	// play_status.starting_age = age + (ready_go_sec + default_message_sec) * g.game.fps;
	// play_status.ending_age   = play_status.starting_age + game_sec * g.game.fps;
	// game_start_sync_count_down();
}

function game_start_sync_count_down(mes) {
// function game_start_sync_count_down() {
	console.log('game_start_sync_count_down');
	console.log(mes);
	play_status.phase = 8;
	scene.assets['info_girl1_info_girl1_zyunbihaiikana1'].play();
	play_status.starting_age = mes.data.starting_age;
	play_status.ending_age   = mes.data.ending_age;
	piece_handler_destination = 'game_manager_after_goal';
	console.log('here0');
	view_piece_handler();
	console.log('here1');
	piece_handler();
	console.log('here2');

	view_player_index = player_index;

	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: '本戦'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'スタートまで'},
			{x: 4, y:  14 + 18*3, font_size: 32, s: Math.ceil((play_status.starting_age - g.game.age) / g.game.fps).toString()},
			{x: 4, y:  14 + 18*6, font_size: 16, s: 'スロットルとラダーはスタート後、使います'},
			{x: 4, y:  14 + 18*7, font_size: 16, s: '風に乗ればヨットは加速します'},
		],
		callback_function: {
			tap: undefined,
			timeout: undefined,
		},
	};
	starting_dialog.set_text(q);
	console.log('here3');
	var countdown_line = 2;
	starting_dialog.text[countdown_line].update.add(function countdown_timer(){
	// number_count_down_pointer.update.add(function countdown_timer(){
		console.log(g.game.age +','+ play_status.starting_age);
		if (play_status.phase !== 8) return;
		current_count = play_status.starting_age - g.game.age;
		if (current_count === (g.game.fps *2 + 10)) {
			voice_player.play(scene.assets.info_girl1_info_girl1_ready1);
			scene.update.add(view_piece_handler);
			scene.update.add(piece_handler);
			return;
		}
		if (current_count % g.game.fps != 0) return;
		var cn = current_count / g.game.fps;
		starting_dialog.text[countdown_line].text = cn.toString();
		starting_dialog.text[countdown_line].invalidate();
		// number_count_down_pointer.text = cn.toString();
		// number_count_down_pointer.invalidate();
		if (current_count > 0) return;
		play_status.phase = 9;
		voice_player.play(scene.assets.info_girl1_info_girl1_go2);
		starting_dialog.group.hide();
		starting_dialog.text[countdown_line].update.remove(countdown_timer);
		// number_count_down_pointer.update.remove(countdown_timer);
	});
}
module.exports.game_start_sync_count_down = game_start_sync_count_down;

function after_goal(mes) {
	if (play_status.phase !== 9) return; // avoid come here twice at goal and timeup 
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
			callback_function: {
				tap: game_set,
				timeout: game_set,
			},
			count_down: default_message_sec,
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
			callback_function: {
				tap: game_set,
				timeout: game_result,
			},
			count_down: default_message_sec,
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
		callback_function: {
			tap: game_result,
			timeout: game_result,
		},
		count_down: (play_status.ending_age - g.game.age) / g.game.fps + default_message_sec,

	};
	starting_dialog.set_text(q);
}
module.exports.game_set =  game_set;

function game_result(mes) {
	play_status.phase = 12;
	se_player.play(scene.assets.decision3);
	voice_player.play(scene.assets.line_girl1_line_girl1_kekkawohappyoushimasu1);
	bgm_player.play(scene.assets[conf.audio.bgm.util]);
	scene.update.remove(view_piece_handler);
	scene.update.remove(piece_handler);
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'レース結果'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'タップすると収支を計算します'},
		],
		callback_function: {
			tap: result_balance,
			timeout: result_balance,
		},
		count_down: 10,

	};
	play_status.match++;
	starting_dialog.set_text(q);
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
		callback_function: {
			tap: start,
			timeout: start,
			// tap: pass_though,
			// timeout: pass_though,
		},
		count_down: 10,
	};
	starting_dialog.set_text(q);

}

// function pass_though() {}
function watch_game_handler() {
	if (g.game.age > play_status.ending_age) game_timeout();
}

function view_piece_handler() {
	if (view_piece_index >= conf.players.max_sync_players || view_piece_index < 0) return;
	var xy = {
		x: dd[view_piece_index].group.tag.global.x + dd[view_piece_index].group.tag.global.width / 2,
		y: dd[view_piece_index].group.tag.global.y + dd[view_piece_index].group.tag.global.height / 2,
	};
	lpv.x = -(xy.x - cv0[0])/8;
	lpv.y = -(xy.y - cv0[1])/8;
}
function piece_handler() {
	// console.log(check_index);
	// if (play_status.phase === 6) {
	// 	if (g.game.age > play_status.ending_age) game_timeout();
	// 	return;
	// }
	console.log(g.game.age + ', ' + play_status.ending_age + ', ' + play_status.phase + ', ' + piece_index);
	if (play_status.phase !== 4 && play_status.phase !== 9 && play_status.phase !== 6) return;
	if (g.game.age > play_status.ending_age) {
		game_timeout();
		return;
	}
	if (play_status.phase !== 4 && play_status.phase !== 9) return;
	if (piece_index == conf.players.max_sync_players) return;
	if (check_index >= check_area.length) return;
	if (!check_area[check_index].validate(dd[piece_index])) return;
	// console.log(check_index);
	var t = g.game.age - play_status.starting_age;
	dd[piece_index].group.tag.global.score.time = t;
	dd[piece_index].group.tag.global.score.n_dollar += check_area[check_index].group.tag.global.n_dollar;
	var n_dollar = dd[piece_index].group.tag.global.score.n_dollar;
	pop.set_line_message(dd[piece_index].report_check_point(t, check_area[check_index]));
	check_area[check_index].set_status(3);
	bcast_message_event.data.destination = 'score_file';
	bcast_message_event.data.player_index = player_index;
	bcast_message_event.data.piece_index = piece_index;
	bcast_message_event.data.check_index = check_index;
	bcast_message_event.data.time = t;
	bcast_message_event.data.n_dollar = n_dollar;
	g.game.raiseEvent(bcast_message_event);
	if (check_index >= check_area.length - 1) {// <----
		var mes = {data: {
			destination: piece_handler_destination,
			// destination: destination,
			player_index: player_index,
			piece_index: piece_index,
			score: {
				check_index: check_index,
				time:t,
				n_dollar: n_dollar,
			},}};
		// scene.message.fire(mes);
		// scene.update.remove(piece_handler);
		tentative_goal(player_index, t, n_dollar);
		check_index++;
		return;
	}
	else {
		se_player.play(scene.assets.decision9);
		check_index++;
	}
	check_area[check_index].set_status(2);
}

function set_age_min_players_attended (mes) {
	// console.log('set_age_min_players_attended');
	// console.log(mes);
	var age = mes.data.age;
	var end_age = age +
	// (default_message_sec + ready_go_sec + elimination_game_sec + default_message_sec) * g.game.fps;
	(default_message_sec + ready_go_sec + elimination_game_sec) * g.game.fps;
	play_status.end_wait_elimination_age = end_age;
}
module.exports.set_age_min_players_attended = set_age_min_players_attended;

function tentative_goal(player_index, time, n_dollar){
	voice_player.play(scene.assets.info_girl1_info_girl1_goal1);
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'ゴール！'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'プレイヤー: タイム/稼ぎ'},
			{x: 4, y:  14 + 18*2, font_size: 16, s: 'P' + (player_index + 1) + ': ' + time + '/' + n_dollar},
			{x: 4, y:  14 + 18*3, font_size: 16, s: ''},
			{x: 4, y:  14 + 18*4, font_size: 16, s: '結果がそろうまで'},
			{x: 4, y:  14 + 18*5, font_size: 16, s: 'しばらくお待ち下さい'},
		],
		callback_function: {
			tap: undefined,
			timeout: undefined,
		},
		count_down: undefined,
	};
	starting_dialog.set_text(q);
}

// function broadcast_message() {
// 	// send satisfy min number of player to all to determine end age of elimination
// 	var current_age = g.game.age;
// 	bcast_message_event.data.destination = 'game_manager_set_age_min_player_attended';
// 	bcast_message_event.data.age = current_age;
// 	bcast_message_event.data.n_players = current.length;
// 	g.game.raiseEvent(bcast_message_event);
// }
