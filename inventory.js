class Inventory extends Menu {
    constructor(player) {
        super([]);
        this.player = player;
    }

    open() {
        super.open();
    }

    draw(ctx) {
        const invX = 140;
        const invY = canvas.height - 200;
        const invW = 210;
        const invH = 180;

        // Background box
        ctx.fillStyle = "#222";
        ctx.fillRect(invX, invY, invW, invH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(invX, invY, invW, invH);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Inventory", invX + 10, invY + 25);

        let offsetY = 50;
        for (const key in this.player.inventory) {
            const amount = this.player.inventory[key].amount;

            // Try to get class from registry
            const ItemClass = ItemRegistry[key];
            if (ItemClass && typeof ItemClass.prototype.drawIcon === "function") {
                const iconX = invX + 10;
                const iconY = invY + offsetY - 10;
                ItemClass.drawIcon(ctx, iconX, iconY);
            }
        }
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(`${key}: ${amount}`, invX, invY + offsetY);

        offsetY += 30;

    }
}
