/*
 * Timer
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

var que_size = 4;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var timer_que                  = [[false, 0, undefined],[false, 0, undefined],[false, 0, undefined],[false, 0, undefined]];
// var latest_que_index           = que_size - 1;
var current_que_index          = que_size - 1;


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) {
	scene = sc;
	scene.update.add(function (){check_age(0);});
	scene.update.add(function (){check_age(1);});
	scene.update.add(function (){check_age(2);});
	scene.update.add(function (){check_age(3);});
	// check_age(0);
	// check_age(1);
	// check_age(2);
	// check_age(3);
	// });
}
module.exports.set_scene = set_scene;

function check_age(index) {
	if (!timer_que[index][0]) return;
	if (g.game.age >= timer_que[index][1]) {
		timer_que[index][0] = false;
		// console.log('time_out' + index + ', call:' + timer_que[index][2]);
		timer_que[index][2](); // call back
	} 
}

function add_delta_frame(fp, frame) {
	// console.log('post: ' + frame);
	current_que_index = (current_que_index + 1) % que_size;
	timer_que[current_que_index] = [true, g.game.age + frame, fp];
	// console.log(timer_que);
}
module.exports.add_delta_frame = add_delta_frame;
