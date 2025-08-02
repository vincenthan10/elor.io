class FirePatch {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 25;
        this.isAlive = true;
        this.isFading = false;
        this.fadeAlpha = 1; // for fade-out animation
    }

    update(deltaTime) {
        if (this.isFading) {
            this.fadeAlpha -= deltaTime / 300; // fade speed
            if (this.fadeAlpha <= 0) {
                this.isAlive = false;
            }
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
    }

    hit() {
        if (this.isFading) return;
        this.isFading = true;
    }
}
