// This class stores and manages an array of tiles
class Map {

    constructor(game, mapVisuals, mapData, tilePixelSize, tileWorldSize) {
        this.game = game;
        this.tilePixelSize = tilePixelSize;
        this.tileWorldSize = tileWorldSize;

        this.mouseEnteredTileCallbacks = [];
        this.mouseClickedTileCallbacks = [];

        this.createTiles(mapVisuals, mapData);
    }

    // Creates the corresponding grid of tile sprites for the given CSV maps
    createTiles(mapVisuals, mapData) {
        this.tilesContainer = this.game.add.group();
        this.tilesArray = [];

        this.tileScaleFactor = this.tileWorldSize / this.tilePixelSize;

        var visualsRows = mapVisuals.split('\n');
        var dataRows = mapData.split('\n');

        for(var y = 0; y < visualsRows.length - 1; y++) {
            var visualsRow = visualsRows[y].split(',');
            var dataRow = dataRows[y].split(',');

            for(var x = 0; x < visualsRow.length; x++) {
                var tile = this.createTile(x, y, parseInt(visualsRow[x]), parseInt(dataRow[x]));

                tile.scale.setTo(this.tileScaleFactor, this.tileScaleFactor);

                this.game.add.existing(tile);
                this.tilesContainer.add(tile);

                tile.inputEnabled = true;
                tile.events.onInputOver.add(this.onMouseEnteredTile, this);
                tile.events.onInputUp.add(this.onMouseClickedTile, this);

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