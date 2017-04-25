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
        super(game, spawnX, spawnY, 'charge', velocityX, velocityY, 2, 1);
    }

}

class PiercingProjectile extends Projectile {

    constructor(game, spawnX, spawnY, velocityX, velocityY) {
        super(game, spawnX, spawnY, 'charge', velocityX, velocityY, Infinity, 1);
    }

}

class FlameProjectile extends Projectile {

    constructor(game, spawnX, spawnY, velocityX, velocityY, range) {
        super(game, spawnX, spawnY, 'charge', velocityX, velocityY, Infinity, 1);
        this.spawnX = spawnX;
        this.spawnY = spawnY;
    }

    update() {
        if(this.inWorld == false) {
            this.destroy();
        }
        if(Math.sqrt(Math.pow(Math.abs(this.x - this.spawnX), 2) + Math.pow(Math.abs(this.y - this.spawnY), 2)) >  ) {

        }
    }
}
