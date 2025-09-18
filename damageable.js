export default class Damageable {
    constructor(maxHp) {
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.isFading = false;
        this.fadeTime = 1;

        this.weaponHitCooldown = 0;
        this.bodyHitCooldown = 0;
    }

    takeDamage(amount, sword, body) {
        if (this.isFading) return;
        if (sword) {
            if (this.hitCooldown > 0) return;
            this.hitCooldown = 300;
        }
        if (body) {
            if (this.bodyHitCooldown > 0) return;
            this.bodyHitCooldown = 500;
        }
        this.hp -= amount;
        if (this.hp <= 0) this.startFade();
    }

    startFade() {
        this.hp = 0;
        this.isFading = true;
        this.isAlive = false;
    }

    update(deltaTime) {
        if (this.isFading) {
            this.fadeTime -= deltaTime / 300;
            if (this.fadeTime <= 0) this.isFading = false;
        }
        if (this.bodyHitCooldown > 0) {
            this.bodyHitCooldown -= deltaTime;
        }
        if (this.weaponHitCooldown > 0) {
            this.weaponHitCooldown -= deltaTime;
        }
    }
}
