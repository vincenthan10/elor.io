import Menu from "./menu.js";
import { ItemRegistry } from "./itemRegistry.js";
export default class Inventory extends Menu {
    constructor(player, canvas) {
        super([]);
        this.player = player;
        this.canvas = canvas;
        this.items = {
            // "Fire Shard": { amount: 0 },
            // "Basic Sword": { amount: 1 },
            // "Basic Shield": { amount: 1 }
        }; //internal map

        this.invX = 140;
        this.invY = canvas.height - 250;
        this.invW = 210;
        this.invH = 230;

        this.cellSize = 50;
        this.cols = 4;
        this.padding = 10; // spacing between cells
        this.cells = {};
    }

    open() {
        super.open();
    }

    close() {
        super.close();
    }

    addItem(key, amount = 1) {
        if (!this.items[key]) {
            this.items[key] = { amount: 0 };
        }
        this.items[key].amount += amount;
    }

    draw(ctx) {

        // Background box
        ctx.fillStyle = "#222";
        ctx.fillRect(this.invX, this.invY, this.invW, this.invH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.invX, this.invY, this.invW, this.invH);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Inventory", this.invX + 69, this.invY + 25);

        const keys = Object.keys(this.items);

        if (keys.length === 0) {
            ctx.fillStyle = "gray";
            ctx.font = "14px";
            ctx.fillText("Empty", this.invX + 77, this.invY + 90);
            return;
        }

        // Draw grid slots
        let row = 0;
        let col = 0;

        for (const key of keys) {
            const item = this.items[key];
            const x = this.invX + this.padding + col * (this.cellSize + this.padding);
            const y = this.invY + 40 + row * (this.cellSize + this.padding);

            // Draw slot box
            ctx.strokeStyle = "white";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, y, this.cellSize, this.cellSize);

            // Draw icon if available
            const ItemClass = ItemRegistry[key];

            if (ItemClass && typeof ItemClass.drawIcon === "function") {
                const iconX = x + this.cellSize / 2.2;
                const iconY = y + this.cellSize / 2.8;
                ItemClass.drawIcon(ctx, iconX, iconY, 1.25);
            }

            // Draw item count (bottom-right corner)
            ctx.fillStyle = "white";
            ctx.font = "9px Arial";
            ctx.textAlign = "right";
            ctx.textBaseline = "top";
            ctx.fillText(`x${item.amount}`, x + this.cellSize - 2, y + 2);

            // Draw item name (below the slot)
            ctx.fillStyle = "white";
            ctx.font = "9px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText(ItemClass ? ItemClass.name : ItemClass, x + this.cellSize / 2, y + this.cellSize - 2);

            // Advance grid position
            col++;
            if (col >= this.cols) {
                col = 0;
                row++;
            }

            if (key.toLowerCase().includes("sword")) {
                this.cells[key] = { x, y, w: this.cellSize, h: this.cellSize, key };
            }
        }
        ctx.lineWidth = 4;

        // Reset text alignment
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";


    }
}
