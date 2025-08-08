class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 20;
        this.speed = 4;
        this.aimAngle = 0;
        this.fireShards = 0;
        this.maxHp = 10;
        this.hp = this.maxHp;
        this.hpPerc = this.hp / this.maxHp;
        this.lastDamageTime = 0;
        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 10;
        this.bodyDamage = 1;
        this.regenUnlocked = false;
        this.regenRate = 0.000416; // 0.5 hp per second
        this.XP_GROWTH_RATE = 1.25;
        this.HP_GROWTH_RATE = 1.2;
        this.BODY_DAMAGE_GROWTH_RATE = 1.15;

        // Sword animation and stats
        this.isSwinging = false;
        this.swingTimer = 0;
        this.swingDuration = 250;
        this.swingAngleOffset = 0;
        this.swingCooldown = 500;
        this.lastSwingTime = 0;
        this.damage = 5;

        // Shield animation
        this.isBlocking = false;
        this.blockTimer = 0;
        this.blockDuration = 750;
        this.blockCooldown = 1500;
        this.lastBlockTime = 0;

        // Mouse movement
        this.dx = 0;
        this.dy = 0;
        this.mouseMovement = false;
    }

    addXP(amount) {
        this.xp += amount;
        this.checkLevelUp();
    }

    checkLevelUp() {
        if (this.xp >= this.xpNeeded) {
            this.xp -= this.xpNeeded;
            this.level++;
            this.xpNeeded *= this.XP_GROWTH_RATE;
            this.maxHp *= this.HP_GROWTH_RATE;
            this.bodyDamage *= this.BODY_DAMAGE_GROWTH_RATE;
            this.hp = this.maxHp * this.hpPerc;
            console.log(`Player level: ${this.level}`);
            console.log(`XP needed: ${this.xpNeeded}`);
            console.log(`Player HP: ${this.maxHp}`);
            console.log(`Player Body Damage: ${this.bodyDamage}`);
        }


        if (this.level === 2) {
            this.regenUnlocked = true;
        }
    }

    passiveRegen(deltaTime) {
        if (this.regenUnlocked && this.hp < this.maxHp) {
            this.hp = Math.min(this.hp + this.regenRate * deltaTime, this.maxHp);
        }
    }

    update(deltaTime, keysPressed, camera, mapWidth, mapHeight, isCollidingWithWall) {
        // Movement and boundaries
        //keyboard movement
        let dx = 0;
        let dy = 0;
        if (!this.mouseMovement) {
            if (keysPressed.has("w") || keysPressed.has("arrowup")) dy -= this.speed;
            if (keysPressed.has("s") || keysPressed.has("arrowdown")) dy += this.speed;
            if (keysPressed.has("a") || keysPressed.has("arrowleft")) dx -= this.speed;
            if (keysPressed.has("d") || keysPressed.has("arrowright")) dx += this.speed;
            if (dx !== 0 && dy !== 0) {
                dx /= Math.sqrt(2);
                dy /= Math.sqrt(2);
            }
        }
        // disallow player to move past boundaries
        if (this.x - this.radius <= 0 && (this.dx < 0 || dx < 0)) {
            dx = 0;
            this.dx = 0;
        }
        if (this.x + this.radius >= mapWidth && (this.dx > 0 || dx > 0)) {
            dx = 0;
            this.dx = 0;
        }
        if (this.y - this.radius <= 0 && (this.dy < 0 || dy < 0)) {
            dy = 0;
            this.dy = 0;
        }
        if (this.y + this.radius >= mapHeight && (this.dy > 0 || dy > 0)) {
            dy = 0;
            this.dy = 0;
        }

        if (!this.mouseMovement) {
            let newX = this.x + dx;
            let newY = this.y + dy;
            if (!isCollidingWithWall(newX, this.y)) this.x = newX;
            if (!isCollidingWithWall(this.x, newY)) this.y = newY;
        } else {
            // mouse movement
            let newX = this.x + this.dx;
            let newY = this.y + this.dy;
            if (!isCollidingWithWall(newX, this.y)) this.x = newX;
            if (!isCollidingWithWall(this.x, newY)) this.y = newY;
        }



        camera.x = this.x - canvas.width / 2;
        camera.y = this.y - canvas.height / 2;

        // clamp camera so it doesn't scroll past the map
        camera.x = Math.max(0, Math.min(camera.x, mapWidth - canvas.width));
        camera.y = Math.max(0, Math.min(camera.y, mapHeight - canvas.height));

        // sword animation
        if (this.isSwinging) {
            this.swingTimer += deltaTime;
            const progress = this.swingTimer / this.swingDuration;

            // animate an arc from -45 degrees to +45 degrees relative to player aim
            const maxOffset = Math.PI / 4;
            this.swingAngleOffset = -maxOffset + (progress * 2 * maxOffset);

            if (progress >= 1) {
                this.isSwinging = false;
                this.swingAngleOffset = 0;
            }
        }

        // shield animation
        if (this.isBlocking) {
            this.blockTimer += deltaTime;
            if (this.blockTimer >= this.blockDuration) {
                this.isBlocking = false;
            }
        }

        this.checkLevelUp();
        this.passiveRegen(deltaTime);
        this.hpPerc = this.hp / this.maxHp;

    }

    draw(ctx, camera) {
        ctx.beginPath();
        // draws player (always centered on camera)
        ctx.arc(this.x - camera.x, this.y - camera.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.closePath();

        // SWORD
        const swordLength = 30;
        const swordWidth = 12;
        const angle = this.aimAngle;
        const swordAngle = this.aimAngle + this.swingAngleOffset;

        // offset base of sowrd to the right of the player's body
        const handOffsetAngle = swordAngle + Math.PI / 2.1;
        const handOffsetDistance = this.radius * 1.1;

        // tip of sword
        const tipX = this.x + Math.cos(swordAngle) * (this.radius + swordLength);
        const tipY = this.y + Math.sin(swordAngle) * (this.radius + swordLength);

        // base of the sword
        const baseX = this.x + Math.cos(handOffsetAngle) * handOffsetDistance;
        const baseY = this.y + Math.sin(handOffsetAngle) * handOffsetDistance;

        // perpendicular offsets for triangle width
        const offsetX = Math.cos(swordAngle + Math.PI / 2) * (swordWidth / 2);
        const offsetY = Math.sin(swordAngle + Math.PI / 2) * (swordWidth / 2);

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


        // SHIELD (custom pentagon: triangle on top of square)
        const shieldWidth = 22;
        const shieldHeight = 25;
        const shieldTipHeight = 10;
        const halfW = shieldWidth / 2;

        const shieldLocalPoints = [
            { x: shieldHeight + shieldTipHeight, y: 0 },   // tip (right side)
            { x: shieldHeight, y: -halfW },                // top right
            { x: 0, y: -halfW },                            // top left
            { x: 0, y: halfW },                             // bottom left
            { x: shieldHeight, y: halfW }                  // bottom right
        ];

        const isBlocking = this.isBlocking;
        // if isBlocking, calculate the progress, otherwise, progress is 0
        const blockProgress = isBlocking ? Math.min(this.blockTimer / this.blockDuration, 1) : 0;
        const blockScale = 1 + 0.3 * Math.sin(blockProgress * Math.PI); // scale to grow and shrink when blocking

        const offsetAngle = angle - Math.PI / 2.1;
        const offsetDistance = this.radius * 1.1;

        const shieldCenterX = this.x + Math.cos(offsetAngle) * offsetDistance;
        const shieldCenterY = this.y + Math.sin(offsetAngle) * offsetDistance;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        ctx.fillStyle = isBlocking ? "#88ffff" : "#88aaff";
        ctx.save();
        ctx.translate(shieldCenterX - camera.x, shieldCenterY - camera.y);
        ctx.rotate(this.aimAngle);
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
