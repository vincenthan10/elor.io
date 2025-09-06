class Sword {
    constructor(equipped = true, damage = 3, duration = 250, cooldown = 500, length = 30, width = 12) {
        this.equipped = equipped;
        this.damage = damage;
        this.duration = duration;
        this.cooldown = cooldown;
        this.length = length;
        this.width = width;
        this.timeSinceLastSwing = 0;
        this.isSwinging = false;
        this.swingTimer = 0;
        this.swingAngleOffset = 0;
    }

    swing(deltaTime, player) {
        // sword animation
        if (this.isSwinging) {
            this.swingTimer += deltaTime;
            const progress = this.swingTimer / this.duration;

            // animate an arc from -45 degrees to +45 degrees relative to player aim
            const maxOffset = Math.PI / 4;
            this.swingAngleOffset = -maxOffset + (progress * 2 * maxOffset);

            if (progress >= 1) {
                this.isSwinging = false;
                this.swingAngleOffset = 0;
            }
        }
        // TODO: ADD COLLISION CHECK WITH ALL ENEMIES 
    }

    draw(ctx, camera, player) {
        const angle = player.aimAngle;
        const swordAngle = angle + this.swingAngleOffset;

        // offset base of sowrd to the right of the player's body
        const handOffsetAngle = swordAngle + Math.PI / 2.1;
        const handOffsetDistance = player.radius * 1.1;

        // tip of sword
        const tipX = player.x + Math.cos(swordAngle) * (player.radius + length);
        const tipY = player.y + Math.sin(swordAngle) * (player.radius + length);

        // base of the sword
        const baseX = player.x + Math.cos(handOffsetAngle) * handOffsetDistance;
        const baseY = player.y + Math.sin(handOffsetAngle) * handOffsetDistance;

        // perpendicular offsets for triangle width
        const offsetX = Math.cos(swordAngle + Math.PI / 2) * (width / 2);
        const offsetY = Math.sin(swordAngle + Math.PI / 2) * (width / 2);

        // base corners
        const base1X = baseX + offsetX;
        const base1Y = baseY + offsetY;

        const base2X = baseX - offsetX;
        const base2Y = baseY - offsetY;

        // draw triangle
        ctx.fillStyle = "silver";
        ctx.beginPath();
        ctx.moveTo(tipX - camera.x, tipY - camera.y);
        ctx.lineTo(base1X - camera.x, base1Y - camera.y);
        ctx.lineTo(base2X - camera.x, base2Y - camera.y);
        ctx.closePath();
        ctx.fill();
    }
}