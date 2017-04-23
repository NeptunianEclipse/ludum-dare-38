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
        // this.game.physics.startSystem(Phaser.Physics.ARCADE);

        if(this.level != undefined) {
            var mapVisuals = this.game.cache.getTilemapData(this.level.name + '_map_visuals').data;
            var mapData = this.game.cache.getTilemapData(this.level.name + '_map_data').data;

            this.map = new Map(this.game, mapVisuals, mapData, 16, 12);
        } else {
            throw 'No level was loaded';
        }

        this.levelInfo = this.game.cache.getJSON(this.level.name + '_info');

        this.enemyPath = this.formatPath(this.levelInfo.enemyPath);
        this.enemies = this.game.add.group();

        this.towers = this.game.add.group();

        this.projectiles = this.game.add.group();
	}

    update() {
        if(Math.random() <= 0.05) {
            this.spawnAnt();
        }
    }

    spawnAnt() {
        var ant = new Ant(this.game, null, null, this.enemyPath);
        this.enemies.add(ant);
    }

    formatPath(path) {
        var newPath = [];
        for(var i = 0; i < path.length; i++) {
            newPath.push(new Phaser.Point(path[i].x * this.map.tileWorldSize, path[i].y * this.map.tileWorldSize));
        }

        return newPath;
    }
	
}

// This class serves as a wrapper around the Tilemap object
class Map {

    constructor(game, mapVisuals, mapData, tilePixelSize, tileWorldSize) {
        this.game = game;
        this.tilePixelSize = tilePixelSize;
        this.tileWorldSize = tileWorldSize;

        this.createTiles(mapVisuals, mapData);
    }

    // Creates the corresponding grid of tile sprites for the given CSV maps
    createTiles(mapVisuals, mapData) {
        this.tilesContainer = this.game.add.group();
        this.tilesArray = [];

        var tileScaleFactor = this.tileWorldSize / this.tilePixelSize;

        var visualsRows = mapVisuals.split('\n');
        var dataRows = mapData.split('\n');

        for(var y = 0; y < visualsRows.length - 1; y++) {
            var visualsRow = visualsRows[y].split(',');
            var dataRow = dataRows[y].split(',');

            for(var x = 0; x < visualsRow.length; x++) {
                var tile = this.createTile(x, y, tileScaleFactor, parseInt(visualsRow[x]), parseInt(dataRow[x]));

                tile.scale.setTo(tileScaleFactor, tileScaleFactor);

                this.game.add.existing(tile);
                this.tilesContainer.add(tile);

                this.tilesArray[x] = this.tilesArray[x] || [];
                this.tilesArray[x][y] = tile;
            }
        }

        this.width = this.tilesArray.length;
        this.height = this.tilesArray[0].length;
    }

    createTile(x, y, tileScaleFactor, visualsNum, dataNum) {
        var type;
        var networkIndex;

        if(dataNum == 0) {
            type = Tile.TileType.circuitBoard;

        }

        if(dataNum >= 8) {
            if(dataNum % 8 == 0) {
                type = Tile.TileType.wirePath;

            } else if((dataNum + 1) % 8 == 0) {
                type = Tile.TileType.powerSource;

            } else if((dataNum + 2) % 8 == 0) {
                type = Tile.TileType.wireBridge;

            }

            networkIndex = Math.floor(dataNum / 8) - 1;
        }


        return new Tile(this.game, x, y, this.tilePixelSize, tileScaleFactor, type, visualsNum, networkIndex);
    }

    // Returns the tile located at the given world coordinates
    getTileAtWorldCoord(x, y) {
        var tileScaleFactor = this.tileWorldSize / this.tilePixelSize;

        var gridX = Math.floor(x / this.tileWorldSize);
        var gridY = Math.floor(y / this.tileWorldSize);

        return this.getTile(gridX, gridY);
    }

    // Returns the tile at the given grid coordinates
    getTile(x, y) {
        return this.tilesArray[x][y];
    }

}

class Tile extends Phaser.Sprite {

    constructor(game, gridX, gridY, tileSize, tileScaleFactor, type, textureIndex, networkIndex) {
        super(game, (gridX * tileSize) * tileScaleFactor, (gridY * tileSize) * tileScaleFactor, 'tiles', textureIndex);

        this.gridX = gridX;
        this.gridY = gridY;
        this.textureIndex = textureIndex;
        this.type = type;

        this.networkIndex = networkIndex;
    }

}

Tile.TileType = {
    circuitBoard: 1,
    wirePath: 2,
    powerSource: 3,
    wireBridge: 4
}



class Enemy extends Phaser.Sprite {

    constructor(game, spawnX, spawnY, texture, maxHealth, initialHealth, speed, path) {
        super(game, spawnX, spawnY, texture);

        this.spawnX = spawnX;
        this.spawnY = spawnY;
        this.maxHealth = maxHealth;
        this.initialHealth = initialHealth;
        this.speed = speed;
        this.path = path;

        this.health = this.initialHealth;

        this.pathIndex = 0;
        this.destination = this.path[this.pathIndex];

        // this.enableBody = true;
        // this.body.immovable = true;
    }

    update() {

    }

}

class Ant extends Enemy {

    constructor(game, spawnX, spawnY, path) {
        if(spawnX == undefined || spawnY == undefined) {
            spawnX = path[0].x;
            spawnY = path[0].y;
        }

        super(game, spawnX, spawnY, 'ant', 200, 200, 80, path);

        this.anchor = new Phaser.Point(0.5, 0.5);
    }

    update() {
        var directionVector = (new Phaser.Point(this.destination.x - this.x, this.destination.y - this.y)).normalize();
        this.x += directionVector.x * this.speed * this.game.time.physicsElapsed;
        this.y += directionVector.y * this.speed * this.game.time.physicsElapsed;

        this.rotation = Math.atan2(directionVector.y, directionVector.x);

        if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), this.destination) < this.speed * this.game.time.physicsElapsed) {
            this.pathIndex++;
            if(this.pathIndex < this.path.length) {
                this.destination = this.path[this.pathIndex];
            }
        }
    }

}



class Tower extends Phaser.Sprite {

    constructor() {

    }

}



class Projectile extends Phaser.Sprite {

    constructor() {

    }

}











