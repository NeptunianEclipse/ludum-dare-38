class Tower extends Phaser.Sprite {

    constructor(game, state, gridX, gridY, tileWorldSize, texture, powerUsage) {
        super(game, gridX * tileWorldSize, gridY * tileWorldSize, texture);

        this.state = state;

        this.gridX = gridX;
        this.gridY = gridY;
        this.powerUsage = powerUsage;
    }

}

class TargetingTower extends Tower {

    constructor(game, state, gridX, gridY, tileWorldSize, texture, powerUsage, range, projectileClass, projectileSpeed, shootDelay) {
        super(game, state, gridX, gridY, tileWorldSize, texture, powerUsage);

        this.range = range;
        this.projectileClass = projectileClass;
        this.projectileSpeed = projectileSpeed;
        this.shootDelay = shootDelay;

        this.nextShotTime = this.game.time.now;
    }

    getEnemiesInRange() {
        var enemies = this.state.enemies;
        var enemiesInRange = [];

        for(var i = 0; i < enemies.children.length; i++) {
            if(enemies.children[i].alive) {
                if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), new Phaser.Point(enemies.children[i].x, enemies.children[i].y)) <= this.range) {
                    enemiesInRange.push(enemies.children[i]);
                }
            }

        }

        return enemiesInRange;
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
        this.state.createProjectile(this.projectileClass, this.x, this.y, velocity.x, velocity.y);
    }

}


class BasicTower extends TargetingTower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, 'tower_basic', 1, 50, ChargeProjectile, 200, 500);
    }

}

class PiercingTower extends TargetingTower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, 'tower_piercing', 2, 80, PiercingProjectile, 500, 2000);
    }

}

class GeneratorTower extends Tower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, 'tower_generator', -5);
    }

}