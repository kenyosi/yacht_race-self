/*
 * Check point
 * yacht_race@self, Akashic content
 */



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');

var check_point_status = [
	{status: 'observer',    cssColor: '#AAAAAA', label: 'チェック'},
	{status: 'further',     cssColor: '#FFFF00', label: 'チェック'},
	{status: 'next',        cssColor: '#FF0000', label: '次のチェック'},
	{status: 'completed',   cssColor: '#00FF00', label: '完了'},
];

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var font                       = require('./self/font');
var scene;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var check_area = function (details) {
	this.view_player_index = -1;
	this.player_index = details.player_index;
	this.global_p = {
		x: details.x,
		y: details.y,
		width: details.width,
		height: details.height,
		status_index: details.status_index,
		speed: details.speed,
		direction: details.direction,
		rudder: details.rudder,
		throttle: details.throttle,
		name: details.name,
	};
	var group = new g.E({
		scene: scene,
		x: this.global_p.x,
		y: this.global_p.y,
		width: details.width,
		height: details.height,
		angle: 0,
		scaleX: 1.0,
		scaleY: 1.0,
		touchable: false,
		tag: {
			type: 'check_point',
			player_index: this.player_index,
			view_player_index: this.view_player_index,
			status_index: 0,
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
	var background = new g.FilledRect({
		scene: scene,
		cssColor: check_point_status[details.status_index].cssColor,
		opacity: 0.2,
		width: details.width,
		height: details.height,
	});
	group.append(background);
	this.background = background;
	var status = new g.Label({
		scene: scene,
		font: font.bitmap['20_default'],
		text: check_point_status[details.status_index].label,
		textColor:  check_point_status[details.status_index].cssColor,
		fontSize: 80,
		x: 0,
		y: 0,
	});
	group.append(status);
	this.status = status;
	var name = new g.Label({
		scene: scene,
		font: font.bitmap['20_default'],
		text: details.name,
		textColor:  check_point_status[details.status_index].cssColor,
		fontSize: 80,
		x: 0,
		y: 68,
	});
	group.append(name);
	this.name = name;
};
module.exports.check_area = check_area;

check_area.prototype.set_status = function (status_index) {
	this.group.tag.status_index = status_index;
	this.background.cssColor = check_point_status[status_index].cssColor;
	this.status.text = check_point_status[status_index].label;
	this.status.textColor = check_point_status[status_index].cssColor;
	this.status.invalidate();
	// this.name.text = check_point_status[status_index].label;
	this.name.textColor = check_point_status[status_index].cssColor;
	this.name.invalidate();
	this.background.modified();
};

check_area.prototype.validate = function (piece) {
	if (piece.group.x < this.group.x | piece.group.x >= this.group.x + this.group.width) return false;
	if (piece.group.y < this.group.y | piece.group.y >= this.group.y + this.group.height) return false;
	return true;
};

