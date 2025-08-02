class FireShard {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 16;
        this.height = 20;
        this.isCollected = false;
        // Store consistent irregular corners
        this.cornerOffsets = [
            { x: Math.random() * 4, y: Math.random() * 4 },
            { x: Math.random() * 4, y: Math.random() * 4 },
            { x: Math.random() * 4, y: Math.random() * 4 },
            { x: Math.random() * 4, y: Math.random() * 4 }
        ];
    }

    draw(ctx, camera, time) {
        if (this.isCollected) return;

        ctx.save();
        ctx.globalAlpha = 1; // fully visible


        // pulsating using sine wave
        const pulse = 1 + Math.sin(time / 200) * 0.1;
        const w = this.width;
        const h = this.height;

        // glow color shifts from red to orange to red
        const colorShift = (Math.sin(time / 400) + 1) / 2; // 0 to 1
        const r = 255;
        const g = Math.floor(100 + colorShift * 155); // shift green from 100 to 255
        const b = 0;
        const glowColor = `rgb(${r}, ${g}, ${b})`;
        ctx.shadowBlur = 20; // how strong the glow is
        ctx.shadowColor = glowColor;
        ctx.translate(this.x - camera.x, this.y - camera.y);
        ctx.scale(pulse, pulse);

        ctx.beginPath();
        ctx.moveTo(-w / 2 + this.cornerOffsets[0].x, -h / 2 + this.cornerOffsets[0].y);
        ctx.lineTo(w / 2 + this.cornerOffsets[1].x, -h / 2 + this.cornerOffsets[1].y);
        ctx.lineTo(w / 2 + this.cornerOffsets[2].x, h / 2 + this.cornerOffsets[2].y);
        ctx.lineTo(-w / 2 + this.cornerOffsets[3].x, h / 2 + this.cornerOffsets[3].y);
        ctx.closePath();
        ctx.fillStyle = "#f53f02ff";
        ctx.fill();

        ctx.restore();
    }
}