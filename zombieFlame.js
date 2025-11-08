import Enemy from "./enemy.js";
import { rarityTable } from "./main.js";
// Zombies can see through walls but can't pass through them
export default class ZombieFlame extends Enemy {

    constructor(x, y, rarityKey = null) {
        const rarity = rarityTable.find(r => r.key === rarityKey) || rarityTable[0];

        const name = "ZombieFlame";
        const baseRadius = 24;
        const baseHp = 14;
        const baseDamage = 2;
        const baseXp = 4;
        const baseAggro = 340;
        const baseWeight = 2.1;

        super(name, x, y, baseRadius, baseHp, 2.5, baseDamage, baseXp, baseAggro, baseWeight, rarityKey);

        this.rarity = rarity;
        this.rarityColor = rarity.color;
        this.shape = "square";
        this.zIndex = 5;
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    draw(ctx, camera) {
        if (!this.isAlive && !this.damageable.isFading) return;

        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#a83005ff";
        ctx.fillRect(this.x - camera.x - this.radius / 2, this.y - camera.y - this.radius / 2, this.radius, this.radius);

        // HP bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - camera.x - this.radius * 0.6, this.y - camera.y + this.radius * 0.7, this.radius * 0.8, this.radius / 5);

        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.x - camera.x - this.radius * 0.6, this.y - camera.y + this.radius * 0.7, (this.damageable.hp / this.damageable.maxHp) * (this.radius * 0.8), this.radius / 5);

        // Rarity text to right of bar (color-coded)
        ctx.font = `${Math.round(this.radius / 5 + 3)}px Arial`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = this.rarityColor;
        ctx.fillText(this.rarity.key, this.x - camera.x - this.radius * 0.6 + this.radius * 0.8 + 6, this.y - camera.y + this.radius * 0.7 + this.radius / 5 / 2);
        ctx.restore();
    }
}
