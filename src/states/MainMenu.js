// MainMenu is the third state, switched to after Preload finishes. The state may also be switched back to when the player exits a level
// It is used to manage and display the main menu UI, and to start a level
class MainMenu extends Phaser.State {

	create() {
		this.createUI();

		
	}

	createUI() {
		this.UI = {};

		this.UI.titleText = this.game.add.text(10, 10, 'Debug Defence', { fontSize: 50, fill: '#FFF', boundsAlignH: 'center', boundsAlignV: 'middle' });
		this.UI.titleText.setTextBounds(10, 10, this.game.width - 20, 200);

		this.UI.graphics = this.game.add.graphics(0, 0);

		var levelSelectBoxWidth = 400;
		var levelSelectBoxHeight = this.game.globals.levels.length * 90 + 10;

		var levelSelectBoxLeft = this.game.width / 2 - levelSelectBoxWidth / 2;
		var levelSelectBoxTop = this.game.height / 2 - levelSelectBoxHeight / 2;

		this.UI.graphics.beginFill(0x202020, 1);
		this.UI.graphics.drawRect(levelSelectBoxLeft, levelSelectBoxTop, levelSelectBoxWidth, levelSelectBoxHeight);

		this.UI.levelButtons = [];
		for(var i = 0; i < this.game.globals.levels.length; i++) {
			(function(i) {
				var button = this.game.add.existing(new LabelButton(this.game, levelSelectBoxLeft + 10, levelSelectBoxTop + 10 + 90 * i, levelSelectBoxWidth - 20, 80, 'Level ' + i, () => { this.loadLevel(i) }));	
				if(this.game.globals.levels[i].unlocked === false) {
					button.disable();	
				}
				
				this.UI.levelButtons[i] = button;
			}).call(this, i);
		}
	}

	loadLevel(index, name) {
		this.game.state.start('GameLevel', true, null, index, name);
	}

}