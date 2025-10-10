import Entity from "./entity.js";
import Damageable from "./damageable.js";
import Sword from "./sword.js";
import Shield from "./shield.js";

export default class Player extends Entity {
    constructor(x, y) {
        super(x, y, 20);
        this.damageable = new Damageable(10, this);
        this.speed = 2.5;
        this.aimAngle = 0;
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 10;
        this.bodyDamage = 1;
        this.strength = 2;
        this.regenUnlocked = false;
        this.regenRate = 0;
        this.XP_GROWTH_RATE = 1.15;
        this.HP_GROWTH_RATE = 1.03;
        this.BODY_DAMAGE_GROWTH_RATE = 1.02;
        this.STRENGTH_GROWTH_RATE = 1.025;
        this.skillPoints = 0;

        // Sword 
        this.sword = new Sword();
        this.shield = new Shield();

        this.damage = this.strength + this.sword.damage;

        // Mouse movement
        this.dx = 0;
        this.dy = 0;
        this.mouseMovement = false;

    }

    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        if (this.xp >= this.xpNeeded) {
            this.xp -= this.xpNeeded;
            this.level++;

            const pointsGained = Math.max(Math.floor(this.level / 20), 1);
            this.skillPoints += pointsGained;

            // Calculate current HP percentage before increasing maxHp
            const currentHpPerc = this.damageable.hp / this.damageable.maxHp;
            this.xpNeeded *= this.XP_GROWTH_RATE;
            if (this.level <= 100) {
                this.damageable.maxHp += 1 * Math.pow(this.HP_GROWTH_RATE, this.level - 1);
                this.bodyDamage += 0.1 * Math.pow(this.BODY_DAMAGE_GROWTH_RATE, this.level - 1);
                this.strength += 0.1 * Math.pow(this.STRENGTH_GROWTH_RATE, this.level - 1);
                this.damageable.hp = this.damageable.maxHp * currentHpPerc;
            }

            // console.log(`Player level: ${this.level}`);
            // console.log(`XP needed: ${this.xpNeeded}`);
            // console.log(`Player HP: ${this.maxHp}`);
            // console.log(`Player Body Damage: ${this.bodyDamage}`);
        }


        if (this.level === 2) {
            this.regenUnlocked = true;
            this.regenRate = 0.0005;
        }
    }

    passiveRegen(deltaTime) {
        if (this.regenUnlocked && this.damageable.hp < this.damageable.maxHp) {
            this.damageable.hp = Math.min(this.damageable.hp + this.regenRate * deltaTime, this.damageable.maxHp);
        }
    }

    attack() {
        const now = performance.now();
        if (!this.sword.isSwinging && now - this.sword.timeSinceLastSwing >= this.sword.cooldown) {
            this.sword.isSwinging = true;
            this.sword.swingTimer = 0;
        }
    }

    defend() {
        const now = performance.now();
        if (!this.shield.isBlocking && now - this.shield.lastBlockTime >= this.shield.blockCooldown) {
            this.shield.isBlocking = true;
            this.shield.blockTimer = 0;
        }
    }

    update(deltaTime, keysPressed, camera, mapWidth, mapHeight, walls, canvas) {
        // Movement and boundaries
        //keyboard movement
        if (!this.damageable.isFading) {
            let dx = 0;
            let dy = 0;
            if (!this.mouseMovement) {
                if (keysPressed.has("w") || keysPressed.has("arrowup")) dy -= this.speed;
                if (keysPressed.has("s") || keysPressed.has("arrowdown")) dy += this.speed;
                if (keysPressed.has("a") || keysPressed.has("arrowleft")) dx -= this.speed;
                if (keysPressed.has("d") || keysPressed.has("arrowright")) dx += this.speed;
                if (dx !== 0 && dy !== 0) {
                    dx /= Math.sqrt(2);
                    dy /= Math.sqrt(2);
                }
            }
            // disallow player to move past boundaries
            if (this.x - this.radius <= 0 && (this.dx < 0 || dx < 0)) {
                dx = 0;
                this.dx = 0;
            }
            if (this.x + this.radius >= mapWidth && (this.dx > 0 || dx > 0)) {
                dx = 0;
                this.dx = 0;
            }
            if (this.y - this.radius <= 0 && (this.dy < 0 || dy < 0)) {
                dy = 0;
                this.dy = 0;
            }
            if (this.y + this.radius >= mapHeight && (this.dy > 0 || dy > 0)) {
                dy = 0;
                this.dy = 0;
            }

            if (!this.mouseMovement) {
                let newX = this.x + dx;
                let newY = this.y + dy;
                if (!this.isCollidingWithWall(newX, this.y, walls)) this.x = newX;
                if (!this.isCollidingWithWall(this.x, newY, walls)) this.y = newY;
            } else {
                // mouse movement
                let newX = this.x + this.dx;
                let newY = this.y + this.dy;
                if (!this.isCollidingWithWall(newX, this.y, walls)) this.x = newX;
                if (!this.isCollidingWithWall(this.x, newY, walls)) this.y = newY;
            }

            camera.x = this.x - canvas.width / 2;
            camera.y = this.y - canvas.height / 2;

            // clamp camera so it doesn't scroll past the map
            camera.x = Math.max(0, Math.min(camera.x, mapWidth - canvas.width));
            camera.y = Math.max(0, Math.min(camera.y, mapHeight - canvas.height));
        }


        this.damageable.update(deltaTime);
        this.sword.swing(deltaTime);
        this.shield.block(deltaTime);
        this.damage = this.strength + this.sword.damage;

        this.checkLevelUp();
        this.passiveRegen(deltaTime);

    }

    isCollidingWithWall(x, y, walls) {
        for (const wall of walls) {
            // Find closest point on rectangle to the circle
            const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.width));
            const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.height));

            // Find distance between circle center and that point
            const dx = x - closestX;
            const dy = y - closestY;

            if (dx * dx + dy * dy < this.radius * this.radius) {
                return true;
            }
        }
        return false;
    }


    draw(ctx, camera) {
        if (!this.isAlive && !this.damageable.isFading) return;
        ctx.save();
        ctx.globalAlpha = this.damageable.fadeTime;

        ctx.beginPath();
        // draws player (always centered on camera)
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();

        // HP bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - camera.x - this.radius, this.y - camera.y + this.radius * 1.25, this.radius * 2, this.radius / 5);

        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.x - camera.x - this.radius, this.y - camera.y + this.radius * 1.25, (this.damageable.hp / this.damageable.maxHp) * (this.radius * 2), this.radius / 5);

        this.sword.draw(ctx, camera, this);
        this.shield.draw(ctx, camera, this);

        ctx.restore();

    }
}
