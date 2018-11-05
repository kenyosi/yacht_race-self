/*
 * reversi@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var piece                      = require('./piece');
// var set_inital_locations       = require('./set_initial_locations');
var wm                         = require('./self/window_manager');
var local_scene                = require('./self/local_scene');
var two_pi_to_360 = 360.0 / (2.0 * Math.PI);

// var cs = conf.cell.array;
// var csm1 = conf.cell.unit_m1;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function main() {
	wm.init();
	var scene = new g.Scene({game: g.game, assetIds:
		['boat_simple', 'reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo']
	});
	wm.set_scene(scene);
	// stack.set_scene(scene);
	piece.set_scene(scene);
	scene.loaded.add(function () {
		// local view points
		var self_view = {
			x: 0,
			y: 0,
			width:conf.yacht.width,
			height:conf.yacht.height,
			speed: +0.25*8,
			direction: 0*0.3,
			rudder: 0.01, // approximate
		};
		var ii = -1;
		while(ii < 2) {
			wm.local_scene_player[ii].set_local_zero({x: self_view.x, y: self_view.y});
			wm.local_scene_player[ii].set_scale({x: 0.125, y: 0.125});
			wm.local_scene_player[ii].set_angle(self_view.direction * two_pi_to_360);
			wm.local_scene_player[ii].set_local_scene();
			ii++;
		}
		// yachts tentative
		ii = 0;
		var dd = [];
		while(ii < 2) {
			var details = {
				x: conf.players.window_pointer[ii].x,
				y: conf.players.window_pointer[ii].y,
				width: conf.yacht.width,
				height: conf.yacht.height,
				speed: 0*4,
				direction: 0,
				rudder: 0*4 / 360, // approximate
				player_index: ii,
				bw: ii,
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
			// console.log(dd[ii]);
			dd[ii].set_player_index(ii);
			dd[ii].set_view_player_index(2);

			ii++;
		}

		details = {
			x: g.game.width / 2  - conf.yacht.width / 2,
			y: g.game.height / 2 - conf.yacht.height / 2,
			width: conf.yacht.width,
			height: conf.yacht.height,
			speed: self_view.speed,
			direction: self_view.direction,
			rudder: self_view.rudder, // approximate
			player_index: 2,
			bw: ii,
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
		dd[2] = new piece.yacht(details);
		dd[2].set_player_index(2);
		dd[2].set_view_player_index(2);
		console.log(dd[2]);
		// view move tentative
		var global_scene = new local_scene.player();
		global_scene.set_scale({x: 0.125, y: 0.125});
		var local_screen = {x:0, y:0, width: g.game.width, height:g.game.height};
		// global_scene.set_angle(self_view.direction * two_pi_to_360);
		// global_scene.set_local_scene();
		wm.local_scene_player[2].set_scale({x: 0.125, y: 0.125});
		wm.local_scene_player[2].set_local_scene();
		// console.log(wm.local_scene_player[2]);
		scene.update.add(function() {
			// if (dd[2].group.tag.global.direction * two_pi_to_360 > 600) return;
			var xy = {
				x: dd[2].group.tag.global.x + dd[2].group.tag.global.width / 2,
				y: dd[2].group.tag.global.y + dd[2].group.tag.global.height / 2,
				width: dd[2].group.tag.global.width,
				height: dd[2].group.tag.global.height,
			};
			// var xyl =  wm.local_scene_player[2].point_forward_init(xy);
			// var tracer = new g.FilledRect({
			// 	scene: scene,
			// 	cssColor: conf.default_label.cssColor,
			// 	opacity: conf.default_label.opacity,
			// 	x: xyl.x,
			// 	y: xyl.y,
			// 	width: 2,
			// 	height: 2,
			// 	angle: 0,
			// });
			// scene.append(tracer);
			var cv0 = [
				g.game.width/2,
				g.game.height/2
			];
			wm.local_scene_player[2].set_local_zero({
				x: -(xy.x - cv0[0])/8,
				y: -(xy.y - cv0[1])/8
			});

			wm.local_scene_player[2].set_local_scene();
		});


		// Create window manager
		scene.setTimeout(function() {wm.create();}, 100);
	});
	g.game.pushScene(scene);
}
module.exports = main;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function indTo2D(ii, dim) {
	var cood = [];
	cood[0] = ii % dim;
	cood[1] = (ii -  cood[0]) / dim;
	return cood;
}

function createBoard(p, player_index, scene) {
	var local_p = wm.local_scene_player[player_index].rect_forward_init(p);
	// local_p = wm.local_scene_player[player_index].rect_inverse_init(local_p);
	return new g.FilledRect({
		scene: scene,
		cssColor: conf.default_label.cssColor,
		opacity: conf.default_label.opacity,
		x: local_p.x,
		y: local_p.y,
		width: local_p.width,
		height: local_p.height,
		angle: local_p.angle360,
		scaleX: local_p.scaleX,
		scaleY: local_p.scaleY,
		tag: {
			global: p
		}
	});
}




		// // Pile areas
		// var pile_areas = [];
		// var lines_in_pile = 2;
		// var dx = cs[1];
		// var dy = cs[4] + 12;
		// ii = 0;
		// var flags = [[1, 0, 0, 0], [0, 1, 0, 0]];
		// while(ii < conf.piece.bw_n * lines_in_pile) {
		// 	var x_rem = ii % lines_in_pile;
		// 	var nx    = (ii - x_rem) / lines_in_pile;
		// 	var details = {
		// 		x: x_rem * dx + conf.pile_area.location.x0 + wm.view.position.x,
		// 		y: nx * dy    + conf.pile_area.location.y0 + wm.view.position.y,
		// 		width: conf.pile_area.location.width,
		// 		height: conf.pile_area.location.height,
		// 		background: {
		// 			cssColor: conf.pile_area.background.cssColor,
		// 			opacity: conf.pile_area.background.opacity,
		// 		},
		// 	};
		// 	pile_areas[ii] = new stack.objects(details, flags[x_rem]);
		// 	ii++;
		// }
		// piece.set_pile_areas(pile_areas);
		// set_inital_locations.set_stack_objects(pile_areas);

		// Board area
		// ii = 0;
		// while (ii < conf.piece.n) {
		// while (ii < 4) {
		// 	var xy_index = indTo2D(ii, conf.board.size.x);
		// 	var xywh = {
		// 		x: cs[xy_index[0]] + conf.board.location.x0 + wm.view.position.x, 
		// 		y: cs[xy_index[1]] + conf.board.location.y0 + wm.view.position.y,
		// 		width: csm1.x,
		// 		height: csm1.y
		// 	};
		// 	// var b = createBoard(xywh, player_index, scene);
		// 	var b = createBoard(xywh, -1, scene);
		// 	scene.append(b);
		// 	++ii;
		// }

		// // pieces in pile areas
		// var pieces_pp      = conf.piece.n / conf.piece.bw_n;
		// var pieces_in_line = pieces_pp / lines_in_pile;
		// var x0            = cs[15] - 0.2 * cs[1];
		// // var x0            = cs[10] - 0.2 * cs[1];
		// var y0            = cs[4] - 6;
		// dx            = 1 + cs[1];
		// dy            = 6;
		// var jj = 0;
		// var index   = 0;
		// while(jj < conf.piece.bw_n) {
		// 	ii = 0;
		// 	while(ii < pieces_pp) {
		// 		var dp = indTo2D(ii, [pieces_in_line]);
		// 		details = {
		// 			x: x0 + dp[1] * dx + wm.view.position.x,
		// 			y: y0 - dp[0] * dy + wm.view.position.y,
		// 			bw: jj,
		// 			width: csm1.x,
		// 			height: csm1.y,
		// 			piece: {
		// 				scene: scene,
		// 				src: scene.assets['reversi_disk'],
		// 				opacity: conf.piece.bw[jj].opacity,
		// 				width: csm1.x,
		// 				height: csm1.y,
		// 				angle: conf.piece.bw[jj].in_pile.angle,
		// 				srcX: conf.piece.bw[jj].on_board.srcX,
		// 				srcY: 0,
		// 				srcWidth: csm1.x,
		// 				srcHeight: csm1.y,
		// 			},
		// 			initial: {
		// 				index: index,
		// 				piece: 0,
		// 			},
		// 		};
		// 		var d = piece.create(details);
		// 		index++;
		// 		ii++;
		// 	}
		// 	y0 += cs[4] + 12;
		// 	jj++;
		// }
		// jj = 0;
		// while (jj < conf.players.max_players) {
		// 	piece.last[jj] = d;
		// 	jj++;
		// }

		// var initial_piece_locations = [];
		// ii = conf.piece.n - 1;
		// while (ii >= 0) {
		// 	dp = indTo2D(ii, conf.pile_area.max_pieces);
		// 	var pp = scene.children[piece.index[ii]];
		// 	pile_areas[dp[1]].set_piece(pp, false, false);
		// 	// initial_piece_locations[ii] = {x: pp.x, y: pp.y, tag: pp.tag};
		// 	initial_piece_locations[ii] = {x: pp.tag.global.x, y: pp.tag.global.y, width: pp.width, height: pp.height, tag: pp.tag};
		// 	--ii;
		// }
		//Store initial piece locations and BW for restarting game
		// set_inital_locations.set_initial_object_locations(initial_piece_locations);