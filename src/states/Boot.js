class Boot extends Phaser.State {

	preload() {
		console.log("Boot started");

		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;
	}

	create() {

		console.log("Boot finished");
		this.game.state.start('Preload');
	}

}