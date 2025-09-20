import Menu from "./menu.js";
export default class Inventory extends Menu {
    constructor(player, canvas) {
        super([]);
        this.player = player;
        this.canvas = canvas;
        this.items = {}; //internal map

        this.invX = 140;
        this.invY = canvas.height - 200;
        this.invW = 210;
        this.invH = 180;
    }

    open() {
        super.open();
    }

    close() {
        super.close();
    }

    addItem(key, amount = 1) {
        this.items[key] = (this.items[key] || 0) + amount;
        this.player.inventory = this.items;
        console.log(this.player.inventory);
    }

    draw(ctx) {

        // Background box
        ctx.fillStyle = "#222";
        ctx.fillRect(this.invX, this.invY, this.invW, this.invH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.invX, this.invY, this.invW, this.invH);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Inventory", this.invX + 10, this.invY + 25);

        let offsetY = 50;
        for (const key in this.player.inventory) {
            const amount = this.player.inventory[key].amount;

            // Try to get class from registry
            const ItemClass = ItemRegistry[key];
            if (ItemClass && typeof ItemClass.prototype.drawIcon === "function") {
                const iconX = this.invX + 10;
                const iconY = this.invY + offsetY - 10;
                ItemClass.drawIcon(ctx, iconX, iconY);
            }
        }
        ctx.fillStyle = "white";
        ctx.font = "14px Arial";
        ctx.fillText(`${key}: ${amount}`, this.invX, this.invY + offsetY);

        offsetY += 30;

    }
}
