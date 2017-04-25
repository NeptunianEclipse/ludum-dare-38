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

            this.map = new Map(this.game, mapVisuals, mapData, 16, null, null, this.game.height - 100);
        } else {
            throw 'No level was loaded';
        }

        this.levelInfo = this.game.cache.getJSON(this.level.name + '_info');
        this.networks = this.createNetworks();

        this.enemyPath = this.formatPath(this.levelInfo.enemyPath);
        this.enemies = this.game.add.group();
        this.towers = this.game.add.group();
        this.projectiles = this.game.add.group();

        this.storedEnergy = 400;
        this.health = 20;

        this.createUI();

        for(var highlightGroup of this.UI.networkHighlights) {
            this.game.world.bringToTop(highlightGroup);
        }
        this.game.world.bringToTop(this.towers);
        this.game.world.bringToTop(this.UI.rangeGraphics);
        this.UI.towerPreviewSprite.bringToTop();
        this.game.world.bringToTop(this.UI.gameLostDialog);
        this.game.world.bringToTop(this.UI.gameWonDialog);

        this.game.input.addMoveCallback(this.mouseMoved, this);
        this.game.input.onUp.add(this.mouseClicked, this);

        this.game.camera.bounds = null;
        this.game.camera.x = -50;
        this.game.camera.y = -50;

        this.enemyClasses = {
            'Ant': Ant
        }

        this.waveIndex = 0;
        this.wavesFinished = false;
        this.nextWave();
    }

    createUI() {
        this.UI = {};

        this.UI.selectedTower = null;

        this.createFixedUI();

        // Create tower placement preview
        this.UI.towerPreviewSprite = this.game.add.sprite(0, 0, null);
        this.UI.towerPreviewSprite.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);
        this.UI.towerPreviewSprite.alpha = 0.5;

        this.UI.rangeGraphics = this.game.add.graphics(0, 0);
        this.UI.rangeGraphics.alpha = 0.5;

        this.selectTower(BasicTower, 'tower_basic');

        // Create power indicators
        this.UI.networkPowerIndicators = [];
        for(var network of this.networks) {
            var direction = network.direction;

            var xOff = direction == "left" ? -1 : (direction == "right" ? 1 : 0);
            var yOff = direction == "up" ? -1 : (direction == "down" ? 1 : 0);

            var indicatorSprite = this.game.add.sprite((network.sourceX + xOff * 1 + 0.5) * this.map.tileWorldSize, (network.sourceY + yOff * 1 + 0.5) * this.map.tileWorldSize, 'powerIndicator');
            var indicatorText = this.game.add.text(this.map.tileWorldSize * 0.25, 0, 'P', { fill: '#000', fontSize: 25 });

            indicatorSprite.anchor.setTo(0.5, 0.5);
            indicatorText.anchor.setTo(0.5, 0.5);

            indicatorSprite.text = indicatorText;
            indicatorSprite.addChild(indicatorText);

            indicatorSprite.tint = network.colour;

            indicatorSprite.inputEnabled = true;
            indicatorSprite.events.onInputOver.add(this.mouseEnteredPowerIndicator, this);
            indicatorSprite.events.onInputOut.add(this.mouseLeftPowerIndicator, this);

            this.UI.networkPowerIndicators.push(indicatorSprite);

            this.networkPowerChanged(network);
        }

        // Create network highlights
        this.UI.networkHighlights = [];
        for(var i = 0; i < this.networks.length; i++) {
            var network = this.networks[i];
            var networkHighlight = this.game.add.group();
            networkHighlight.visible = false;

            for(var tile of network.tiles) {
                var highlightSprite = this.game.add.sprite(tile.x, tile.y, tile.key, tile.frame);

                highlightSprite.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);
                highlightSprite.tint = network.colour;

                networkHighlight.add(highlightSprite);
            }

            this.UI.networkHighlights[i] = networkHighlight;
        }


    }

    createFixedUI() {
        this.UI.fixedGroup = this.game.add.group();
        this.UI.fixedGroup.fixedToCamera = true;

        var sidebarWidth = 400;
        var sidebarLeft = this.game.width - sidebarWidth

        this.UI.uiGraphics = this.game.add.graphics(0, 0);

        // Draw sidebar
        this.UI.uiGraphics.beginFill(0x202020, 1);
        this.UI.uiGraphics.drawRect(sidebarLeft, 0, sidebarWidth, this.game.height);

        this.UI.levelText = this.game.add.text(sidebarLeft + 20, 20, 'Level ' + this.levelIndex, { fill: '#FFF', fontSize: 26});
        this.UI.exitButton = this.game.add.existing(new LabelButton(this.game, this.game.width - 120, 20, 100, 40, 'Exit', this.mainMenu, this));

        // Draw description box
        this.UI.uiGraphics.beginFill(0x404040, 1);
        this.UI.uiGraphics.drawRect(sidebarLeft + 20, 100, sidebarWidth - 40, 120);

        this.UI.selectedTowerPreview = this.game.add.sprite(sidebarLeft + 40, 120);
        this.UI.selectedTowerPreview.scale.setTo(this.map.tileScaleFactor * 3, this.map.tileScaleFactor  * 3);
        this.UI.selectedTowerText = this.game.add.text(sidebarLeft + 140, 120, 'None', { fill: '#fff', fontSize: 20 });

        this.UI.descriptionText = this.game.add.text(sidebarLeft + 140, 160, 'Consumes 5 power', { fill: '#FFF', fontSize: 16});

        this.UI.basicTowersText = this.game.add.text(sidebarLeft + 20, 240, 'Basic Towers', { fill: '#FFF', fontSize: 24});

        // Draw basic towers box
        this.UI.uiGraphics.beginFill(0x404040, 1);
        this.UI.uiGraphics.drawRect(sidebarLeft + 20, 280, sidebarWidth - 40, 120);

        // Create basic tower selection buttons
        var basicTowerButtonClasses = [BasicTower, PiercingTower];
        this.basicTowerButtons = {};
        for(var i = 0; i < basicTowerButtonClasses.length; i++) {
            (function(i) {
                var towerClass = basicTowerButtonClasses[i];

                var button = this.game.add.button(sidebarLeft + 80 * i + 40, 300, towerClass.const.key, () => { this.selectTower(towerClass) });
                button.scale.setTo(this.map.tileScaleFactor * 2, this.map.tileScaleFactor * 2);

                this.basicTowerButtons[towerClass.const.name] = button;
            }).call(this, i);
        }

        this.UI.specialTowersText = this.game.add.text(sidebarLeft + 20, 420, 'Special Towers', { fill: '#FFF', fontSize: 24});

        // Draw special towers box
        this.UI.uiGraphics.beginFill(0x404040, 1);
        this.UI.uiGraphics.drawRect(sidebarLeft + 20, 460, sidebarWidth - 40, 120);

        // Create special tower selection buttons
        var specialTowerButtonClasses = [GeneratorTower, CapacitorTower];
        this.specialTowerButtons = {};
        for(var i = 0; i < specialTowerButtonClasses.length; i++) {
            (function(i) {
                var towerClass = specialTowerButtonClasses[i];

                var button = this.game.add.button(sidebarLeft + 80 * i + 40, 480, towerClass.const.key, () => { this.selectTower(towerClass) });
                button.scale.setTo(this.map.tileScaleFactor * 2, this.map.tileScaleFactor * 2);

                this.specialTowerButtons[towerClass.const.name] = button;
            }).call(this, i);
        }

        // Draw energy box
        this.UI.uiGraphics.beginFill(0x404040, 1);
        this.UI.uiGraphics.drawRect(sidebarLeft + 20, 620, sidebarWidth - 40, 60);

        this.UI.energyText = this.game.add.text(sidebarLeft + 40, 640, 'Stored Energy: ' + this.storedEnergy, { fill: '#FFF', fontSize: 24});

        // Draw health box
        this.UI.uiGraphics.beginFill(0x404040, 1);
        this.UI.uiGraphics.drawRect(sidebarLeft + 20, 700, sidebarWidth - 40, 60);

        this.UI.healthText = this.game.add.text(sidebarLeft + 40, 720, 'Health: ' + this.health, { fill: '#FFF', fontSize: 24});


        // Dialogs
        this.UI.gameWonDialog = this.createGameWonDialog();
        this.UI.gameWonDialog.visible = false;

        this.UI.gameLostDialog = this.createGameLostDialog();
        this.UI.gameLostDialog.visible = false;

        this.UI.fixedGroup.addMultiple([
            this.UI.uiGraphics,
            this.UI.levelText,
            this.UI.exitButton,
            this.UI.basicTowersText,
            this.UI.selectedTowerPreview,
            this.UI.specialTowersText,
            this.UI.selectedTowerText,
            this.UI.energyText,
            this.UI.healthText,
            this.UI.descriptionText,
            this.UI.gameWonDialog,
            this.UI.gameLostDialog
        ].concat(Object.values(this.basicTowerButtons)).concat(Object.values(this.specialTowerButtons)));

    }

    createGameWonDialog() {
        var gameWonDialog = this.game.add.group();
        var dialogWidth = 500;
        var dialogHeight = 300;

        gameWonDialog.x = this.game.width / 2 - dialogWidth / 2;
        gameWonDialog.y = this.game.height / 2 - dialogHeight / 2;

        var graphics = this.game.add.graphics(0, 0);
        gameWonDialog.add(graphics);

        graphics.beginFill(0x505050, 1);
        graphics.drawRect(0, 0, dialogWidth, dialogHeight);

        var text = this.game.add.text(0, 0, 'Level passed!', { fill: '#FFF',  fontSize: 60, boundsAlignH: 'center', boundsAlignV: 'middle'});
        text.setTextBounds(0, 0, dialogWidth, dialogHeight - 50);

        var exitButton = this.game.add.existing(new LabelButton(this.game, 40, dialogHeight - 60, 200, 40, 'Exit', this.mainMenu, this));
        if(this.levelIndex < this.game.globals.levels.length - 1) {
            var nextButton = this.game.add.existing(new LabelButton(this.game, dialogWidth - 240, dialogHeight - 60, 200, 40, 'Next level', this.nextLevel, this));
            gameWonDialog.add(nextButton);
        }
        
        gameWonDialog.addMultiple([text, exitButton]);

        return gameWonDialog;
    }

    createGameLostDialog() {
        var gameLostDialog = this.game.add.group();
        var dialogWidth = 500;
        var dialogHeight = 300;

        gameLostDialog.x = this.game.width / 2 - dialogWidth / 2;
        gameLostDialog.y = this.game.height / 2 - dialogHeight / 2;

        var graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x505050, 1);
        graphics.drawRect(0, 0, dialogWidth, dialogHeight);

        var text = this.game.add.text(0, 0, 'Level failed', { fill: '#FFF',  fontSize: 60, boundsAlignH: 'center', boundsAlignV: 'middle'});
        text.setTextBounds(0, 0, dialogWidth, dialogHeight - 50);

        var exitButton = this.game.add.existing(new LabelButton(this.game, 40, dialogHeight - 60, 200, 40, 'Exit', this.mainMenu, this));
        var retryButton = this.game.add.existing(new LabelButton(this.game, dialogWidth - 240, dialogHeight - 60, 200, 40, 'Retry', this.retry, this));

        gameLostDialog.addMultiple([graphics, text, exitButton, retryButton]);

        return gameLostDialog;
    }

    showNetworkHighlight(networkIndex) {
        for(var i = 0; i < this.networks.length; i++) {
            if(i == networkIndex) {
                this.UI.networkHighlights[i].visible = true;
            } else {
                this.UI.networkHighlights[i].visible = false;
            }
        }
    }

    hideNetworkHighlights() {
        for(var i = 0; i < this.networks.length; i++) {
            this.UI.networkHighlights[i].visible = false;
        }
    }

    createNetworks() {
        var networkDataList = this.levelInfo.networks;
        var networkTiles = this.getNetworkTiles(networkDataList.length);

        var networks = [];

        for(var i = 0; i < networkDataList.length; i++) {
            var networkData = networkDataList[i];
            var network = new Network(this.game, this, i, networkData.basePower, networkData.sourceLocation.x, networkData.sourceLocation.y, networkData.sourceLocation.direction, networkTiles[i]);
            networks.push(network);

            network.registerPowerChangedCallback(this.networkPowerChanged, this);
        }

        return networks;
    }

    getNetworkTiles(numNetworks) {
        var networkTiles = [];
        for(var i = 0; i < numNetworks; i++) {
            networkTiles[i] = [];
        }

        for(var column of this.map.tilesArray) {
            for(var tile of column) {
                if(tile.type == Tile.TileType.wirePath || tile.type == Tile.TileType.wireBridge) {
                    networkTiles[tile.networkIndex].push(tile);
                }
            }
        }

        return networkTiles;
    }

    selectTower(towerClass) {
        this.UI.selectedTower = towerClass;
        this.UI.selectedTowerText.text = towerClass.const.name;

        var descriptionString = 'Consumes ' + this.UI.selectedTower.const.powerUsage + ' power';
        if(this.UI.selectedTower.prototype instanceof SpecialTower) {
            descriptionString += '\nCosts ' + this.UI.selectedTower.const.energyCost + ' energy to build';
        }
        if(this.UI.selectedTower.prototype instanceof TargetingTower) {
            descriptionString += '\nRange: ' + this.UI.selectedTower.const.range;
        }

        this.UI.descriptionText.text = descriptionString;
        this.UI.selectedTowerPreview.loadTexture(towerClass.const.key);
        this.UI.towerPreviewSprite.loadTexture(towerClass.const.key);
    }

    drawRangeCircle(x, y, range) {
        this.UI.rangeGraphics.clear();

        this.UI.rangeGraphics.beginFill(0x2060FF, 1);
        this.UI.rangeGraphics.drawCircle(x, y, range * 2);
    }

    nextWave() {
        if(this.waveIndex >= this.levelInfo.waves.length) {
            this.wavesFinished = true;
            return;
        }

        this.wave = this.levelInfo.waves[this.waveIndex];

        this.waveStartTime = this.game.time.now;
        this.waveFinishTime = this.game.time.now + this.wave.length;

        this.waveEnemies = [];
        for(var i = 0; i < this.wave.enemies.length; i++) {
            (function(i) {
                var enemyInterval = this.wave.length / this.wave.enemies[i].num;
                console.log(enemyInterval);
                this.waveEnemies[i] = { "enemy": this.enemyClasses[this.wave.enemies[i].enemy], "num": this.wave.enemies[i].num, "interval": enemyInterval, "nextSpawn": this.game.time.now + enemyInterval };
            }).call(this, i);
        }

        this.waveIndex++;
    }

    mouseMoved(pointer, x, y) {
        var mouseX = pointer.position.x + this.game.camera.x;
        var mouseY = pointer.position.y + this.game.camera.y;

        if(mouseX > 0 && mouseX < this.map.worldWidth && mouseY > 0 && mouseY < this.map.worldHeight) {
            var tile = this.map.getTileAtWorldCoord(mouseX, mouseY);

            this.UI.towerPreviewSprite.visible = true;

            this.UI.towerPreviewSprite.x = tile.x;
            this.UI.towerPreviewSprite.y = tile.y;

            var range = 0;
            if(this.UI.selectedTower instanceof TargetingTower) {
                range = this.UI.selectedTower.const.range;
            }
            this.drawRangeCircle(tile.x + this.map.tileWorldSize * 0.5, tile.y + this.map.tileWorldSize * 0.5, range);

            if(tile.type == Tile.TileType.wirePath) {
                this.showNetworkHighlight(tile.networkIndex);
            } else {
                this.hideNetworkHighlights();
            }
        } else {
            this.UI.towerPreviewSprite.visible = false;
            this.UI.rangeGraphics.clear();
        }
    }

    mouseClicked(pointer) {
        var mouseX = pointer.position.x + this.game.camera.x;
        var mouseY = pointer.position.y + this.game.camera.y;

        if(mouseX > 0 && mouseX < this.map.worldWidth && mouseY > 0 && mouseY < this.map.worldHeight) {
            var tile = this.map.getTileAtWorldCoord(mouseX, mouseY);

            if(this.getTower(tile.gridX, tile.gridY) == null && tile.type == Tile.TileType.wirePath) {
                this.createTower(this.UI.selectedTower, tile.gridX, tile.gridY);
            }
        }
    }

    mouseEnteredPowerIndicator(indicatorSprite) {
        var networkIndex = this.UI.networkPowerIndicators.indexOf(indicatorSprite);

        this.showNetworkHighlight(networkIndex);
    }

    mouseLeftPowerIndicator(indicatorSprite) {
        this.hideNetworkHighlights();
    }

    mouseClickedTile(tile) {
        if(this.getTower(tile.gridX, tile.gridY) == null && tile.type == Tile.TileType.wirePath) {
            this.createTower(this.UI.selectedTower, tile.gridX, tile.gridY);
        }

    }

    networkPowerChanged(network) {
        if(this.UI != null) {
            this.UI.networkPowerIndicators[network.index].text.text = network.getPowerAvailable();
        }
    }

    update() {
        this.projectiles.forEachDead((projectile) => { projectile.destroy(); });
        this.enemies.forEachDead((enemy) => { enemy.destroy(); });

        if(this.wavesFinished === false) {
            if(this.game.time.now > this.waveFinishTime) {
                this.nextWave();
            }

            for(var i = 0; i < this.waveEnemies.length; i++) {
                if(this.game.time.now > this.waveEnemies[i].nextSpawn) {
                    this.spawnEnemy(this.waveEnemies[i].enemy);
                    this.waveEnemies[i].nextSpawn += this.waveEnemies[i].interval;
                }
            }
        }

        if(this.wavesFinished && this.enemies.total == 0) {
            this.gameWon();
        }


        this.game.physics.arcade.collide(this.projectiles, this.enemies, this.projectileHitEnemy);
    }

    projectileHitEnemy(projectile, enemy) {
        if(!projectile.hasHit(enemy)){
            var damageDone = enemy.takeDamage(projectile.damage);
            projectile.takeDamage(damageDone, enemy);
        }
    }

    spawnEnemy(enemyClass, x, y) {
        var enemy = new enemyClass(this.game, this, x, y, this.enemyPath);
        enemy.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);
        this.enemies.add(enemy);
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
        projectile.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);
        this.projectiles.add(projectile);
    }

    createTower(towerClass, gridX, gridY) {
        var tower = new towerClass(this.game, this, gridX, gridY, this.map.tileWorldSize);
        var networkIndex = this.map.getTile(tower.gridX, tower.gridY).networkIndex;

        if(towerClass.const.powerUsage > this.networks[networkIndex].getPowerAvailable()) return;

        if(tower instanceof SpecialTower) {
            if(towerClass.const.energyCost <= this.storedEnergy) {
                this.useEnergy(towerClass.const.energyCost);
            } else {
                return;
            }
        }

        tower.scale.setTo(this.map.tileScaleFactor, this.map.tileScaleFactor);

        this.towers.add(tower);
        this.addTowerToNetwork(tower);


    }

    addTowerToNetwork(tower) {
        var networkIndex = this.map.getTile(tower.gridX, tower.gridY).networkIndex;

        this.networks[networkIndex].addTower(tower);
    }

    getTower(x, y) {
        for(var tower of this.towers.children) {
            if(tower.gridX == x && tower.gridY == y) {
                return tower;
            }
        }

        return null;
    }

    useEnergy(amount) {
        this.storedEnergy -= amount;
        this.UI.energyText.text = 'Stored Energy: ' + Math.round(this.storedEnergy);
    }

    gameWon() {
        this.game.paused = true;

        if(this.levelIndex < this.game.globals.levels.length - 1) {
            this.game.globals.levels[this.levelIndex + 1].unlocked = true;
        }
        
        this.UI.gameWonDialog.visible = true;
    }

    gameLost() {
        this.game.paused = true;

        this.UI.gameLostDialog.visible = true;
    }

    mainMenu() {
        this.game.paused = false;
        this.game.state.start('MainMenu', true, null);
    }

    retry() {
        this.game.paused = false;
        this.game.state.restart(true, null, this.levelIndex);
    }

    nextLevel() {
        this.game.paused = false;
        this.game.state.restart(true, null, this.levelIndex + 1);
    }

    reduceHealth(amount) {
        this.health -= amount;

        this.UI.healthText.text = 'Health: ' + this.health;

        if(this.health <= 0) {
            this.gameLost();
        }
    }

}

class LabelButton extends Phaser.Button {

    constructor(game, x, y, width, height, text, callback, callbackContext) {
        super(game, x, y, 'whiteBox', callback, callbackContext);

        this.tint = 0x606060;
        this.scale.setTo(width / 16, height / 16);

        this.textStyle = { fontSize: 25, fill: '#FFF', boundsAlignH: 'center', boundsAlignV: 'middle' }
        this.label = new Phaser.Text(game, 0, 0, text, this.textStyle);
        this.label.setTextBounds(0, 0, width, height);
        this.label.scale.setTo(1 / this.scale.x, 1 / this.scale.y)

        this.addChild(this.label);
    }

    disable() {
        this.tint = 0x303030;
        this.inputEnabled = false;
    }

    get text() {
        return this.label.text;
    }

    set text(val) {
        this.label.text = val;
    }


}
