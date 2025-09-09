class Collectible {
    constructor(x, y, amount = 1, interactable = true) {
        this.x = x;
        this.y = y;
        this.interactable = interactable;
        this.amount = amount;
        this.isCollected = false;
        this.isAlive = true;
        this.lifetime = 0;
        this.despawnTime = 10000;
    }

    collect(player) {
        if (this.isAlive) {
            player.inventory.fireShards = (player.inventory.fireShards || 0) + this.amount;
            this.isCollected = true;
            this.isAlive = false;
        }

    }

    update(deltaTime) {
        this.lifetime += deltaTime;
        if (this.lifetime >= this.despawnTime) {
            this.isAlive = false;
        }
    }

    draw(ctx, camera, time) {

    }

    drawIcon(ctx, x, y, scale = 1) {

    }
}