/*
 * yacht_race@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                         = require('./content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var dialog                       = require('./self/dialog');

var navi_scene;
var board;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


function create(sc) {
	navi_scene = new g.Scene({game: g.game, assetIds:
		['boat_simple', 'item_icons', 'reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo',
			'jump1', 'info_girl1_info_girl1_go2', 'info_girl1_info_girl1_goal1', 'info_girl1_info_girl1_ready1',
			'info_girl1_info_girl1_stop1', 'info_girl1_info_girl1_timeup2', 'people_people_stadium_cheer1',
			'info_girl1_info_girl1_zyunbihaiikana1', 'line_girl1_line_girl1_kekkawohappyoushimasu1', 
			'decision3', 'decision9', 'nc97718', 'nc10333']
	});

	navi_scene.loaded.add(function () {
		dialog.set_scene(navi_scene);
		var	p = dialog.default_parameters;
		board = new dialog.normal(p);
	});
	return navi_scene;
}
module.exports.create = create;

