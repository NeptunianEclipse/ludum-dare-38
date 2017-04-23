class Tower extends Phaser.Sprite {

    constructor(game, state, gridX, gridY, tileWorldSize, texture, range) {
        super(game, gridX * tileWorldSize, gridY * tileWorldSize, texture);

        this.state = state;

        this.gridX = gridX;
        this.gridY = gridY;
        this.range = range;
    }

    getEnemiesInRange() {
        var enemies = this.state.enemies;
        var enemiesInRange = []

        for(var i = 0; i < enemies.children.length; i++) {
            if(enemies.children[i].alive) {
                if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), new Phaser.Point(enemies.children[i].x, enemies.children[i].y)) <= this.range) {
                    enemiesInRange.push(enemies.children[i]);
                }
            }

        }

        return enemiesInRange;
    }

}

class BasicTower extends Tower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, 'tower_basic', 50);

        this.projectileSpeed = 200;
        this.shootDelay = 500;

        this.nextShotTime = this.game.time.now;
    }

    update() {
        if(this.nextShotTime <= this.game.time.now) {
            var enemiesInRange = this.getEnemiesInRange();

            if(enemiesInRange.length > 0) {
                this.shoot(enemiesInRange[0].x, enemiesInRange[0].y);
                this.nextShotTime = this.game.time.now + this.shootDelay;
            }
        }
    }

    shoot(x, y) {
        var velocity = new Phaser.Point(x - this.x, y - this.y).setMagnitude(this.projectileSpeed);
        this.state.createProjectile(ChargeProjectile, this.x, this.y, velocity.x, velocity.y);
    }

}

class PiercingTower extends Tower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, 'tower_basic', Infinity);

        this.projectileSpeed = 500;
        this.shootDelay = 2000;

        this.nextShotTime = this.game.time.now;
    }

    update() {
        if(this.nextShotTime <= this.game.time.now) {
            var enemiesInRange = this.getEnemiesInRange();

            if(enemiesInRange.length > 0) {
                this.shoot(enemiesInRange[0].x, enemiesInRange[0].y);
                this.nextShotTime = this.game.time.now + this.shootDelay;
            }
        }
    }

    shoot(x, y) {
        var velocity = new Phaser.Point(x - this.x, y - this.y).setMagnitude(this.projectileSpeed);
        this.state.createProjectile(PiercingProjectile, this.x, this.y, velocity.x, velocity.y);
    }

}