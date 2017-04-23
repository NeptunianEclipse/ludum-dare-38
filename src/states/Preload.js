// Preload is the second state, switched to after Boot finishes
// It is used to load all of the assets (images, sounds, json files etc) that are needed in the game up front
class Preload extends Phaser.State {

	preload() {
		this.game.load.spritesheet('tiles', 'src/static/img/tileset_visuals.png', 16, 16);

		this.game.load.image('box', 'src/static/img/box.png');
		this.game.load.image('ant', 'src/static/img/ant.png');
		this.game.load.image('charge', 'src/static/img/charge.png');
		this.game.load.image('tower_basic', 'src/static/img/tower_basic.png');
		this.game.load.image('tower_piercing', 'src/static/img/tower_piercing.png');

		this.levelNames = this.game.cache.getJSON('levelList')["levels"];

		for(var i = 0; i < this.levelNames.length; i++) {
			this.game.load.tilemap(this.levelNames[i] + '_map_visuals', 'src/static/levelData/' + this.levelNames[i] + '/map_visuals.csv', null, Phaser.Tilemap.CSV);
			this.game.load.tilemap(this.levelNames[i] + '_map_data', 'src/static/levelData/' + this.levelNames[i] + '/map_data.csv', null, Phaser.Tilemap.CSV);

			this.game.load.json(this.levelNames[i] + '_info', 'src/static/levelData/' + this.levelNames[i] + '/info.json');
		}
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