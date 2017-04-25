class Projectile extends Phaser.Sprite {

    constructor(game, spawnX, spawnY, texture, velocityX, velocityY, health, damage) {
        super(game, spawnX, spawnY, texture);

        this.hitEnemies = [];

        this.health = health;
        this.damage = damage;

        this.game.physics.arcade.enable(this, Phaser.Physics.ARCADE);
        this.enableBody = true;
        this.body.immovable = true;

        this.body.velocity.setTo(velocityX, velocityY);

    }

    update() {
        if(this.inWorld == false) {
            this.destroy();
        }
    }

    takeDamage(damage, enemy) {
        this.health -= damage;

        if(this.health <= 0) {
            this.kill();
        }

        this.hitEnemies.push(enemy);

        return this.health <= 0 ? (damage + this.health) : damage;
    }

    hasHit(enemy) {
        return this.hitEnemies.includes(enemy);
    }

}

class ChargeProjectile extends Projectile {

    constructor(game, spawnX, spawnY, velocityX, velocityY) {
        super(game, spawnX, spawnY, 'projectile_charge', velocityX, velocityY, 1, 2);
    }

}

class PiercingProjectile extends Projectile {

    constructor(game, spawnX, spawnY, velocityX, velocityY) {
        super(game, spawnX, spawnY, 'projectile_piercing', velocityX, velocityY, Infinity, 1);
    }

}

class FlameProjectile extends Projectile {

    constructor(game, spawnX, spawnY, velocityX, velocityY, range) {
        super(game, spawnX, spawnY, 'projectile_flame', velocityX, velocityY, Infinity, 0.3);

        this.spawnX = spawnX;
        this.spawnY = spawnY;
        this.range = range;
    }

    update() {
        if(this.inWorld == false) {
            this.destroy();
        }

        var distance = Phaser.Point.distance(new Phaser.Point(this.x, this.y), new Phaser.Point(this.spawnX, this.spawnY));

        if(distance > this.range) {
            this.destroy();
        }

        this.alpha = Math.min(1.5 - distance / this.range, 1);
    }
}
