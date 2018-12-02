/*
 * yacht_race@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                         = require('./content_config');
var default_message_sec = 7;
var ready_go_sec         = 6;
var elimination_game_sec = 15;
var elimination_game_milliseconds = elimination_game_sec * 1000;
var game_sec = 15;
var game_milliseconds = game_sec * 1000;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var dialog                       = require('./self/dialog');
var game_manager               = require('./self/game_manager');
var navi_scene;
var scene;
var board;

var se = new g.SoundAudioSystem('se', g.game);
var se_player = se.createPlayer();
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function create(sc) {
	scene = sc;
	navi_scene = new g.Scene({game: g.game, assetIds:
		['boat_simple', 'item_icons', 'reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo',
			'jump1', 'info_girl1_info_girl1_go2', 'info_girl1_info_girl1_goal1', 'info_girl1_info_girl1_ready1',
			'info_girl1_info_girl1_stop1', 'info_girl1_info_girl1_timeup2', 'people_people_stadium_cheer1',
			'info_girl1_info_girl1_zyunbihaiikana1', 'line_girl1_line_girl1_kekkawohappyoushimasu1', 
			'decision3', 'decision9', 'nc97718', 'nc10333']
	});
	se_player.changeVolume(conf.audio.se.volume);

	navi_scene.loaded.add(function () {
		dialog.set_scene(navi_scene);
		var	p = dialog.default_parameters;
        board = new dialog.normal(p);
        configure_game();
        console.log('after_configure_game');
	});
	return navi_scene;
}
module.exports.create = create;

function configure_game(){
	game_manager.play_status.phase = 0;
	var q = {
		text: [
			{x: 4, y:  14 + 18*0, font_size: 16, s: 'ヨットレース'},
			{x: 4, y:  14 + 18*1, font_size: 16, s: 'navi'},
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
		},
		count_down: default_message_sec,
	};
	board.set_text(q);
}
module.exports.configure_game = configure_game;

function register_game(){
	game_manager.play_status.phase = 1;
	se_player.play(navi_scene.assets.decision3);

	game_manager.score_realtime.clear_score();
	game_manager.score_realtime.pane.show();
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
	board.set_text(q);
	var registration_closing = navi_scene.setInterval(function (){
		if (play_status.phase != 1) {navi_scene.clearInterval(registration_closing); return;}
		if (game_manager.score_realtime.get_number_of_participants() < conf.players.min_elimination_players) return;
		game_manager.play_status.phase = 2;
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
				timeout: elimination_game_set,
			},
			count_down: default_message_sec,
		};
		starting_dialog.set_text(q);		
	}, 1000);

}

function elimination_start_async(){
	// g.game.replaceScene(scene, true);
}

