class Enemy extends Phaser.Sprite {

    constructor(game, spawnX, spawnY, texture, maxHealth, initialHealth, speed, path) {
        super(game, spawnX, spawnY, texture);

        this.spawnX = spawnX;
        this.spawnY = spawnY;
        this.maxHealth = maxHealth;
        this.initialHealth = initialHealth;
        this.speed = speed;
        this.path = path;

        this.health = this.initialHealth;

        this.pathIndex = 0;
        this.destination = this.path[this.pathIndex];

        this.game.physics.arcade.enable(this);
        this.enableBody = true;
        this.body.immovable = true;
    }

    takeDamage(damage) {
        this.health -= damage;

        if(this.health <= 0) {
            this.kill();
        }

        return this.health <= 0 ? (damage + this.health) : damage;
    }

    update() {

    }

}

class Ant extends Enemy {

    constructor(game, spawnX, spawnY, path) {
        if(spawnX == undefined || spawnY == undefined) {
            spawnX = path[0].x;
            spawnY = path[0].y;
        }

        super(game, spawnX, spawnY, 'ant', 2, 2, 60, path);

        this.anchor = new Phaser.Point(0.5, 0.5);
    }

    update() {
        var directionVector = (new Phaser.Point(this.destination.x - this.x, this.destination.y - this.y)).normalize();
        this.x += directionVector.x * this.speed * this.game.time.physicsElapsed;
        this.y += directionVector.y * this.speed * this.game.time.physicsElapsed;

        this.rotation = Math.atan2(directionVector.y, directionVector.x);

        if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), this.destination) < this.speed * this.game.time.physicsElapsed) {
            this.pathIndex++;
            if(this.pathIndex < this.path.length) {
                this.destination = this.path[this.pathIndex];
            }
        }
    }

}