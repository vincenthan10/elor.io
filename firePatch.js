import Enemy from "./enemy.js";
import { rarityTable } from "./main.js";
export default class FirePatch extends Enemy {

    constructor(x, y, rarityKey = null) {

        const rarity = rarityTable.find(r => r.key === rarityKey) || rarityTable[0];

        const baseRadius = 20;
        const baseHp = 12;
        const baseDamage = 4;
        const baseXp = 3;

        super(x, y, baseRadius, baseHp, 0, baseDamage, baseXp, rarityKey);

        this.rarity = rarity;
        this.rarityColor = rarity.color;
        this.shape = "circle";
    }

    update(deltaTime) {
        super.update(deltaTime);
    }

    draw(ctx, camera) {
        if (!this.isAlive && !this.damageable.isFading) return;

        ctx.save();
        ctx.globalAlpha = this.damageable.fadeTime;

        // Flickering fire
        const flickerSize = this.radius + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, flickerSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Math.random() * 30}, 100%, 50%)`; //yellow/orange
        ctx.fill();


        // HP bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - camera.x - this.radius, this.y - camera.y + this.radius * 1.25, this.radius * 1.4, this.radius / 5);

        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.x - camera.x - this.radius, this.y - camera.y + this.radius * 1.25, (this.damageable.hp / this.damageable.maxHp) * (this.radius * 1.4), this.radius / 5);

        // Rarity text to right of bar (color-coded)
        ctx.font = `${Math.round(this.radius / 5 + 3)}px Arial`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = this.rarityColor;
        ctx.fillText(this.rarity.key, this.x - camera.x - this.radius + this.radius * 1.4 + 6, this.y - camera.y + this.radius * 1.25 + this.radius / 5 / 2);
        ctx.restore();


    }
}
