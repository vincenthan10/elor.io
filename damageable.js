class Damageable {
    constructor(maxHp) {
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.isFading = false;
        this.fadeTime = 1;
    }

    takeDamage(amount) {
        if (this.isFading) return;
        this.hp -= amount;
        if (this.hp <= 0) this.startFade();
    }

    startFade() {
        this.hp = 0;
        this.isFading = true;
        this.isAlive = false;
    }

    updateFade(deltaTime) {
        if (this.isFading) {
            this.fadeTime -= deltaTime / 300;
            if (this.fadeTime <= 0) this.isFading = false;
        }
    }
}