class Preload extends Phaser.State {

	preload() {
		this.game.load.image('tiles', 'src/static/img/devTileset.png');

		this.levelNames = this.game.cache.getJSON('levelList')["levels"];



		for(var i = 0; i < this.levelNames.length; i++) {
			this.game.load.tilemap(this.levelNames[i] + '_map', 'src/static/levelData/' + this.levelNames[i] + '/map.csv', null, Phaser.Tilemap.CSV);
			this.game.load.json(this.levelNames[i] + '_info', 'src/static/levelData/' + this.levelNames[i] + '/info.json');
		}
	}

	create() {
		this.game.globals.levels = [];

		for(var i = 0; i < this.levelNames.length; i++) {
			var level = {
				name: this.levelNames[i], 
				map: this.game.cache.getTilemapData(this.levelNames[i] + '_map'),
				info: this.game.cache.getJSON(this.levelNames[i] + '_info')
			}
			this.game.globals.levels.push(level);
		}

		this.state.start('MainMenu');
	}

}