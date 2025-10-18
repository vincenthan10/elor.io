import Entity from "./entity.js";
import Damageable from "./damageable.js";
import { rarityTable } from "./main.js";
export default class Enemy extends Entity {
    constructor(x, y, radius, hp, speed, damage, xp, aggro, rarityKey = null) {
        const rarity = rarityTable.find(r => r.key === rarityKey) || rarityTable[0];
        const finalRadius = Math.round(radius * rarity.sizeMult);
        super(x, y, finalRadius);
        this.rarity = rarity;
        this.rarityColor = rarity.color;
        this.damageable = new Damageable(Math.max(1, Math.round(hp * rarity.hpMult)), this);
        this.speed = speed;
        this.damage = Math.max(1, Math.round(damage * rarity.dmgMult));
        this.xp = Math.max(1, Math.round(xp * rarity.xpMult));
        this.aggro = Math.max(150, Math.round(aggro * rarity.aggro));
    }
    update(deltaTime) {
        this.damageable.update(deltaTime);
    }
    follow(target, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        this.x += (dx / dist) * this.speed * deltaTime / 100;
        this.y += (dy / dist) * this.speed * deltaTime / 100;
    }
    draw(ctx, camera) {

    }
}
