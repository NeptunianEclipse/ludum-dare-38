class Game extends Phaser.Game {

	constructor() {
		super(480, 320, Phaser.CANVAS);

		this.globals = {};

		this.state.add('Boot', Boot, false);
		this.state.add('Preload', Preload, false);
		this.state.add('MainMenu', MainMenu, false);
		this.state.add('GameLevel', GameLevel, false);

		this.state.start('Boot');
	}

}

new Game();