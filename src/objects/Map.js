// This class stores and manages an array of tiles
class Map {

    // The size of the map (rendered) can be set through either, 1. tileWorldSize, 2. targetWorldWidth or 3. targetWorldHeight
    // (they are used in that order)
    constructor(game, mapVisuals, mapData, tilePixelSize, tileWorldSize, targetWorldWidth, targetWorldHeight) {
        this.game = game;

        var size = this.getCSVMapSize(mapVisuals);
        this.mapWidth = size.width;
        this.mapHeight = size.height - 1;

        this.tilePixelSize = tilePixelSize;

        if(tileWorldSize != null) {
            this.tileWorldSize = tileWorldSize;
        } else if(targetWorldWidth != null) {
            this.tileWorldSize = Math.floor(targetWorldWidth / this.mapWidth);
        } else if(targetWorldHeight != null) {
            this.tileWorldSize = Math.floor(targetWorldHeight / this.mapHeight);
        } else {
            this.tileWorldSize = tilePixelSize;
        }

        this.tileScaleFactor = this.tileWorldSize / this.tilePixelSize;

        this.worldWidth = this.tileWorldSize * this.mapWidth;
        this.worldHeight = this.tileWorldSize * this.mapHeight;

        this.mouseEnteredTileCallbacks = [];
        this.mouseClickedTileCallbacks = [];

        this.background = this.game.add.tileSprite(0, 0, this.worldWidth / (this.tileScaleFactor * 2), this.worldHeight / (this.tileScaleFactor * 2), 'tileBackground');
        this.background.scale.setTo(this.tileScaleFactor * 2, this.tileScaleFactor * 2);

        this.createTiles(mapVisuals, mapData);
    }

    getCSVMapSize(map) {
        var lines = map.split('\n');
        var line = lines[0].split(',');

        return {width: line.length, height: lines.length};
    }

    // Creates the corresponding grid of tile sprites for the given CSV maps
    createTiles(mapVisuals, mapData) {
        this.tilesContainer = this.game.add.group();
        this.tilesArray = [];

        var visualsRows = mapVisuals.split('\n');
        var dataRows = mapData.split('\n');

        for(var y = 0; y < visualsRows.length - 1; y++) {
            var visualsRow = visualsRows[y].split(',');
            var dataRow = dataRows[y].split(',');

            for(var x = 0; x < visualsRow.length; x++) {
                var tile = this.createTile(x, y, parseInt(visualsRow[x]), parseInt(dataRow[x]));

                tile.scale.setTo(this.tileScaleFactor * 1.05, this.tileScaleFactor * 1.05);

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
        var gridX = Math.floor(x / this.tileWorldSize);
        var gridY = Math.floor(y / this.tileWorldSize);

        return this.getTile(gridX, gridY);
    }

    // Returns the tile at the given grid coordinates
    getTile(x, y) {
        return this.tilesArray[x][y];
    }

    registerMouseEnteredTileCallback(callback, context) {
        this.mouseEnteredTileCallbacks.push({ callback: callback, context: context });
    }

    onMouseEnteredTile(tile) {
        if(this.mouseEnteredTileCallbacks.length > 0) {
            for(var callback of this.mouseEnteredTileCallbacks) {
                callback.callback.call(callback.context, tile);
            }
        }
    }

    registerMouseClickedTileCallback(callback, context) {
        this.mouseClickedTileCallbacks.push({ callback: callback, context: context });
    }

    onMouseClickedTile(tile) {
        if(this.mouseClickedTileCallbacks.length > 0) {
            for(var callback of this.mouseClickedTileCallbacks) {
                callback.callback.call(callback.context, tile);
            }
        }
    }

    get x() {
        return this.tilesContainer.x;
    }

    get y() {
        return this.tilesContainer.y;
    }

    set x(val) {
        this.tilesContainer.x = val;
    }

    set y(val) {
        this.tilesContainer.y = val;
    }

}

class Tile extends Phaser.Sprite {

    constructor(game, gridX, gridY, tileWorldSize, type, textureIndex, networkIndex) {
        super(game, gridX * tileWorldSize, gridY * tileWorldSize, 'tiles', textureIndex);

        this.tint = Tile.defaultTint;

        this.gridX = gridX;
        this.gridY = gridY;
        this.textureIndex = textureIndex;
        this.type = type;

        this.networkIndex = networkIndex;
    }

}

Tile.defaultTint = 0xFFA000;

Tile.TileType = {
    circuitBoard: 1,
    wirePath: 2,
    powerSource: 3,
    wireBridge: 4
}