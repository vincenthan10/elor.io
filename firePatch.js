class FirePatch {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.isAlive = true;
        this.isFading = false;
        this.fadeAlpha = 1; // for fade-out animation
        this.maxHp = 7;
        this.hp = this.maxHp;
        this.xp = 3;
        this.damage = 3;
        this.damageDelay = 500;

        this.hitCooldown = 0; // sword delay
        this.bodyHitCooldown = 0; // body collision delay
        this.lastDamageTime = 0; // for body collision delay
    }

    update(deltaTime) {
        if (this.isFading) {
            this.fadeAlpha -= deltaTime / 300; // fade speed
            if (this.fadeAlpha <= 0) {
                this.isAlive = false;
            }
        }

        if (this.hitCooldown > 0) {
            this.hitCooldown -= deltaTime;
        }
        if (this.bodyHitCooldown > 0) {
            this.bodyHitCooldown -= deltaTime;
        }
    }

    draw(ctx, camera) {
        if (!this.isAlive) return;

        ctx.save();
        ctx.globalAlpha = this.fadeAlpha;

        // Flickering fire
        const flickerSize = this.radius + Math.random() * 2;
        ctx.beginPath();
        ctx.arc(this.x - camera.x, this.y - camera.y, flickerSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${Math.random() * 30}, 100%, 50%)`; //yellow/orange
        ctx.fill();
        ctx.restore();


        // HP bar
        ctx.fillStyle = "red";
        ctx.fillRect(this.x - camera.x - this.radius, this.y - camera.y + this.radius * 1.25, this.radius * 2, this.radius / 5);

        ctx.fillStyle = "limegreen";
        ctx.fillRect(this.x - camera.x - this.radius, this.y - camera.y + this.radius * 1.25, (this.hp / this.maxHp) * (this.radius * 2), this.radius / 5);

    }

    hit(damage, sword, body) {
        if (this.isFading) return;
        if (sword) {
            if (this.hitCooldown > 0) return;
            this.hitCooldown = 250;
        }
        if (body) {
            if (this.bodyHitCooldown > 0) return;
            this.bodyHitCooldown = 500;
        }
        this.hp -= damage;

        if (this.hp <= 0) {
            this.hp = 0;
            this.isFading = true;
        }
    }
}
