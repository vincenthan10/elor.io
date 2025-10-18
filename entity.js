export default class Entity {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.isAlive = true;
    }

    update(deltaTime) {

    }

    draw(ctx, camera) {

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
}
