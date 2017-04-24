class Enemy extends Phaser.Sprite {

    constructor(game, spawnX, spawnY, texture, maxHealth, initialHealth, speed, path) {
        super(game, spawnX, spawnY, texture);

        this.path = path;
        this.pathIndex = 0;

        this.anchor = new Phaser.Point(0.5, 0.5);

        if(spawnX == undefined || spawnY == undefined) {
            var firstPoint = this.nextDestination();
            spawnX = firstPoint.x;
            spawnY = firstPoint.y;
        }

        this.x = spawnX;
        this.y = spawnY;
        this.maxHealth = maxHealth;
        this.initialHealth = initialHealth;
        this.speed = speed;
        
        this.health = this.initialHealth;

        this.destination = this.nextDestination();

        this.game.physics.arcade.enable(this);
        this.enableBody = true;
        this.body.immovable = true;


    }

    nextDestination() {
        return new Phaser.Point(this.path[this.pathIndex].x + this.anchor.x * this.width, this.path[this.pathIndex].y + this.anchor.y * this.height);
    }

    takeDamage(damage) {
        this.health -= damage;

        if(this.health <= 0) {
            this.kill();
        }

        return this.health <= 0 ? (damage + this.health) : damage;
    }

    update() {
        var directionVector = (new Phaser.Point(this.destination.x - this.x, this.destination.y - this.y)).normalize();
        this.x += directionVector.x * this.speed * this.game.time.physicsElapsed;
        this.y += directionVector.y * this.speed * this.game.time.physicsElapsed;

        this.rotation = Math.atan2(directionVector.y, directionVector.x);

        if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), this.destination) < this.speed * this.game.time.physicsElapsed) {
            this.pathIndex++;
            if(this.pathIndex < this.path.length) {
                this.destination = this.nextDestination();
            }
        }
    }

}

class Ant extends Enemy {

    constructor(game, spawnX, spawnY, path) {
        super(game, spawnX, spawnY, 'ant', 2, 2, 60, path);
    }

}