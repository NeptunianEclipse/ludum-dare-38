// Preload is the second state, switched to after Boot finishes
// It is used to load all of the assets (images, sounds, json files etc) that are needed in the game up front
class Preload extends Phaser.State {

	preload() {
		this.game.load.spritesheet('tiles', 'src/static/img/tileset_visuals.png', 16, 16);
		this.loadImage('tileBackground', 'tileBackground.png');

		this.loadImage('background', 'circuitboard.jpg');

		this.loadImage('box', 'box.png');
		this.loadImage('whiteBox', 'whiteBox.png');

		this.loadImage('powerIndicator', 'powerIndicator.png');
		
		this.loadImage('enemy_ant', 'enemy_ant.png');
		this.loadImage('enemy_beetle', 'enemy_beetle.png');
		this.loadImage('enemy_snail', 'enemy_snail.png');

		this.loadImage('projectile_charge', 'projectile_charge.png');
		this.loadImage('projectile_piercing', 'projectile_piercing.png');
		this.loadImage('projectile_flame', 'projectile_flame.png');

		this.loadImage('tower_basic', 'tower_basic.png');
		this.loadImage('tower_piercing', 'tower_piercing.png');
		this.loadImage('tower_flame', 'tower_flame.png');
		this.loadImage('tower_generator', 'tower_generator.png');
		this.loadImage('tower_capacitor', 'tower_capacitor.png');
		
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

		var levelUnlocked = 0;
		if(localStorage.getItem('levelUnlocked')) {
			levelUnlocked = localStorage.getItem('levelUnlocked');
		}

		for(var i = 0; i < this.levelNames.length; i++) {
			var level = {
				name: this.levelNames[i], 
				map_visuals: this.game.cache.getTilemapData(this.levelNames[i] + '_map_visuals'),
				map_data: this.game.cache.getTilemapData(this.levelNames[i] + '_map_data'),
				info: this.game.cache.getJSON(this.levelNames[i] + '_info'),
				unlocked: i <= levelUnlocked
			}
			this.game.globals.levels.push(level);
		}

		this.state.start('MainMenu');
	}

}