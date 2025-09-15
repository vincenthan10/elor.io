class Upgrade extends Menu {
    constructor(player) {
        super([]);
        this.player = player;
        const stX = 130;
        const stY = canvas.height - 220;
        const stW = 280;
        const stH = 200;
        this.upgrades = {
            hp: 0,
            strength: 0,
            bodyDamage: 0,
            speed: 0,
            regen: 0
        }
        this.upgradeCosts = {
            hp: 1,
            strength: 2,
            bodyDamage: 2,
            speed: 1,
            regen: 2
        }
        this.costIncreases = {
            hp: 1,
            strength: 2,
            bodyDamage: 1,
            speed: 2,
            regen: 2
        }
        this.statGains = {
            hp: 4,
            strength: 0.8,
            bodyDamage: 0.5,
            speed: 0.2,
            regen: 0.4
        }
        this.upgradeMultipliers = {
            hp: 1.35,
            strength: 1.35,
            bodyDamage: 1.6,
            speed: 1.3,
            regen: 1.7
        }
        this.maxUpgrades = {
            hp: 6,
            strength: 6,
            bodyDamage: 6,
            speed: 5,
            regen: 7
        }
        this.statButtons = {};
    }

    open() {
        super.open();
    }

    close() {
        super.close();
    }

    // Calculate cost based on current level
    getUpgradeCost(stat) {
        return this.upgradeCosts[stat] + this.costIncreases[stat] * this.upgrades[stat];
    }

    draw(ctx) {

        // Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(stX, stY, stW, stH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(stX, stY, stW, stH);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Stats Menu", stX + 10, stY + 30);

        ctx.font = "14px Arial";
        // Skill points in top right
        ctx.fillText(`Skill Points: ${this.player.skillPoints}`, stX + stW - 92, stY + 25);

        const stats = [
            { name: "HP", value: this.player.maxHp.toFixed(1), key: "hp" },
            { name: "Strength", value: this.player.strength.toFixed(1), key: "strength" },
            { name: "Body Damage", value: this.player.bodyDamage.toFixed(1), key: "bodyDamage" },
            { name: "Speed", value: this.player.speed.toFixed(1), key: "speed" },
            { name: "Regen", value: (this.player.regenRate * 1000).toFixed(3) + "/s", key: "regen" }
        ];
        const startY = stY + 60;
        const lineHeight = 30;

        stats.forEach((stat, i) => {
            const y = startY + i * lineHeight;
            const cost = getUpgradeCost(stat.key);

            ctx.fillStyle = "white";
            ctx.fillText(`${stat.name}: ${stat.value}  (Lvl ${this.upgrades[stat.key]}/${this.maxUpgrades[stat.key]})`, stX + 10, y);

            // Draw upgrade button
            const btnX = stX + stW - 90;
            const btnY = y - 14;
            const btnW = 80;
            const btnH = 20;

            const isMax = this.upgrades[stat.key] >= this.maxUpgrades[stat.key];

            // Button color (green if affordable and not maxed, else gray)
            ctx.fillStyle = (!isMax && this.player.skillPoints >= cost) ? "green" : "gray";
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.strokeStyle = "white";
            ctx.strokeRect(btnX, btnY, btnW, btnH);

            // Text
            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            if (isMax) {
                ctx.fillText("MAX", btnX + 25, btnY + 14);
            } else {
                ctx.fillText(`+ (${cost})`, btnX + 25, btnY + 14);
            }


            // Store button hitbox for clicks
            statButtons[stat.key] = { x: btnX, y: btnY, w: btnW, h: btnH, cost: cost };
        });
    }

    boostStats(stat) {
        switch (stat) {
            case "hp":
                let hpPerc = this.player.hp / this.player.maxHp;
                this.player.maxHp += this.statGains.hp * Math.pow(this.upgradeMultipliers.hp, this.player.upgrades[stat] - 1);
                this.player.hp = this.player.maxHp * hpPerc;
                break;
            case "bodyDamage":
                this.player.bodyDamage += this.statGains.bodyDamage * Math.pow(this.upgradeMultipliers.bodyDamage, this.player.upgrades[stat] - 1);
                break;
            case "speed":
                this.player.speed += this.statGains.speed * Math.pow(this.upgradeMultipliers.speed, this.player.upgrades[stat] - 1);
                break;
            case "regen":
                this.player.regenRate *= this.upgradeMultipliers.regen;
                break;
            case "strength":
                this.player.strength += this.statGains.strength * Math.pow(this.upgradeMultipliers.strength, this.player.upgrades[stat] - 1);
        }
    }
}
