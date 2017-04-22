class Preload extends Phaser.State {

	preload() {
		console.log("Preload started");
	}

	create() {

		console.log("Preload finished");
		this.game.state.start('Main');
	}

}