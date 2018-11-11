/*
 * Font
 * @self, Akashic content
 */

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
var glyph16_1;
var bitmap = {};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports.bitmap = bitmap;

function set_scene(sc) {
	scene = sc;
	glyph16_1 = JSON.parse(scene.assets['glyph_area_16'].data);
	bitmap['1_16'] = new g.BitmapFont({
		src: scene.assets['font16_1'],
		map: glyph16_1,
		defaultGlyphWidth: 16,
		defaultGlyphHeight: 16
	});
}
module.exports.set_scene = set_scene;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
bitmap['comment'] = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: conf.comment.properies.fontSize,
	fontColor: conf.comment.properies.cssColor,
	strokeColor: conf.comment.properies.strokeColor,
	strokeWidth: conf.comment.properies.strokeWidth,
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// var font_12 = {
// 	fontSize: 12,
// 	cssColor: conf.default_button.cssColor,
// 	opacity: conf.default_button.opacity,
// };
bitmap['12_default'] = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: 12,
});
bitmap['14_default'] = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: 14,
});
bitmap['16_default'] = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: 16,
});
bitmap['20_default'] = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: 20,
});
