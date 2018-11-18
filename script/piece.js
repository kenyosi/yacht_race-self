/*
 * Piece in board
 * yacht_race@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');
var board_cell_half_size       = {x: conf.board.cell.size.x / 2, y: conf.board.cell.size.y / 2};
var n_piece0                   = conf.piece.n - 1;
var timeout_delta_frame        = 3 * g.game.fps;
var two_pi_to_360 = 360.0 / (2.0 * Math.PI);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
// var commenting                 = require('./self/commenting');
var process                    = require('./self/process');
var player                     = require('./self/player');
var pointer                    = require('./self/pointer');
var wm                         = require('./self/window_manager');
var group_id                   = [];
var index                      = [];
var last                       = [];
var pile_areas                 = [];
var pile_areas_length;
var status                     = {}; //for revierging piece detection
var camera_position_pointDown;

var piece_p = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.index           = index;
module.exports.last            = last;
module.exports.group_id         = group_id;
module.exports.status          = status;

function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var yacht = function (details) {
	this.view_player_index = -1;
	this.player_index = details.player_index;
	this.global_p = {
		x: details.x,
		y: details.y,
		center_x: details.x + details.width / 2,
		center_y: details.y + details.height / 2,
		width: details.width,
		height: details.height,
		speed: details.speed,
		direction: details.direction,
		rudder: details.rudder,
		throttle: details.throttle,
		score: {
			time: undefined,
			n_dollar: 0,
		},
	};
	var local_p = wm.local_scene_player[this.view_player_index].rect_forward_init(this.global_p);
	var local_scene = wm.local_scene_player[this.view_player_index];
	var group = new g.E({
		scene: scene,
		x: local_p.x,
		y: local_p.y,
		width: details.width,
		height: details.height,
		angle: local_scene.angle360 + details.direction * two_pi_to_360 + 90,
		scaleX: local_scene.scale.x,
		scaleY: local_scene.scale.y,
		touchable: true,
		tag: {
			type: 'yacht',
			bw: details.bw,
			pointer_pressed: 0,
			player_index: this.player_index,
			view_player_index: this.view_player_index,
			last: [],
			initial: {
				index: details.initial.index,
				piece: details.initial.piece,
				x: details.x,
				y: details.y,
			},
			global: this.global_p,
		},
	});
	details.local_scene.append(group);
	this.group        = group;
	this.entity_id    = group.id;
	this.entity_index = scene.children.length - 1;
	piece_p[details.player_index] = this;

	group.update.add(function yacht_update() {
		group.tag.global.speed += group.tag.global.throttle;
		// if (Math.abs(group.tag.global.speed) <= 0.005) return;
		group.tag.global.x += (group.tag.global.speed * Math.cos(group.tag.global.direction));
		group.tag.global.y += (group.tag.global.speed * Math.sin(group.tag.global.direction));
		group.tag.global.direction += group.tag.global.rudder * group.tag.global.speed;
		group.tag.global.speed *= (1 - conf.const.friction - 2*Math.abs(group.tag.global.rudder));
		var xy_l = wm.local_scene_player[2].rect_forward_init(group.tag.global);
		group.tag.global.center_x = xy_l.center_x;
		group.tag.global.center_y = xy_l.center_y;
		if (group.tag.initial.index == 2) {
			// console.log(xy_l);
		}
		group.x = xy_l.x;
		group.y = xy_l.y;
		group.angle = group.tag.global.direction * two_pi_to_360 + 90 + wm.local_scene_player[group.tag.view_player_index].angle360;
		group.modified();
	});

	var ii = 0;
	while (ii < conf.players.max_players) {
		group.tag.last[ii] = {
			ev: undefined,
			timestamp: g.game.age,
			pointer_pressed: 0,
		};
		ii++;
	}
	group.append(
		new g.FilledRect({
			scene: scene,
			cssColor: conf.piece.unselect.background.cssColor,
			opacity: conf.piece.unselect.background.opacity,
			width: details.width,
			height: details.height,
		}));
	var shape = new g.Sprite(details.piece);
	group.append(shape);
	this.shape = shape;
	// group.angle += 90;
	// group.modified();

};
module.exports.yacht = yacht;

yacht.prototype.set_player_index = function (player_index) {
	this.player_index = player_index;
	this.group.tag.player_index = player_index;
};

yacht.prototype.set_view_player_index = function (view_player_index) {
	this.view_player_index = view_player_index;
	this.group.tag.view_player_index = view_player_index;
	if (this.player_index === this.view_player_index) {
		this.shape.srcX = conf.yacht.self.srcX;
		this.shape.srcY = conf.yacht.self.srcY;
	}
	else {
		this.shape.srcX = conf.yacht.other.srcX;
		this.shape.srcY = conf.yacht.other.srcY;
	}
	this.group.modified();

};

yacht.prototype.set_plain_yacht = function () {
	this.group.tag.global.score = {
		time: undefined,
		n_dollar: 0,
	};
};


yacht.prototype.set_rudder = function (value) {
	var group =this.group;
	group.tag.global.rudder = value;
};

function set_pile_areas(p) {
	pile_areas = p;
	pile_areas_length = p.length;
}
module.exports.set_pile_areas = set_pile_areas;

function set_rudder(mes) {
	var player_index = mes.data.player_index;
	var rudder = mes.data.value;
	piece_p[player_index].group.tag.global.rudder = rudder;
}
module.exports.set_rudder = set_rudder;

function set_throttle(mes) {
	var player_index = mes.data.player_index;
	var throttle = mes.data.value;
	piece_p[player_index].group.tag.global.throttle = throttle;
}
module.exports.set_throttle = set_throttle;


















var boundary = function (object) {
	this.width = object.width;
	this.height = object.height;
	this.x0 = 0;
	this.x1 = g.game.width - 2 * this.width; // <---
	this.y0 = 0;
	this.y1 = g.game.height - this.height;
};
boundary.prototype.set_start = function (xy) {
	this.start = {x: xy.x, y: xy.y};
};
boundary.prototype.force = function (ev, xy) {
	var x = this.start.x + ev.startDelta.x;
	x = (x <= this.x0 ? this.x0 : x);
	x = (x >= this.x1 ? this.x1 : x);
	xy.x = x;
	var y = this.start.y + ev.startDelta.y;
	y = (y <= this.y0 ? this.y0 : y);
	y = (y >= this.y1 ? this.y1 : y);
	xy.y = y;
	return xy;
};

function create(details) {
	var global_player_index = -1;
	var global_p = {x: details.x, y: details.y, width: details.width, height: details.height};
	var local_p = wm.local_scene_player[global_player_index].rect_forward_init(global_p);
	var local_scene = wm.local_scene_player[global_player_index];
	var group = new g.E({
		scene: scene,
		x: local_p.x,
		y: local_p.y,
		width: details.width,
		height: details.height,
		angle: local_scene.angle360,
		scaleX: local_scene.scale.x,
		scaleY: local_scene.scale.y,
		touchable: true,
		tag: {
			type: 'piece',
			bw: details.bw,
			pointer_pressed: 0,
			last: [],
			initial: {
				index: details.initial.index,
				piece: details.initial.piece,
				x: details.x,
				y: details.y,
			},
			global: global_p,
		},
	});
	var ii = 0;
	while (ii < conf.players.max_players) {
		group.tag.last[ii] = {
			ev: undefined,
			timestamp: g.game.age,
			pointer_pressed: 0,
		};
		ii++;
	}
	group.append(
		new g.FilledRect({
			scene: scene,
			cssColor: conf.piece.unselect.background.cssColor,
			opacity: conf.piece.unselect.background.opacity,
			width: details.width,
			height: details.height,
		}));
	group.append(new g.Sprite(details.piece));
	group.update.add(function() {
		if (group.tag.pointer_pressed > 0) {
			ii = 0;
			while (ii < conf.players.max_players) {
				if ((group.tag.last[ii].timestamp + g.game.age) % g.game.fps == 0) {
					if(group.tag.last[ii].timestamp + timeout_delta_frame < g.game.age) {
						// up(ii, ev, group);
						var ev = group.tag.last[ii].ev;
						if (ev === undefined) break;
						//ここでエラーが出るev.x がない？
						var message = create_message(ev, group);
						var index = message.index;
						// var ev_sync = wm.local_scene_player[index.player].inverse(ev);
						var ev_sync = wm.local_scene_player[index.player].rect_inverse(ev, group);
						up(ii, ev_sync, group); //not fire other_local
						// fire_other_local('piece_other_local_up', index, ev_sync);
					}
				}
				ii++;
			}
		}
	});
	function down_move_point_event(ev, group) {
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return false;
		if (!wm.semaphoe.status()) return false;
		if (!player.validate_join(ev.player, 0)) return false;
		if (!status[group.id].events.process.status()) return false;
		if (ev.pointerId > conf.window.max_pointers) return false;
		return create_message(ev, group);
	}
	function create_message(ev, group) {
		var player_index = player.find_index(ev.player.id);
		return {
			index: {
				player: player_index,
				pointer: ev.pointerId,
				piece: group.id,
			},
		};
	}
	group.pointDown.add(function (ev) {
		var message = down_move_point_event(ev, group);
		if (message === false) return;
		var index = message.index;
		if (!wm.player_operations[index.player].wait()) return;
		// var ev_sync = wm.local_scene_player[index.player].inverse_down(ev);
		var xy = get_absolute_position(ev);
		ev.point.x = xy.x;
		ev.point.y = xy.y;
		var ev_sync = wm.local_scene_player[index.player].rect_inverse_down(ev, group);
		status[group.id].pointdown.in_board[index.player] = get_address_in_board(group).validate;
		status[group.id].pointdown.boundary[index.player].set_start(group);
		// down(index.player, ev, group);
		fire_other_local('piece_other_local_down', index, ev_sync);

	});
	group.pointMove.add(function (ev) {
		// console.log(group); // この後でmove 中でlocal座標がglobalになる
		var message = down_move_point_event(ev, group);
		if (message === false) return;
		var index = message.index;
		//resume process
		if (!status[group.id].pointdown.processed[index.player].status()) { 
			if (!wm.player_operations[index.player].wait()) return;
			// down(index.player, ev, group);
			// var ev_sync = wm.local_scene_player[index.player].inverse_down(ev);
			var xy = get_absolute_position(ev);
			ev.point.x = xy.x;
			ev.point.y = xy.y;
			var ev_sync = wm.local_scene_player[index.player].rect_inverse_down(ev, group);
			fire_other_local('piece_other_local_down', index, ev_sync);
			return;
		}
		if (!status[group.id].pointdown.processed[index.player].status()) return;
		if (!status[group.id].events.process.status()) return;
		// move(index.player, ev, group);
		// ev_sync = wm.local_scene_player[index.player].inverse(ev);
		xy = get_absolute_position(ev);
		ev.point.x = xy.x;
		ev.point.y = xy.y;
		ev_sync = wm.local_scene_player[index.player].rect_inverse(ev, group);
		fire_other_local('piece_other_local_move', index, ev_sync);
	});
	group.pointUp.add(function (ev) {
		// console.log(group); // この後でmove 中でlocal座標がglobalになる

		if (!player.validate(ev.player, 0)) return;
		if ((wm.admin.control && player.get_group(ev.player.id) != 'admin')) return;
		if (!wm.semaphoe.status()) return;
		if (!status[group.id].events.process.status()) return;
		if (group.tag.pointer_pressed <=0) return;
		// var player_index = player.find_index(ev.player.id);
		// up(ev, group, player_index);
		var message = create_message(ev, group);
		var index = message.index;
		// var ev_sync = wm.local_scene_player[index.player].inverse(ev);
		var xy = get_absolute_position(ev);
		ev.point.x = xy.x;
		ev.point.y = xy.y;
		var ev_sync = wm.local_scene_player[index.player].rect_inverse(ev, group);
		fire_other_local('piece_other_local_up', index, ev_sync);
	});
	scene.append(group);
	group_id.push(group.id);
	index.push(scene.children.length - 1);
	status[group.id] = {
		p_piece: group,
		pointdown: {
			in_process: new process.semaphore(1),
			processed: [],
			in_board:  [],
			timestamp: [],
			boundary: [],
			last_timestamp: [],
			pointer_pressed: [],
		},
		events: {
			process: new process.semaphore(1),
		}
	};
	ii = 0;
	while (ii < conf.players.max_players) {
		status[group.id].pointdown.processed[ii] = new process.semaphore(0);
		status[group.id].pointdown.in_board[ii] = get_address_in_board(group).validate;
		status[group.id].pointdown.timestamp[ii] = g.game.age;
		status[group.id].pointdown.boundary[ii] = new boundary(conf.const.unit);
		status[group.id].pointdown.last_timestamp[ii] = g.game.age;
		status[group.id].pointdown.pointer_pressed[ii] = false;
		ii++;
	}
	return group;
}
module.exports.create = create;

function set_last_status(counter_pressed, player_index, ev, group) {
	group.tag.pointer_pressed 					 += counter_pressed;
	group.tag.last[player_index].pointer_pressed += counter_pressed;
	group.tag.last[player_index].timestamp        = g.game.age;
	var startDeltaStable;
	if (ev.startDelta !== undefined) startDeltaStable = {x: ev.startDelta.x, y: ev.startDelta.y};
	else 							 startDeltaStable = {x: 0, y: 0};
	group.tag.last[player_index].ev = {
		x: group.x,
		y: group.y,
		pointerId: ev.pointerId,
		startDelta: startDeltaStable,
		player: ev.player,
	};
}
function set_initial_pressed(player_index, group) {
	++player.current[player_index].player_plate;
	to_top(group.id, scene.children);
	camera_position_pointDown = wm.view.position;
	var pi = 0;
	while(pi < pile_areas_length) {
		// pile_areas[pi].get_piece(group, status[group.id]);
		pile_areas[pi].get_piece(group);
		++pi;
	}
	status[group.id].pointdown.processed[player_index].signal();
	status[group.id].pointdown.timestamp[player_index] = g.game.age;
	if (status[group.id].pointdown.in_board[player_index]) return;
	wm.draw_modified(last[player_index].children[0], conf.piece.unselect.background);
	wm.draw_modified(group.children[0], conf.players.item.operating[player_index]); // <---
	last[player_index] = group;
}
function fire_other_local(function_name, index, ev) {
	// index.player = 1; // test, should consider ev.delta zero is different between 0 and 1
	var mes = {
		data: {
			destination: function_name,
			index: index,
			ev: ev,
		}
	};
	scene.message.fire(mes);
	return mes;
}

function other_local_down(message) {
	// pointer_other_local_down as destination in message event in message_eventmanager.js
	var index = message.data.index;
	var target_piece = status[index.piece].p_piece;
	// var ev = wm.local_scene_player[index.player].forward_down(message.data.ev);
	// var ev = wm.local_scene_player[index.player].rect_forward_down(message.data.ev, target_piece);
	//<--- development
	// if (index.player === player.find_index(ev.player.id)) return;
	// down(index.player, ev, target_piece);
	down_local(index.player, message.data.ev, target_piece);
}
module.exports.other_local_down = other_local_down;

function other_local_move(message) {
	// pointer_other_local_down as destination in message event in message_eventmanager.js
	var index = message.data.index;
	var target_piece = status[index.piece].p_piece;
	// var ev = wm.local_scene_player[index.player].forward(message.data.ev);
	// var ev = wm.local_scene_player[index.player].rect_forward(message.data.ev, target_piece);
	//<--- development
	// if (index.player === player.find_index(ev.player.id)) return;
	// move(index.player, ev, target_piece);
	move_local(index.player, message.data.ev, target_piece);
}
module.exports.other_local_move = other_local_move;

function other_local_up(message) {
	// pointer_other_local_down as destination in message event in message_eventmanager.js
	var index = message.data.index;
	var target_piece = status[index.piece].p_piece;
	// var ev = wm.local_scene_player[index.player].forward(message.data.ev);
	var ev = wm.local_scene_player[index.player].rect_forward(message.data.ev, target_piece);
	//<--- development
	// if (index.player === player.find_index(ev.player.id)) return;
	up(index.player, ev, target_piece);
}
module.exports.other_local_up = other_local_up;

function reverse(group) {
	group.tag.bw = (group.tag.bw + 1) % 2;
	var ai = 0;
	var length_animation = conf.piece.bw[group.tag.bw].transit.length;
	var intervalId = scene.setInterval(function () {
		wm.draw_modified(group.children[1], conf.piece.bw[group.tag.bw].transit[ai]);
		++ai;
		if (ai >= length_animation) {
			scene.clearInterval(intervalId);
			scene.setTimeout(function () {
				wm.draw_modified(group.children[1], conf.piece.bw[group.tag.bw].on_board);
				wm.draw_modified(group.children[0], conf.piece.unselect.background);
				set_piles(group, status[group.id]);
				status[group.id].events.process.signal();
			},  conf.piece.bw[group.tag.bw].transit_time);
		}
	}, conf.piece.bw[group.tag.bw].transit_time);
	// var message_here = (group.tag.bw == 0 ? '黒' :'白') + 'に@P' + wm.index_pp[player_index];
	// if (xy.validate) message_here = conf.board.an.x[xy.x] + conf.board.an.y[xy.y] + 'を' + message_here;
	// commenting.post(message_here);
}

// function down(player_index, ev, group) {
// 	set_last_status(1, player_index, ev, group);// required
// 	set_initial_pressed(player_index, group);
// }
function down_local(player_index, ev_g, target_piece) {
	var ev_l = wm.local_scene_player[player_index].rect_forward_down(ev_g, target_piece);
	set_last_status(1, player_index, ev_l, target_piece);// required
	set_initial_pressed(player_index, target_piece);
	// console.log(target_piece);

}
// function move(player_index, ev, group) {
// 	set_last_status(0, player_index, ev, group);
// 	// Force up piece if it's rapid movement. Check if this is required carefully.
// 	// var dxy = ev.prevDelta.x * ev.prevDelta.x + ev.prevDelta.y * ev.prevDelta.y
// 	// if (dxy > conf.window.max_prevDelta || true) {
// 	// up(player_index, ev, group);
// 	// return
// 	// }
// 	if (!wm.view.floating) {
// 		var xy = {x: 0, y: 0};
// 		var ii = 0;
// 		while (ii < conf.players.max_players) {
// 			if (status[group.id].pointdown.processed[ii].status()) {
// 				var pxy = {x: 0, y: 0};
// 				pxy = status[group.id].pointdown.boundary[ii].force(group.tag.last[ii].ev, pxy);
// 				xy.x += pxy.x;
// 				xy.y += pxy.y;
// 			}
// 			ii++;
// 		}
// 		group.x = xy.x / group.tag.pointer_pressed;
// 		group.y = xy.y / group.tag.pointer_pressed;
// 	}
// 	else {
// 		group.x -= ev.prevDelta.x;
// 		group.y -= ev.prevDelta.y;
// 	}
// 	group.modified();
// }
function move_local(player_index, ev_g, group) {
	var ev_l = wm.local_scene_player[player_index].rect_forward(ev_g, group);
	set_last_status(0, player_index, ev_l, group);
	// Force up piece if it's rapid movement. Check if this is required carefully.
	// var dxy = ev.prevDelta.x * ev.prevDelta.x + ev.prevDelta.y * ev.prevDelta.y
	// if (dxy > conf.window.max_prevDelta || true) {
	// up(player_index, ev, group);
	// return
	// }
	if (!wm.view.floating) {
		var xy = {x: 0, y: 0, width: group.width, height: group.height};
		var ii = 0;
		while (ii < conf.players.max_players) {
			if (status[group.id].pointdown.processed[ii].status()) {
				var pxy = {x: 0, y: 0, width: group.width, height: group.height};
				// console.log(group.tag.last[ii].ev);
				pxy = status[group.id].pointdown.boundary[ii].force(group.tag.last[ii].ev, pxy);
				// pxy.width = group.width;
				// pxy.height = group.height;
				pxy = wm.local_scene_player[ii].rect_inverse_init(pxy);
				xy.x += pxy.x;
				xy.y += pxy.y;
			}
			ii++;
		}
		// xy = {x: xy.x / group.tag.pointer_pressed, y: xy.y / group.tag.pointer_pressed}
		xy.x = xy.x / group.tag.pointer_pressed;
		xy.y = xy.y / group.tag.pointer_pressed;
		// group.tag.global.x = xy.x / group.tag.pointer_pressed;
		// group.tag.global.y = xy.y / group.tag.pointer_pressed;
		group.tag.global.x = xy.x;
		group.tag.global.y = xy.y;
		var xy_l = wm.local_scene_player[player_index].rect_forward_init(xy);
		// console.log(xy);
		// console.log(xy_l);
		// group.x = xy_l.x / group.tag.pointer_pressed;
		// group.y = xy_l.y / group.tag.pointer_pressed;
		group.x = xy_l.x;
		group.y = xy_l.y;
	}
	else {
		group.tag.global.x -= ev_g.prevDelta.x;
		group.tag.global.y -= ev_g.prevDelta.y;
		group.x            -= ev_l.prevDelta.x;
		group.y            -= ev_l.prevDelta.y;
	}
	group.modified();
}

function up(player_index, ev, group) {
	if (!status[group.id].pointdown.processed[player_index].wait()) return;
	if (!wm.player_operations[player_index].signal()) return;
	--player.current[player_index].player_plate;
	if (group.tag.last[player_index].pointer_pressed <= 0) return;
	group.tag.last[player_index].pointer_pressed--;
	group.tag.pointer_pressed--;
	if (group.tag.pointer_pressed > 0) return;
	var xy = get_address_in_board(group);
	var pointUp_time = g.game.age;
	var dx = ev.startDelta.x + camera_position_pointDown.x - wm.view.position.x;
	var dy = ev.startDelta.y + camera_position_pointDown.y - wm.view.position.y;
	if (Math.abs(dx) < conf.players.cell.state.size.x
		&& Math.abs(dy) < conf.players.cell.state.size.y
		&& (pointUp_time - status[group.id].pointdown.timestamp[player_index] <= conf.players.cell.state.time)) {
		if (!status[group.id].events.process.wait()) return;
		reverse(group);
		return;
	}
	// console.log(group);
	if (xy.validate) {
		if (!status[group.id].pointdown.in_board[player_index]){
			if (ev.pointerId === pointer.initial_pointer_id[player_index]) {
				wm.draw_modified(group.children[0], conf.players.item.waiting[player_index]);
				last[player_index] = group; // required set here again
			}
			else {
				wm.draw_modified(group.children[0], conf.piece.unselect.background);
			}
			// var bw_flag = (group.children[1].srcX == 0 ? '黒' :'白');
			// var message_here = conf.board.an.x[xy.x] + conf.board.an.y[xy.y] + 'に' + bw_flag + 'をおく@P' + wm.index_pp[player_index];
			// commenting.post(message_here);
		}
	}
	else {
		wm.draw_modified(group.children[0], conf.piece.unselect.background);
		if (!status[group.id].events.process.wait()) return;
		set_piles(group, status[group.id]);
		status[group.id].events.process.signal();
	}
}

function to_top(id, pieces) {
	var this_group_id_index = group_id.indexOf(id);
	var this_index = index[this_group_id_index];

	var b = pieces[this_index];
	pieces.splice(this_index, 1);
	pieces.splice(index[n_piece0], 0, b);

	var c = group_id[this_group_id_index];
	group_id.splice(this_group_id_index, 1);
	group_id.splice(n_piece0, 0, c);
}
module.exports.to_top = to_top;

function get_address_in_board(d) {
	var address = {};
	// var x = d.x - conf.board.location.x0 - wm.view.position.x;
	// var y = d.y - conf.board.location.y0 - wm.view.position.y;
	var x = d.tag.global.x - conf.board.location.x0 - wm.view.position.x;
	var y = d.tag.global.y - conf.board.location.y0 - wm.view.position.y;
	address.x = parseInt(x / (conf.board.cell.size.x * wm.view.zoom) + 0.5);
	address.y = parseInt(y / (conf.board.cell.size.y * wm.view.zoom) + 0.5);
	address.validate = (
		x >= - board_cell_half_size.x && y >= - board_cell_half_size.y
		&& address.x >= 0 && address.x < conf.board.size.x
		&& address.y >= 0 && address.y < conf.board.size.y
	);
	return address;
}
module.exports.get_address_in_board = get_address_in_board;

function set_piles(d) {
	var re = -1;
	var zf = (wm.view.zooming ? 0.5 : 1);
	// console.log(d);
	// console.log(pile_areas[0].area);
	// var ops = [
	// 	[1, 0, - (d.width - 1) * zf],
	// 	// [0, 1, + (d.width + 1) * zf],
	// 	[0, 1, - 2*(d.width + 1) * zf],
	// 	[3, 2, - (d.width - 1) * zf],
	// 	// [2, 3, + (d.width + 1) * zf],
	// 	[2, 3, - 2*(d.width + 1) * zf],
	// ];
	var ops = [
		[1, 0, - (d.tag.global.width - 1) * zf],
		// [0, 1, + (d.tag.global.width + 1) * zf],
		[0, 1, - 2*(d.tag.global.width + 1) * zf],
		[3, 2, - (d.tag.global.width - 1) * zf],
		// [2, 3, + (d.tag.global.width + 1) * zf],
		[2, 3, - 2*(d.tag.global.width + 1) * zf],
	];
	while (re == -1){
		var pi = 0;
		while(pi < pile_areas_length) {
			re = pile_areas[pi].set_piece(d);
			if (re == 1) return;
			else if (re == -1) {
				// d.x = pile_areas[ops[pi][0]].area.x;
				d.tag.global.x = pile_areas[ops[pi][0]].area.tag.global.x;
				re = pile_areas[ops[pi][0]].set_piece(d);
				if (re == -1) {
					// d.x = pile_areas[ops[pi][1]].area.x + ops[pi][2];
					d.tag.global.x = pile_areas[ops[pi][1]].area.tag.global.x + ops[pi][2];
				}
				return;
			}
			++pi;
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function get_absolute_position(ev) {
	if (ev.target === undefined)    return {x: ev.point.x, y: ev.point.y};
	if (ev.target.parent === scene) return {x: ev.point.x + ev.target.x, y: ev.point.y + ev.target.y};
	return {
		x: ev.point.x + ev.target.x + ev.target.parent.x,
		y: ev.point.y + ev.target.y + ev.target.parent.y
	};
}

// function move(xy, d, transit_time = 20, s = [1.0,   1.5,   2.0,   2.5,   3.0,   2.5,   2.0,   1.5,   1.25,  1.0]) {
// 	var d0 = {'x': d.x, 'y': d.y};
// 	var x_index = d.tag.bw;
// 	var dp = conf.piece.bw[x_index]['transit'];
// 	var angle_here = g.game.random.get(0, 359);
// 	var dpa = [dp[0], dp[1], dp[2], dp[3], dp[4], dp[4], dp[3], dp[2], dp[1], dp[0]];
// 	var sf =  s; //[1.0,   1.5,   2.0,   2.5,   3.0,   2.5,   2.0,   1.5,   1.25,  1.0]
// 	var ii = 0;
// 	var length_animation = dpa.length;
// 	var rot = scene.setInterval(function () {
// 		var dpp = dpa[ii];
// 		var r0  = (ii + 1) / length_animation;
// 		var r1  = 1.0 - r0;
// 		dpp.angle = angle_here * r0 + conf.piece.bw[x_index].on_board.angle * r1;
// 		wm.draw_modified(d.children[1], dpp);
// 		var dp  = {x: xy.x * r0 + d0.x * r1, y: xy.y * r0 + d0.y * r1, scaleX: sf[ii] * wm.view.zoom, scaleY: sf[ii] * wm.view.zoom};
// 		wm.draw_modified(d, dp);
// 		++ii;
// 		if (ii >= length_animation) {
// 			scene.clearInterval(rot);
// 				scene.setTimeout(function () {
// 				wm.draw_modified(d.children[1], conf.piece.bw[x_index].on_board);
// 				wm.draw_modified(d.children[0], conf.piece.unselect.background);
// 			}, transit_time);
// 		}
// 	}, transit_time);
// };
// module.exports.move = move;
