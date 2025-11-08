let enemyIdCounter = 0;
import Entity from "./entity.js";
import Damageable from "./damageable.js";
import { rarityTable } from "./main.js";
export default class Enemy extends Entity {
    constructor(name, x, y, radius, hp, speed, damage, xp, aggro, weight, rarityKey = null) {
        const rarity = rarityTable.find(r => r.key === rarityKey) || rarityTable[0];
        const finalRadius = Math.round(radius * rarity.sizeMult);
        super(x, y, finalRadius);
        this.id = ++enemyIdCounter;
        this.zIndex = 0; // for layering
        this.name = name;
        this.rarity = rarity;
        this.rarityColor = rarity.color;
        this.damageable = new Damageable(Math.max(1, Math.round(hp * rarity.hpMult)), this);
        this.speed = speed;
        this.damage = Math.max(1, Math.round(damage * rarity.dmgMult));
        this.xp = Math.max(1, Math.round(xp * rarity.xpMult));
        this.aggro = Math.max(150, Math.round(aggro * rarity.aggro));
        this.weight = weight * rarity.sizeMult;
    }
    update(deltaTime) {
        this.damageable.update(deltaTime);
    }
    follow(target, deltaTime, walls) {
        // Need to change when adding more enemies - only follow when wall isn't in the way, for now it's fine because Zombies see through walls (I'm lazy)
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        let newX = this.x + (dx / dist) * this.speed * deltaTime / 100;
        let newY = this.y + (dy / dist) * this.speed * deltaTime / 100;
        if (!this.isCollidingWithWall(newX, this.y, walls)) this.x = newX;
        if (!this.isCollidingWithWall(this.x, newY, walls)) this.y = newY;

    }
    draw(ctx, camera) {

    }
}
