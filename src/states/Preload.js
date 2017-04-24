// Preload is the second state, switched to after Boot finishes
// It is used to load all of the assets (images, sounds, json files etc) that are needed in the game up front
class Preload extends Phaser.State {

	preload() {
		this.game.load.spritesheet('tiles', 'src/static/img/tileset_visuals.png', 16, 16);
		this.loadImage('tileBackground', 'tileBackground.png');

		this.loadImage('box', 'box.png');
		this.loadImage('whiteBox', 'whiteBox.png');
		this.loadImage('ant', 'ant.png');
		this.loadImage('charge', 'charge.png');
		this.loadImage('tower_basic', 'tower_basic.png');
		this.loadImage('tower_piercing', 'tower_piercing.png');
		this.loadImage('tower_generator', 'tower_generator.png');
		this.loadImage('tower_capacitor', 'tower_capacitor.png');
		this.loadImage('powerIndicator', 'powerIndicator.png');

		this.levelNames = this.game.cache.getJSON('levelList')["levels"];

		for(var i = 0; i < this.levelNames.length; i++) {
			this.game.load.tilemap(this.levelNames[i] + '_map_visuals', 'src/static/levelData/' + this.levelNames[i] + '/map_visuals.csv', null, Phaser.Tilemap.CSV);
			this.game.load.tilemap(this.levelNames[i] + '_map_data', 'src/static/levelData/' + this.levelNames[i] + '/map_data.csv', null, Phaser.Tilemap.CSV);

			this.game.load.json(this.levelNames[i] + '_info', 'src/static/levelData/' + this.levelNames[i] + '/info.json');
		}
	}

	loadImage(key, fileName) {
		this.game.load.image(key, 'src/static/img/' + fileName);
	}

	create() {
		this.game.globals.levels = [];

		for(var i = 0; i < this.levelNames.length; i++) {
			var level = {
				name: this.levelNames[i], 
				map_visuals: this.game.cache.getTilemapData(this.levelNames[i] + '_map_visuals'),
				map_data: this.game.cache.getTilemapData(this.levelNames[i] + '_map_data'),
				info: this.game.cache.getJSON(this.levelNames[i] + '_info')
			}
			this.game.globals.levels.push(level);
		}

		this.state.start('MainMenu');
	}

}