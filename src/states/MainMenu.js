// MainMenu is the third state, switched to after Preload finishes. The state may also be switched back to when the player exits a level
// It is used to manage and display the main menu UI, and to start a level
class MainMenu extends Phaser.State {

	create() {
		this.game.state.start('GameLevel', false, false, undefined, "level1");
	}

}