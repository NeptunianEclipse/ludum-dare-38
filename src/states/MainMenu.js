class MainMenu extends Phaser.State {

	create() {

		
		this.game.state.start('GameLevel', false, false, undefined, "level2");
	}

}