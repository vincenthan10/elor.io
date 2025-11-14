export default class Entity {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.isAlive = true;

        this.knockback = { x: 0, y: 0 };
        this.knockbackDecay = 0.85;
        this.maxKnockback = 4.0;
    }

    update(deltaTime, walls) {
        this.applyKnockback(deltaTime, walls);
    }

    draw(ctx, camera) {

    }
    applyKnockback(deltaTime, walls) {
        if (this.knockback.x !== 0 || this.knockback.y !== 0) {
            const kbScale = deltaTime / 16.6667;
            const kbMoveX = this.knockback.x * kbScale;
            const kbMoveY = this.knockback.y * kbScale;

            const newX = this.x + kbMoveX;
            const newY = this.y + kbMoveY;

            if (!this.isCollidingWithWall(newX, this.y, walls)) this.x = newX;
            if (!this.isCollidingWithWall(this.x, newY, walls)) this.y = newY;

            const decay = Math.pow(this.knockbackDecay, deltaTime / 16.6667);
            this.knockback.x *= decay;
            this.knockback.y *= decay;

            if (Math.abs(this.knockback.x) < 0.01) this.knockback.x = 0;
            if (Math.abs(this.knockback.y) < 0.01) this.knockback.y = 0;

        }
    }

    addKnockback(nx, ny, strength) {
        this.knockback.x += nx * strength;
        this.knockback.y += ny * strength;

        const mag = Math.hypot(this.knockback.x, this.knockback.y);
        if (mag > this.maxKnockback) {
            this.knockback.x = (this.knockback.x / mag) * this.maxKnockback;
            this.knockback.y = (this.knockback.y / mag) * this.maxKnockback;
        }
    }

    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
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
    isCollidingWithWallSq(x, y, walls) {
        const half = this.radius / 2;
        const left = x - half;
        const right = x + half;
        const top = y - half;
        const bottom = y + half;

        for (const wall of walls) {
            const wLeft = wall.x;
            const wRight = wall.x + wall.width;
            const wTop = wall.y;
            const wBottom = wall.y + wall.height;

            const overlap =
                right > wLeft &&
                left < wRight &&
                bottom > wTop &&
                top < wBottom;

            if (overlap) return true;
        }

        return false;
    }
}
