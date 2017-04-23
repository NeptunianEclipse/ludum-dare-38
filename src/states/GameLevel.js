// GameLevel is the state where the actual game levels are run
class GameLevel extends Phaser.State {
	
    // This is called when the state is started. The parameters correspond to those given in the game.state.start call
    init(levelIndex, levelName) {
        if(levelIndex != undefined) {
            this.levelIndex = levelIndex;
            this.level = this.game.globals.levels[levelIndex];

        } else if(levelName != undefined) {
            var levels = this.game.globals.levels;

            for(var i = 0; i < levels.length; i++) {
                if(levels[i].name == levelName) {
                    this.levelIndex = i;
                    this.level = levels[i];
                }
            }
        }
        
    }

	create() {
        if(this.level != undefined) {
            this.map = new Map(this.game, this.level.name + '_map', 16, 16);
        } else {
            throw "No level was loaded";
        }   
	}

	update() {
        
	}
	
}

// This class serves as a wrapper around the Tilemap object
class Map {

    constructor(game, mapKey, tileWidth, tileHeight) {
        this.game = game;
        this.map = this.game.add.tilemap(mapKey, tileWidth, tileHeight);
        this.map.addTilesetImage('tiles');

        this.layer = this.map.createLayer(0);
        this.layer.resizeWorld();
    }

    getTileType(x, y) {
        return this.map.getTile(x, y).index;
    }

}


TileType = {
    circuitBoard: 1,
    wirePath: 2,
    powerSource: 3
}