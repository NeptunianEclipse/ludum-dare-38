class Enemy extends Phaser.Sprite {

    constructor(game, state, spawnX, spawnY, texture, maxHealth, initialHealth, speed, path, pathIndex) {
        super(game, spawnX, spawnY, texture);

        this.state = state;
        this.path = path;

        if(pathIndex == undefined) {
            pathIndex = 0;
        }
        this.pathIndex = pathIndex;

        if(pathIndex == undefined) {
            pathIndex = 0;
        }
        this.pathIndex = pathIndex;
        
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
        var destination = new Phaser.Point(this.path[this.pathIndex].x + (this.anchor.x + this.getRandomDeviation()) * this.state.map.tileWorldSize, this.path[this.pathIndex].y + (this.anchor.y + this.getRandomDeviation()) * this.state.map.tileWorldSize);
        this.pathIndex++;
        return destination;
    }

    getRandomDeviation() {
        return Math.random() * 2 - 1;
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

        var targetRotation = Math.atan2(directionVector.y, directionVector.x);

        if(Math.abs(this.rotation - targetRotation) > 0.01) {
            var angleDiff = targetRotation - this.rotation;

            if(angleDiff > Math.PI) {
                angleDiff -= 2 * Math.PI;
            } else if(angleDiff < -Math.PI) {
                angleDiff += 2 * Math.PI;
            }

            this.rotation += angleDiff * this.speed * this.game.time.physicsElapsed * 0.1;
        }

        if(Phaser.Point.distance(new Phaser.Point(this.x, this.y), this.destination) < this.speed * this.game.time.physicsElapsed) {
            if(this.pathIndex < this.path.length) {
                this.destination = this.nextDestination();
            } else {
                this.reachedEnd();       
            }
        }
    }

    reachedEnd() {
        this.state.reduceHealth(this.health);

        this.kill();
    }

}

// basic enemy
class Ant extends Enemy {

    constructor(game, state, spawnX, spawnY, path, pathIndex) {
        super(game, state, spawnX, spawnY, 'enemy_ant', 2, 2, 120, path, pathIndex);
    }

}

// bigger and slow
class Beetle extends Enemy {

    constructor(game, state, spawnX, spawnY, path, pathIndex) {
        super(game, state, spawnX, spawnY, 'enemy_beetle', 6, 6, 60, path, pathIndex);
    }
}

// snail carries enemies, very tanky, very slow
class Snail extends Enemy {

    constructor(game, state, spawnX, spawnY, path) {
        super(game, state, spawnX, spawnY, 'enemy_snail', 20, 20, 40, path);
    }

    takeDamage(damage) {
        this.health -= damage;

        if(this.health <= 0) {
            // Spawn ants
            for(var i = 0; i < 20; i++) {
                this.state.spawnEnemy(Ant, this.x + this.getRandomDeviation(), this.y + this.getRandomDeviation(), this.pathIndex - 1);
            }

            // Spawn beetles
            for(var i = 0; i < 12; i++) {
                this.state.spawnEnemy(Beetle, this.x + this.getRandomDeviation(), this.y + this.getRandomDeviation(), this.pathIndex - 1);
            }
            this.kill();
        }

        return this.health <= 0 ? (damage + this.health) : damage;
    }
}
