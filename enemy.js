class Enemy extends Entity {
    constructor(x, y, radius, hp, speed, damage, xp, rarityKey = null) {
        const rarity = rarityKey ? rarityTable.find(r => r.key === rarityKey) : pickRarityByWeight();
        const radius = Math.round(radius * rarity.sizeMult);
        super(x, y, radius);
        this.rarity = rarity;
        this.rarityColor = rarity.color;
        this.damageable = new Damageable(Math.max(1, Math.round(hp * rarity.hpMult)));
        this.speed = speed;
        this.damage = Math.max(1, Math.round(damage * rarity.dmgMult));
        this.xp = Math.max(1, Math.round(xp * rarity.xpMult));
    }
    update(deltaTime) {
        this.damageable.update(deltaTime);
    }
    follow(target, deltaTime) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) return;

        this.x += (dx / dist) * this.speed * deltaTime / 1000;
        this.y += (dy / dist) * this.speed * deltaTime / 1000;
    }
    draw(ctx, camera) {

    }
}