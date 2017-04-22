class Game extends Phaser.Game {

	constructor() {
		super(480, 320, Phaser.CANVAS);

		this.state.add('Boot', Boot, false);
		this.state.add('Preload', Preload, false);
		this.state.add('Main', Main, false);

		this.state.start('Boot');
	}

}

new Game();