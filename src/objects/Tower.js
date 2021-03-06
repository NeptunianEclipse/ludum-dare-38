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
        super(game, state, gridX, gridY, tileWorldSize, BasicTower.const.key, BasicTower.const.powerUsage, BasicTower.const.range, BasicTower.const.projectileClass, BasicTower.const.projectileSpeed, BasicTower.const.shootDelay);
    }

}
BasicTower.const = {
    name: 'Zapper',
    key: 'tower_basic',
    description: 'Shoots small electric charges.',
    powerUsage: 1,
    range: 100,
    projectileClass: ChargeProjectile,
    projectileSpeed: 400,
    shootDelay: 1000
}

class PiercingTower extends TargetingTower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, PiercingTower.const.key, PiercingTower.const.powerUsage, PiercingTower.const.range, PiercingTower.const.projectileClass, PiercingTower.const.projectileSpeed, PiercingTower.const.shootDelay);
    }

}
PiercingTower.const = {
    name: 'Bolt Generator',
    key: 'tower_piercing',
    'description': 'Bolts pierce through many bugs.',
    powerUsage: 2,
    range: 180,
    projectileClass: PiercingProjectile,
    projectileSpeed: 1000,
    shootDelay: 2500
}

class FlameTower extends TargetingTower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, FlameTower.const.key, FlameTower.const.powerUsage, FlameTower.const.range, FlameTower.const.projectileClass, FlameTower.const.projectileSpeed, FlameTower.const.shootDelay);
    }

    shoot(x, y) {
        var velocity = new Phaser.Point(x - this.x, y - this.y).setMagnitude(this.projectileSpeed);
        this.state.createProjectile(this.projectileClass, this.x, this.y, velocity.x, velocity.y, FlameTower.const.range);
    }

}
FlameTower.const = {
    name: 'Flamethrower',
    key: 'tower_flame',
    'description': 'Constantly burns close bugs.',
    powerUsage: 8,
    range: 80,
    projectileClass: FlameProjectile,
    projectileSpeed: 200,
    shootDelay: 50
}



// Special towers are built with stored energy
class SpecialTower extends Tower {

    constructor(game, state, gridX, gridY, tileWorldSize, texture, powerUsage, energyCost) {
        super(game, state, gridX, gridY, tileWorldSize, texture, powerUsage);

        this.energyCost = energyCost;
    }

}

// Generator towers are built with energy and produce power
class GeneratorTower extends SpecialTower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, GeneratorTower.const.key, GeneratorTower.const.powerUsage, GeneratorTower.const.energyCost);
    }

}
GeneratorTower.const = {
    name: 'Generator',
    key: 'tower_generator',
    'description': 'Generates power for the circuit it is attached to.',
    powerUsage: -3,
    energyCost: 260
}

// Capacitor towers are built with energy and consume power, creating stored energy
class CapacitorTower extends SpecialTower {

    constructor(game, state, gridX, gridY, tileWorldSize) {
        super(game, state, gridX, gridY, tileWorldSize, CapacitorTower.const.key, CapacitorTower.const.powerUsage, CapacitorTower.energyCost);
    }

    update() {
        this.state.useEnergy(-CapacitorTower.const.energyRate * this.game.time.physicsElapsed)
    }

}
CapacitorTower.const = {
    name: 'Capacitor',
    key: 'tower_capacitor',
    'description': 'Generates stored energy for building special towers.',
    powerUsage: 2,
    energyCost: 100,
    energyRate: 5
}
