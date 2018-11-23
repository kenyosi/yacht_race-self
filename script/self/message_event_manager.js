/*
 * message event manager
 *
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var pointer                    = require('./pointer');
var game_manager               = require('./game_manager');
var piece                      = require('../piece');
var scene;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function eval_function() {}
function pass_through() {}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) {
	scene = sc;
	var events = {
		piece_set_rudder: piece.set_rudder,
		piece_set_throttle: piece.set_throttle,
		game_manager_after_goal: game_manager.after_goal,
		game_manager_elimination_start_async_timer: game_manager.elimination_start_async_timer,
		game_manager_elimination_after_goal: game_manager.elimination_after_goal,
		game_manager_elimination_game_set: game_manager.elimination_game_set,
		// game_manager_sync_timer: game_manager.sync_timer,
		game_manager_game_start_sync_count_down: game_manager.game_start_sync_count_down,
		game_manager_game_set: game_manager.game_set,
		// piece_other_local_down: piece.other_local_down,
		// piece_other_local_move: piece.other_local_move,
		// piece_other_local_up: piece.other_local_up,
		pointer_other_local_down: pointer.other_local_down,
		pointer_other_local_move: pointer.other_local_move,
		pointer_other_local_up: pointer.other_local_up,
		eval_function: eval_function,
	};
	scene.message.add(function(mes) {
		try {
			// console.log(mes);
			if (mes === undefined) return;
			if (mes.data === undefined) return;
			if (mes.data.destination === undefined) return;
			if (events[mes.data.destination] === undefined) return;
			events[mes.data.destination](mes);
		}
		catch(e) {
			// console.log(e);
			pass_through(e);
		}
	});
}
module.exports.set_scene = set_scene;
