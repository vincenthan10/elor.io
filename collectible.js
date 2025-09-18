export default class Collectible {
    constructor(x, y, amount = 1, interactable = true, key = "generic") {
        this.x = x;
        this.y = y;
        this.interactable = interactable;
        this.amount = amount;
        this.isCollected = false;
        this.isAlive = true;
        this.lifetime = 0;
        this.despawnTime = 10000;
        this.key = key;
    }

    collect(player) {
        if (this.isAlive && this.interactable) {
            player.inventory[this.key] = (player.inventory[this.key] || 0) + this.amount;
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

    static drawIcon(ctx, x, y, scale = 1) {

    }
}
