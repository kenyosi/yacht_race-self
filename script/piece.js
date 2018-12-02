/*
 * Piece in board
 * yacht_race@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');
// var board_cell_half_size       = {x: conf.board.cell.size.x / 2, y: conf.board.cell.size.y / 2};
// var n_piece0                   = conf.piece.n - 1;
// var timeout_delta_frame        = 3 * g.game.fps;
var two_pi_to_360 = 360.0 / (2.0 * Math.PI);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
// var commenting                 = require('./self/commenting');
// var process                    = require('./self/process');
// var player                     = require('./self/player');
// var pointer                    = require('./self/pointer');
var wm                         = require('./self/window_manager');
var group_id                   = [];
var index                      = [];
var last                       = [];
var status                     = {}; //for revierging piece detection

var piece_counter = 0;
var piece_p = {};
var inverse_p = {};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.index           = index;
module.exports.last            = last;
module.exports.group_id        = group_id;
module.exports.status          = status;
module.exports.inverse_p      = inverse_p;



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
		// touchable: true,
		touchable: false,
		local:true,
		tag: {
			type: 'yacht',
			bw: details.bw,
			pointer_pressed: 0,
			player_index: this.player_index,
			view_player_index: this.view_player_index,
			global: this.global_p,
			initial: { // same as global
				index: piece_counter,
				piece: 0,
				player_index: this.player_index,
				view_player_index: this.view_player_index,
				x: details.x,
				y: details.y,
				speed: details.speed,
				direction: details.direction,
				rudder: details.rudder,
				throttle: details.throttle,
				score: {
					time: undefined,
					n_dollar: 0,
				},				
			},
			last: [],
		},
	});
	details.local_scene.append(group);
	this.group        = group;
	this.entity_id    = group.id;
	this.entity_index = scene.children.length - 1;
	piece_p[piece_counter] = this;
	++piece_counter;

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
	inverse_p[player_index] = this.group.tag.initial.index; // <---
};
yacht.prototype.get_player_index = function () {
	return this.player_index;
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

yacht.prototype.report_check_point = function (t, check_area) {
	return 'P' + (this.player_index + 1) + ', '
	+ check_area.group.tag.global.name
	+ ', タイム: ' + t
	+ ', 稼ぎ: ' + this.group.tag.global.score.n_dollar;
};

yacht.prototype.set_rudder = function (value) {
	var group =this.group;
	group.tag.global.rudder = value;
};

function set_rudder(mes) {
	var pp = piece_p[mes.data.piece_index];
	if (pp.player_index !== mes.data.player_index) return;
	pp.group.tag.global.rudder = mes.data.value;
}
module.exports.set_rudder = set_rudder;

function set_throttle(mes) {
	var pp = piece_p[mes.data.piece_index];
	if (pp.player_index !== mes.data.player_index) return;
	pp.group.tag.global.throttle = mes.data.value;
}
module.exports.set_throttle = set_throttle;

function set_initial_operation () {
	var ii = 0;
	while(ii < conf.players.max_sync_players) {
		var p = piece_p[ii].group.tag.global; 
		var pi = piece_p[ii].group.tag.initial; 
		p.x = pi.x;
		p.y = pi.y;
		p.speed = pi.speed;
		p.direction = pi.direction;
		p.rudder = pi.rudder;
		p.throttle = pi.throttle;
		p.score = {
			time: pi.score.time,
			n_dollar: pi.score.n_dollar,
		};
		piece_p[ii].set_view_player_index(pi.view_player_index);
		piece_p[ii].set_player_index(pi.player_index);
		++ii;
	}
}
module.exports.set_initial_operation = set_initial_operation;
