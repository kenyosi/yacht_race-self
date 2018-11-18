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
	direction: 0.0,
	rudder: 0.0,
	throttle: 0.0,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var race                       = require('./race');
var piece                      = require('./piece');
var op                         = require('./operation');
// var set_inital_locations       = require('./set_initial_locations');
var game_manager               = require('./self/game_manager');
var wm                         = require('./self/window_manager');
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
	race.set_scene(scene);
	piece.set_scene(scene);
	op.set_scene(scene);
	wm.set_scene(scene);
	game_manager.set_scene(scene);
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
			width: conf.local.area.width *7,
			// width: conf.local.area.width * scale.ix,
			height: conf.local.area.height * 7,
			angle: 0,
			scaleX: scale.x,
			scaleY: scale.y,
			touchable: true,
			cssColor: '#AAAAAA'
		});
		pa.append(lpv);
		// console.log(lpv);
		lpv.pointUp.add(function (ev) {
			// console.log(game_manager.dd);
			scene.assets['jump1'].play();
			var x = ev.point.x - 15.5;
			var y = ev.point.y - 15.5;
			var ii = 0;
			while(ii < game_manager.dd.length) {
				var dx = game_manager.dd[ii].group.tag.global.center_x - x;
				var dy = game_manager.dd[ii].group.tag.global.center_y - y;
				var dxy = dx * dx + dy * dy;
				var force = 100000 / dxy;

				var deg = Math.atan2(dy, dx);
				var ddeg = deg - game_manager.dd[ii].group.tag.global.direction;
				force *= Math.cos(ddeg);
				// console.log(dxy);
				// console.log(force);
				game_manager.dd[ii].group.tag.global.speed += force;
				// console.log(dx);
				// console.log(dy);
				ii++;
			}

			var sprite = new g.Sprite({
				scene: scene,
				src: scene.assets['item_icons'],
				opacity: 1.0,
				x: x,
				y: y,
				height: 64,
				width: 64,
				angle: 0,
				srcX: 0,
				srcY: 0,
				srcHeight: 64,
				srcWidth: 64,
				scaleX: 1,
				scaleY: 1,
			});
			lpv.append(sprite);
			sprite.update.add(function () {
				sprite.opacity -= 0.025;
				if (sprite.opacity <= 0.0) {
					sprite.destroy();
					return;
				}
				// console.log('up lpv');
				sprite.scaleX += 0.25;
				sprite.scaleY += 0.25;
				sprite.modified();
			});

			// console.log('up lpv');
			// console.log(ev);
		});
		// pa.pointDown.add(function () {
		// 	console.log('down pa');
		// });
		game_manager.init_game(lpv);
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Create window manager
		scene.setTimeout(function() {wm.create();}, 100);
	});
	// scene.pointDownCapture.add(function (ev) {
	// 	console.log(ev);
	// 	console.log(wm.local_scene_player[2]);
	// });
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
