/*
 * yacht_race@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');

// local view points
var self_view = {
	x: 0,
	y: 0,
	width:conf.yacht.width,
	height:conf.yacht.height,
	speed: 0*+1.25*8,
	direction: 0.0,
	rudder: 0.0,
	throttle: 0.0,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var race                       = require('./race');
var piece                      = require('./piece');
// var op                         = require('./operation');
// var set_inital_locations       = require('./set_initial_locations');
var navigation                 = require('./navigation');
var game_manager               = require('./self/game_manager');
var wm                         = require('./self/window_manager');
var wind                       = require('./wind');
// var local_scene                = require('./self/local_scene');
// var two_pi_to_360 = 360.0 / (2.0 * Math.PI);
var dd = [];
var lpv = {x: 0, y: 0};
// var pop;
// var cs = conf.cell.array;
// var csm1 = conf.cell.unit_m1;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.self_view = self_view;
module.exports.dd = dd;
// module.exports.pop = pop;
module.exports.lpv = lpv;

function main() {
	wm.init();
	var scene = new g.Scene({game: g.game, assetIds:
		['boat_simple', 'item_icons', 'reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo',
			'jump1', 'info_girl1_info_girl1_go2', 'info_girl1_info_girl1_goal1', 'info_girl1_info_girl1_ready1',
			'info_girl1_info_girl1_stop1', 'info_girl1_info_girl1_timeup2', 'people_people_stadium_cheer1',
			'info_girl1_info_girl1_zyunbihaiikana1', 'line_girl1_line_girl1_kekkawohappyoushimasu1', 
			'decision3', 'decision9', 'nc97718', 'nc10333']
	});

	var navi_scene = navigation.create(scene);

	wind.set_scene(scene);
	race.set_scene(scene);
	piece.set_scene(scene);
	// op.set_scene(scene);
	wm.set_scene(scene);
	game_manager.set_scene(scene, navi_scene);

	scene.loaded.add(function () {
		// local plan view
		var pa = new g.Pane({
			scene: scene,
			x: conf.local.area.x,
			y: conf.local.area.y,
			width: conf.local.area.width,
			height: conf.local.area.height,
			touchable: true,
		});
		scene.append(pa);
		var scale = {x: 0.125, y: 0.125, ix: 8.0, iy: 8.0};
		// lpv = new g.E({
		lpv = new g.FilledRect({
			scene: scene,
			// x: conf.local.area.x,
			// y: conf.local.area.y,
			// width: conf.local.area.width,
			// height: conf.local.area.height,
			x: 0, // + conf.local.area.width * (1.0 - scale.ix) / 2.0,
			y: 0,
			// x: -3*conf.local.area.width ,
			// y: conf.local.area.y + conf.local.area.height * (1.0 - scale.iy) / 2.0,
			width: conf.local.area.width * 7,
			// width: conf.local.area.width * scale.ix,
			height: conf.local.area.height * 7,
			angle: 0,
			scaleX: scale.x,
			scaleY: scale.y,
			touchable: true,
			cssColor: '#AAAAAA',
			tag: {
				wind: {},
			},
		});
		pa.append(lpv);
		wind.set_lpv(lpv);
		lpv.pointDown.add(function (ev) {wind.point_down_timer(ev);});
		lpv.pointMove.add(function (ev) {wind.direct_dipole(ev);});
		lpv.pointUp.add(function (ev) {wind.emit(ev);});

		game_manager.init_game(lpv);
		// while(true) {
		console.log('new game');
		game_manager.start();
		// }
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Create window manager
		scene.setTimeout(function() {wm.create();}, 100);
	});
	g.game.pushScene(scene);

	
}
module.exports = main;

