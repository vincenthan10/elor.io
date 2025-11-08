export default class Damageable {
    constructor(maxHp, owner) {
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.isFading = false;
        this.fadeTime = 1;
        this.owner = owner;

        this.weaponHitCooldown = new Map();
        this.bodyHitCooldown = new Map();
    }

    takeDamage(amount, sword, body, attacker = null) {
        if (this.isFading) return;

        const id = attacker ? attacker.id || attacker : "global";
        //console.log(id);
        if (sword) {
            const lastHit = this.weaponHitCooldown.get(id) || 0;
            const now = performance.now();
            if (now - lastHit < 300) return;
            this.weaponHitCooldown.set(id, now);
        }
        if (body) {
            const lastHit = this.bodyHitCooldown.get(id) || 0;
            const now = performance.now();
            if (now - lastHit < 500) return;
            this.bodyHitCooldown.set(id, now);
        }
        this.hp -= amount;
        if (this.hp <= 0) {
            this.startFade();
        }
    }

    startFade() {
        this.hp = 0;
        this.isFading = true;

    }

    update(deltaTime) {
        if (this.isFading) {
            this.fadeTime -= deltaTime / 300;
            if (this.fadeTime <= 0) {
                this.isFading = false;
                if (this.owner) {
                    this.owner.isAlive = false;
                }
            }
        }
        if (this.bodyHitCooldown > 0) {
            this.bodyHitCooldown -= deltaTime;
        }
        if (this.weaponHitCooldown > 0) {
            this.weaponHitCooldown -= deltaTime;
        }
        const now = performance.now();
        for (const [id, t] of this.bodyHitCooldown) {
            if (now - t > 1000) this.bodyHitCooldown.delete(id);
        }
        for (const [id, t] of this.weaponHitCooldown) {
            if (now - t > 1000) this.weaponHitCooldown.delete(id);
        }

    }
}
