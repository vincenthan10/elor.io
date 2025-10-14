import Enemy from "./enemy.js";
import { rarityTable } from "./main.js";
export default class ZombieFlame extends Enemy {

    constructor(x, y, rarityKey = null) {
        const rarity = rarityTable.find(r => r.key === rarityKey) || rarityTable[0];

        const baseRadius = 24;
        const baseHp = 14;
        const baseDamage = 2;
        const baseXp = 4;

        super(x, y, baseRadius, baseHp, 2.5, baseDamage, baseXp, rarityKey);

        this.rarity = rarity;
        this.rarityColor = rarity.color;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    draw(ctx, camera) {
        if (!this.isAlive && !this.damageable.isFading) return;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#a83005ff";
        ctx.fillRect(this.x - camera.x, this.y - camera.y, this.radius, this.radius);

        // HP bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - camera.x - this.radius * 0.1, this.y - camera.y + this.radius * 1.25, this.radius * 0.9, this.radius / 5);

        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.x - camera.x - this.radius * 0.1, this.y - camera.y + this.radius * 1.25, (this.damageable.hp / this.damageable.maxHp) * (this.radius * 0.9), this.radius / 5);

        // Rarity text to right of bar (color-coded)
        ctx.font = `${Math.round(this.radius / 5 + 3)}px Arial`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = this.rarityColor;
        ctx.fillText(this.rarity.key, this.x - camera.x - this.radius * 0.1 + this.radius * 0.9 + 6, this.y - camera.y + this.radius * 1.25 + this.radius / 5 / 2);
        ctx.restore();
    }
}