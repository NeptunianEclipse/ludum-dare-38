class Network {

	constructor(game, state, index, basePower) {
		this.game = game;
		this.state = state;
		this.index = index;
		this.basePower = basePower;

		this.towers = [];
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

	addTower(tower) {
		this.towers.push(tower);
	}

}