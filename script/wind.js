/*
 * Wind
 * yacht_race@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');
var two_pi_to_360 = 360.0 / (2.0 * Math.PI);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var game_manager               = require('./self/game_manager');

var se = new g.SoundAudioSystem('se', g.game);
var se_player = se.createPlayer();
se_player.changeVolume(conf.audio.se.volume);

var scene;
var lpv;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

function set_lpv(local_player_view) { lpv = local_player_view;}
module.exports.set_lpv = set_lpv;

function point_down_timer(ev) {
	if (ev.player.id === undefined) return;
	var x = ev.point.x - 15.5;
	var y = ev.point.y - 15.5;
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
	var key ='player' + ev.player.id + 'pointer'+ ev.pointerId.toString();
	lpv.tag.wind[key] = {
		start_age: g.game.age,
		entity_p: sprite,
	};
}
module.exports.point_down_timer = point_down_timer;

function emit(ev) {
	if (ev.player.id === undefined || ev.pointerId === undefined
       ||  ev.startDelta.x === undefined || ev.startDelta.y === undefined
	) return;
	var key = 'player' + ev.player.id + 'pointer' + ev.pointerId.toString();
	if (lpv.tag.wind[key] === undefined) return;
	if (!lpv.tag.wind[key].entity_p.destroyed) return;
	se_player.play(scene.assets.jump1);
	if (ev.startDelta.x === 0 && ev.startDelta.y === 0) pole(key, ev);
	else dipole(key, ev);
}
module.exports.emit = emit;

function pole(key, ev) {
	var x = ev.point.x - 15.5;
	var y = ev.point.y - 15.5;
	var ii = 0;
	while(ii < game_manager.dd.length) {
		var dx = game_manager.dd[ii].group.tag.global.center_x - x;
		var dy = game_manager.dd[ii].group.tag.global.center_y - y;
		var dxy = dx * dx + dy * dy;
		var force = 20000 / dxy;
		var deg = Math.atan2(dy, dx);
		var ddeg = deg - game_manager.dd[ii].group.tag.global.direction;
		force *= Math.cos(ddeg);
		// console.log(force);
		game_manager.dd[ii].group.tag.global.speed += force;
		ii++;
	}

	var image_effect = lpv.tag.wind[key].entity_p;
	image_effect.update.add(function () {
		image_effect.opacity -= 0.025;
		if (image_effect.opacity <= 0.0) {
			image_effect.destroy();
			return;
		}
		image_effect.scaleX += 0.25;
		image_effect.scaleY += 0.25;
		image_effect.modified();
	});
}
function direct_dipole(ev) {
	if (ev.player.id === undefined || ev.pointerId === undefined
        ||  ev.startDelta.x === undefined || ev.startDelta.y === undefined
	) return;
	var key = 'player' + ev.player.id + 'pointer' + ev.pointerId.toString();
	if (lpv.tag.wind[key] === undefined) return;
	if (!lpv.tag.wind[key].entity_p.destroyed) return;
	var image_effect = lpv.tag.wind[key].entity_p;
	var deg = Math.atan2(ev.startDelta.y, ev.startDelta.x);
	image_effect.srcY = 64,
	image_effect.angle = deg * two_pi_to_360 + 90,
	image_effect.modified();
}
module.exports.direct_dipole = direct_dipole;

function dipole(key, ev) {
	var x = ev.point.x - 15.5;
	var y = ev.point.y - 15.5;
	var aa = Math.sqrt(ev.startDelta.x * ev.startDelta.x + ev.startDelta.y * ev.startDelta.y);
	var px = ev.startDelta.x / aa;
	var py = ev.startDelta.y / aa;
	var ii = 0;
	while(ii < game_manager.dd.length) {
		var rx = game_manager.dd[ii].group.tag.global.center_x - x;
		var ry = game_manager.dd[ii].group.tag.global.center_y - y;
		var rs = Math.sqrt(rx * rx + ry * ry);
		var rs2 = rs * rs;
		var rs3 = rs * rs2;
		var pr = px * rx + py * ry;
		var prrs5 = pr / (rs3 * rs * rs);
		var dudx = px / rs3 - (rx + rx + rx) * prrs5;
		var dudy = py / rs3 - (ry + ry + ry) * prrs5;
		var du_rs = Math.sqrt(dudy * dudy + dudx * dudx);
		var du_deg = Math.atan2(dudy, dudx);
		var gf = 200 * rs2;
		var p2_deg = du_deg - game_manager.dd[ii].group.tag.global.direction;
		var force = - gf * du_rs * Math.cos(p2_deg);
		// console.log(force);
		game_manager.dd[ii].group.tag.global.speed += force;
		ii++;
	}

	var image_effect = lpv.tag.wind[key].entity_p;
	image_effect.update.add(function () {
		image_effect.opacity -= 0.025;
		if (image_effect.opacity <= 0.0) {
			image_effect.destroy();
			return;
		}
		image_effect.scaleX += 0.25;
		image_effect.scaleY += 0.25;
		image_effect.modified();
	});

}
