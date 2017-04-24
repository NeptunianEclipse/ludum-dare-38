class Network {

	constructor(game, state, index, basePower, sourceX, sourceY, direction, tiles) {
		this.game = game;
		this.state = state;
		this.index = index;
		this.basePower = basePower;
		this.sourceX = sourceX;
		this.sourceY = sourceY;
		this.direction = direction;
		this.tiles = tiles;

		this.towers = [];

		this.colour = Network.colours[this.index];

		this.powerChangedCallbacks = [];
	}

	getPowerProduction() {
		var production = this.basePower;

		for(var tower of this.towers) {
			if(tower.powerUsage < 0) {
				production += -tower.powerUsage;
			}
		}

		return production;
	}

	getPowerUsage() {
		var usage = 0;

		for(var tower of this.towers) {
			if(tower.powerUsage > 0) {
				usage += tower.powerUsage;
			}
		}

		return usage;
	}

	getPowerAvailable() {
		var available = this.basePower;

		for(var tower of this.towers) {
			available += -tower.powerUsage;
		}

		return available;
	}

	addTower(tower) {
		this.towers.push(tower);

		this.onPowerChanged();
	}

	registerPowerChangedCallback(callback, context) {
        this.powerChangedCallbacks.push({ callback: callback, context: context });
    }

    onPowerChanged() {
        if(this.powerChangedCallbacks.length > 0) {
            for(var callback of this.powerChangedCallbacks) {
                callback.callback.call(callback.context, this);
            }
        }
    }

}

Network.colours = [0x80FF80, 0x80FFFF, 0x8080FF, 0xFF80FF, 0xFF8080];
