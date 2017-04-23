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
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

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

        this.createTower(BasicTower, 5, 1);
        this.createTower(BasicTower, 6, 4);
        this.createTower(BasicTower, 7, 1);
        this.createTower(BasicTower, 8, 4);
        this.createTower(BasicTower, 9, 1);
        this.createTower(BasicTower, 10, 4);

    }

    update() {
        this.projectiles.forEachDead((projectile) => { projectile.destroy(); });
        this.enemies.forEachDead((enemy) => { enemy.destroy(); });

        console.log(this.projectiles.children.length);

        if(Math.random() <= 0.15) {
            this.spawnAnt();
        }

        this.game.physics.arcade.collide(this.projectiles, this.enemies, this.projectileHitEnemy);
    }

    projectileHitEnemy(projectile, enemy) {
        var damageDone = enemy.takeDamage(projectile.damage);
        projectile.takeDamage(damageDone);
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

    createProjectile(projClass, spawnX, spawnY, velocityX, velocityY) {
        var projectile = new projClass(this.game, spawnX, spawnY, velocityX, velocityY);
        this.projectiles.add(projectile);
    }

    createTower(towerClass, gridX, gridY) {
        var tower = new towerClass(this.game, this, gridX, gridY, this.map.tileWorldSize);
        this.towers.add(tower);
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
                var tile = this.createTile(x, y, parseInt(visualsRow[x]), parseInt(dataRow[x]));

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

    createTile(x, y, visualsNum, dataNum) {
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


        return new Tile(this.game, x, y, this.tileWorldSize, type, visualsNum, networkIndex);
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

    constructor(game, gridX, gridY, tileWorldSize, type, textureIndex, networkIndex) {
        super(game, gridX * tileWorldSize, gridY * tileWorldSize, 'tiles', textureIndex);

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

        this.game.physics.arcade.enable(this);
        this.enableBody = true;
        this.body.immovable = true;
    }

    takeDamage(damage) {
        this.health -= damage;

        if(this.health <= 0) {
            this.kill();
        }

        return this.health <= 0 ? (damage + this.health) : damage;
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

        super(game, spawnX, spawnY, 'ant', 2, 2, 60, path);

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

    constructor(game, state, gridX, gridY, tileWorldSize, texture, range) {
        super(game, gridX * tileWorldSize, gridY * tileWorldSize, texture);

        this.state = state;

        this.gridX = gridX;
        this.gridY = gridY;
        this.range = range;
    }

    getEnemiesInRange() {
        var enemies = this.state.enemies;
        var enemiesInRange = []

        for(var i = 0; i < enemies.children.length; i++) {
            if(enemies.children[i].alive) {
                if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), new Phaser.Point(enemies.children[i].x, enemies.children[i].y)) <= this.range) {
                    enemiesInRange.push(enemies.children[i]);
                }
            }
            
        }

        return enemiesInRange;
    }

}

class BasicTower extends Tower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, 'tower_basic', 50);

        this.projectileSpeed = 200;
        this.shootDelay = 500;

        this.nextShotTime = this.game.time.now;
    }

    update() {
        if(this.nextShotTime <= this.game.time.now) {
            var enemiesInRange = this.getEnemiesInRange();

            if(enemiesInRange.length > 0) {
                this.shoot(enemiesInRange[0].x, enemiesInRange[0].y);
                this.nextShotTime = this.game.time.now + this.shootDelay;
            }
        }
    }

    shoot(x, y) {
        var velocity = new Phaser.Point(x - this.x, y - this.y).setMagnitude(this.projectileSpeed);
        this.state.createProjectile(ChargeProjectile, this.x, this.y, velocity.x, velocity.y);
    }

}



class Projectile extends Phaser.Sprite {

    constructor(game, spawnX, spawnY, texture, velocityX, velocityY, health, damage) {
        super(game, spawnX, spawnY, texture);

        this.health = health;
        this.damage = damage;

        this.game.physics.arcade.enable(this, Phaser.Physics.ARCADE);
        this.enableBody = true;
        this.body.immovable = true;

        this.body.velocity.setTo(velocityX, velocityY);

    }

    update() {
        if(this.inWorld == false) {
            this.destroy();
        }
    }

    takeDamage(damage) {
        this.health -= damage;

        if(this.health <= 0) {
            this.kill();
        }

        return this.health <= 0 ? (damage + this.health) : damage;
    }

}

class ChargeProjectile extends Projectile {

    constructor(game, spawnX, spawnY, velocityX, velocityY) {
        super(game, spawnX, spawnY, 'charge', velocityX, velocityY, 2, 1);
    }

    

}









