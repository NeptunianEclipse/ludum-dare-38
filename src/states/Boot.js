// Boot is the first state that is switched to when the game is run
// It is used for setting up the base game settings and starting the loading of files that are needed in the Preload state
class Boot extends Phaser.State {

	preload() {
		this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.game.scale.pageAlignHorizontally = true;
		this.game.scale.pageAlignVertically = true;

		this.game.load.json('levelList', 'src/static/levelData/levelList.json');
	}

	create() {
		this.game.state.start('Preload');
	}

}