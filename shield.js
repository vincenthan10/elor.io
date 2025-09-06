class Shield {
    constructor(equipped = true, blockDuration = 750, blockCooldown = 1500, width = 22, height = 25, tipHeight = 10) {
        this.equipped = equipped;
        this.blockDuration = blockDuration;
        this.blockCooldown = blockCooldown;
        this.width = width;
        this.height = height;
        this.tipHeight = tipHeight;
        this.blockTimer = 0;
        this.lastBlockTime = 0;
        this.isBlocking = false;
    }

    block(deltaTime) {
        // shield animation
        if (this.isBlocking) {
            this.blockTimer += deltaTime;
            if (this.blockTimer >= this.blockDuration) {
                this.isBlocking = false;
            }
        }
    }

    draw(ctx, camera, player) {
        const halfW = this.width / 2;
        const angle = player.aimAngle;

        const shieldLocalPoints = [
            { x: height + tipHeight, y: 0 },   // tip (right side)
            { x: height, y: -halfW },                // top right
            { x: 0, y: -halfW },                            // top left
            { x: 0, y: halfW },                             // bottom left
            { x: height, y: halfW }                  // bottom right
        ];

        const isBlocking = this.isBlocking;
        // if isBlocking, calculate the progress, otherwise, progress is 0
        const blockProgress = isBlocking ? Math.min(this.blockTimer / this.blockDuration, 1) : 0;
        const blockScale = 1 + 0.3 * Math.sin(blockProgress * Math.PI); // scale to grow and shrink when blocking

        const offsetAngle = angle - Math.PI / 2.1;
        const offsetDistance = player.radius * 1.1;

        const shieldCenterX = player.x + Math.cos(offsetAngle) * offsetDistance;
        const shieldCenterY = player.y + Math.sin(offsetAngle) * offsetDistance;

        ctx.fillStyle = isBlocking ? "#88ffff" : "#88aaff";
        ctx.save();
        ctx.translate(shieldCenterX - camera.x, shieldCenterY - camera.y);
        ctx.rotate(player.aimAngle);
        ctx.scale(blockScale, blockScale); //scale relative to center
        ctx.beginPath();

        for (let i = 0; i < shieldLocalPoints.length; i++) {
            const local = shieldLocalPoints[i];

            if (i === 0) {
                ctx.moveTo(local.x, local.y);
            } else {
                ctx.lineTo(local.x, local.y);
            }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
}