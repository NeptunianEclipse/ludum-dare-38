// GameLevel is the state where the actual game levels are run
class GameLevel extends Phaser.State {

    // This is called when the state is started. The parameters correspond to those given in the game.state.start call
    init(levelIndex, levelName) {
        if(levelIndex != null) {
            this.levelIndex = levelIndex;
            this.level = this.game.globals.levels[levelIndex];

        } else if(levelName != null) {
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

        if(this.level != null) {
            var mapVisuals = this.game.cache.getTilemapData(this.level.name + '_map_visuals').data;
            var mapData = this.game.cache.getTilemapData(this.level.name + '_map_data').data;

            this.map = new Map(this.game, mapVisuals, mapData, 16, 12);

            this.map.registerMouseEnteredTileCallback(this.mouseEnteredTile, this);
            this.map.registerMouseClickedTileCallback(this.mouseClickedTile, this);
        } else {
            throw 'No level was loaded';
        }

        this.levelInfo = this.game.cache.getJSON(this.level.name + '_info');

        this.networks = this.createNetworks();

        this.enemyPath = this.formatPath(this.levelInfo.enemyPath);
        this.enemies = this.game.add.group();
        this.towers = this.game.add.group();
        this.projectiles = this.game.add.group();

        this.createTower(PiercingTower, 5, 1);

        this.createUI();
    }

    createUI() {
        this.UI = {};

        this.UI.selectedTower = null;

        this.UI.selectedTowerText = this.game.add.text(this.game.width - 175, 10, 'Selected: None', { fill: '#fff', fontSize: 12 });

        this.UI.towerButtons = {
            basicTower: this.game.add.button(this.game.width - 30, 10, 'tower_basic', () => { this.selectTower(BasicTower, 'tower_basic') } ),
            piercingTower: this.game.add.button(this.game.width - 30, 30, 'tower_piercing', () => { this.selectTower(PiercingTower, 'tower_piercing') } ),
            generatorTower: this.game.add.button(this.game.width - 30, 50, 'tower_generator', () => { this.selectTower(GeneratorTower, 'tower_generator') })
        }

        this.UI.towerPreview = this.game.add.sprite(0, 0, null);
        this.UI.towerPreview.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);
        this.UI.towerPreview.alpha = 0.5;

        this.selectTower(BasicTower, 'tower_basic');

    }

    createNetworks() {
        var networkDataList = this.levelInfo.networks;
        var networks = [];

        for(var i = 0; i < networkDataList.length; i++) {
            var network = new Network(this.game, this, i, networkDataList[i].basePower);
            networks.push(network);
        }

        return networks;
    }

    selectTower(towerClass, textureKey) {
        this.UI.selectedTower = towerClass;
        this.UI.selectedTowerText.text = 'Selected: ' + towerClass.name;
        this.UI.towerPreview.loadTexture(textureKey);
    }

    mouseEnteredTile(tile) {
        this.UI.towerPreview.x = tile.x;
        this.UI.towerPreview.y = tile.y;
    }

    mouseClickedTile(tile) {
        if(this.getTower(tile.gridX, tile.gridY) == null && tile.type == Tile.TileType.wirePath) {
            this.createTower(this.UI.selectedTower, tile.gridX, tile.gridY);
        }
        
    }

    update() {
        this.projectiles.forEachDead((projectile) => { projectile.destroy(); });
        this.enemies.forEachDead((enemy) => { enemy.destroy(); });

        if(Math.random() <= 0.15) {
            this.spawnAnt();
        }

        this.game.physics.arcade.collide(this.projectiles, this.enemies, this.projectileHitEnemy);
    }

    projectileHitEnemy(projectile, enemy) {
        if(!projectile.hasHit(enemy)){
            var damageDone = enemy.takeDamage(projectile.damage);
            projectile.takeDamage(damageDone, enemy);
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

    createProjectile(projClass, spawnX, spawnY, velocityX, velocityY) {
        var projectile = new projClass(this.game, spawnX, spawnY, velocityX, velocityY);
        this.projectiles.add(projectile);
    }

    createTower(towerClass, gridX, gridY) {
        var tower = new towerClass(this.game, this, gridX, gridY, this.map.tileWorldSize);
        tower.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);
        this.towers.add(tower);

        this.addTowerToNetwork(tower);
    }

    addTowerToNetwork(tower) {
        var networkIndex = this.map.getTile(tower.gridX, tower.gridY).networkIndex;

        this.networks[networkIndex].addTower(tower);
        console.log("Tower added to network " + networkIndex);
        console.log("Network power production: " + this.networks[networkIndex].getPowerProduction());
        console.log("Network power usage: " + this.networks[networkIndex].getPowerUsage());
    }

    getTower(x, y) {
        for(var tower of this.towers.children) {
            if(tower.gridX == x && tower.gridY == y) {
                return tower;
            }
        }

        return null;
    }

}
