/*
 * reversi@self
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
	direction: 0*0.3,
	rudder: 0*0.01, // approximate
	throttle: 0.00,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var race                       = require('./race');
var piece                      = require('./piece');
var op                         = require('./operation');
// var set_inital_locations       = require('./set_initial_locations');
var starting_countdown         = require('./self/starting_countdown');
var wm                         = require('./self/window_manager');
// var local_scene                = require('./self/local_scene');
// var two_pi_to_360 = 360.0 / (2.0 * Math.PI);
var dd = [];
var lpv = {x: 0, y: 0};
var pop;
// var cs = conf.cell.array;
// var csm1 = conf.cell.unit_m1;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.self_view = self_view;
module.exports.dd = dd;
module.exports.pop = pop;
module.exports.lpv = lpv;

function scene_loaded(scene) {

	var ii = -1;
	while(ii < 2) {
		// wm.local_scene_player[ii].set_local_zero({x: self_view.x, y: self_view.y});
		// wm.local_scene_player[ii].set_angle(self_view.direction * two_pi_to_360);
		// wm.local_scene_player[ii].set_local_scene();
		ii++;
	}
	// local plan view
	var pa = new g.Pane({
		scene: scene,
		x: conf.local.area.x,
		y: conf.local.area.y,
		width: conf.local.area.width,
		height: conf.local.area.height,
	});
	scene.append(pa);
	lpv = new g.E({
		scene: scene,
		x: conf.local.area.x,
		y: conf.local.area.y,
		width: conf.local.area.width,
		height: conf.local.area.height,
		angle: 0,
		scaleX: 0.125,
		scaleY: 0.125,
		touchable: true,
	});
	pa.append(lpv);
	starting_countdown.set_lpv(lpv);

	// check area
	var check_area = [];
	var details = {
		local_scene: lpv,
		x: 500,
		y: 0,
		width: 500,
		height: 500,
		speed: 0,
		direction: 0,
		rudder: 0,
		throttle: 0,
		player_index: -1,
		status_index: 2,
		name: 'チェック1',
		piece: {
			scene: scene,
			// src: scene.assets['boat_simple'],
			opacity: 1.0,
			width: conf.yacht.width,
			height: conf.yacht.height,
			srcX: conf.yacht.other.srcX,
			srcY: conf.yacht.other.srcY,
			srcWidth: conf.yacht.width,
			srcHeight: conf.yacht.height,
		},
		initial: {
			index: 0,
			piece: 0,
		},
	};
	check_area[0] = new race.check_area(details);

	details = {
		local_scene: lpv,
		x: 500 + 600,
		y: 300,
		width: 500,
		height: 500,
		speed: 0,
		direction: 0,
		rudder: 0,
		throttle: 0,
		player_index: -1,
		status_index: 1,
		name: 'チェック2',
		piece: {
			scene: scene,
			// src: scene.assets['boat_simple'],
			opacity: 1.0,
			width: conf.yacht.width,
			height: conf.yacht.height,
			srcX: conf.yacht.other.srcX,
			srcY: conf.yacht.other.srcY,
			srcWidth: conf.yacht.width,
			srcHeight: conf.yacht.height,
		},
		initial: {
			index: 0,
			piece: 0,
		},
	};
	check_area[1] = new race.check_area(details);

	details = {
		local_scene: lpv,
		x: 500 + 600 + 600,
		y: 300 + 600,
		width: 500,
		height: 500,
		speed: 0,
		direction: 0,
		rudder: 0,
		throttle: 0,
		player_index: -1,
		status_index: 1,
		name: 'ゴール',
		piece: {
			scene: scene,
			// src: scene.assets['boat_simple'],
			opacity: 1.0,
			width: conf.yacht.width,
			height: conf.yacht.height,
			srcX: conf.yacht.other.srcX,
			srcY: conf.yacht.other.srcY,
			srcWidth: conf.yacht.width,
			srcHeight: conf.yacht.height,
		},
		initial: {
			index: 0,
			piece: 0,
		},
	};
	check_area[2] = new race.check_area(details);


	// yachts tentative
	ii = 0;
	while(ii < 2) {
		details = {
			local_scene: lpv,
			x: conf.players.window_pointer[ii].x,
			y: conf.players.window_pointer[ii].y,
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
		dd[ii].set_view_player_index(2);
		ii++;
	}

	var test = new starting_countdown.joining();
	var check_index = 0;
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var cv0 = [
		conf.local.area.x + conf.local.area.width / 2,
		conf.local.area.y + conf.local.area.height / 2
	];
	var in_goal = false;

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Create window manager
	scene.setTimeout(function() {wm.create();}, 100);

	scene.update.add(function() {
		if (dd[2] === undefined) return;
		if (dd[2].player_index < 0) return; // <- tantative
		var xy = {
			x: dd[2].group.tag.global.x + dd[2].group.tag.global.width / 2,
			y: dd[2].group.tag.global.y + dd[2].group.tag.global.height / 2,
			width: dd[2].group.tag.global.width,
			height: dd[2].group.tag.global.height,
		};
		lpv.x = -(xy.x - cv0[0])/8;
		lpv.y = -(xy.y - cv0[1])/8;
		if (in_goal) return;
		if (check_area[check_index].validate(dd[2])) {
			var t = g.game.age - starting_countdown.race_status.starting_age;
			starting_countdown.pop.set_line_message('チェックタイム: ' + t);
			check_area[check_index].set_status(3);
			check_index++;
			if (check_index >= check_area.length) {
				starting_countdown.pop.set_line_message('ゴールタイム: ' + t);
				in_goal = true;
				return;
			}
			check_area[check_index].set_status(2);
		}
	});


}

function main() {
	wm.init();
	var scene = new g.Scene({game: g.game, assetIds:
		['boat_simple', 'reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo']
	});
	wm.set_scene(scene);
	race.set_scene(scene);
	piece.set_scene(scene);
	op.set_scene(scene);
	starting_countdown.set_scene(scene);
	scene.loaded.add(function () {scene_loaded(scene);});
	g.game.pushScene(scene);
}
module.exports = main;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// function indTo2D(ii, dim) {
// 	var cood = [];
// 	cood[0] = ii % dim;
// 	cood[1] = (ii -  cood[0]) / dim;
// 	return cood;
// }

// function createBoard(p, player_index, scene) {
// 	var local_p = wm.local_scene_player[player_index].rect_forward_init(p);
// 	return new g.FilledRect({
// 		scene: scene,
// 		cssColor: conf.default_label.cssColor,
// 		opacity: conf.default_label.opacity,
// 		x: local_p.x,
// 		y: local_p.y,
// 		width: local_p.width,
// 		height: local_p.height,
// 		angle: local_p.angle360,
// 		scaleX: local_p.scaleX,
// 		scaleY: local_p.scaleY,
// 		tag: {
// 			global: p
// 		}
// 	});
// }
