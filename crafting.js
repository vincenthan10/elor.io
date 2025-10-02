import Menu from "./menu.js";
import { ItemRegistry } from "./itemRegistry.js";
import { CraftingRegistry } from "./craftingRegistry.js";

export default class Crafting extends Menu {
    constructor(player, inventory, canvas) {
        super([]);
        this.player = player;
        this.inventory = inventory;
        this.canvas = canvas;
        this.crX = 130;
        this.crY = canvas.height - 220;
        this.crW = 300;
        this.crH = 200;
        this.recipeButtons = {};
    }

    open() { super.open() };
    close() { super.close() };

    canCraft(recipe) {
        for (let key in recipe.requires) {

            if (!this.inventory.items[key] || this.inventory.items[key].amount < recipe.requires[key]) {
                return false;
            }
        }
        return true;
    }

    craft(recipe) {
        if (!this.canCraft(recipe)) return false;
        console.log("Successfuly crafted");

        // Subtract materials
        for (let key in recipe.requires) {
            this.inventory.items[key].amount -= recipe.requires[key];
            if (this.inventory.items[key].amount <= 0) {
                delete this.inventory.items[key];
            }
        }

        // Add result
        for (let key in recipe.produces) {
            this.inventory.addItem(key, recipe.produces[key]);
        }
        return true;
    }

    draw(ctx) {

        // Background box
        ctx.fillStyle = "#222";
        ctx.fillRect(this.crX, this.crY, this.crW, this.crH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.crX, this.crY, this.crW, this.crH);

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Crafting", this.crX + 116, this.crY + 25);

        let y = this.crY + 60;
        this.recipeButtons = {};

        for (let id in CraftingRegistry) {
            const recipe = CraftingRegistry[id];

            // only show if player has >=1 of any required item
            let hasSomething = Object.keys(recipe.requires).some(reqId =>
                this.inventory.items[reqId] && this.inventory.items[reqId].amount > 0
            );
            if (!hasSomething) continue;

            let x = this.crX + 10;

            // Product icon
            const ItemClass = ItemRegistry[id];
            if (ItemClass && typeof ItemClass.drawIcon === "function") {
                ItemClass.drawIcon(ctx, x + 15, y - 5, 1.2);
            }
            // Product name
            ctx.fillStyle = "white";
            ctx.font = "14px Arial";
            ctx.fillText(recipe.name + ": ", x + 40, y + 5);

            // Materials required
            let matX = x + 130;
            for (let reqId in recipe.requires) {
                const amt = recipe.requires[reqId];
                const reqInfo = ItemRegistry[reqId];

                if (reqInfo && typeof reqInfo.drawIcon === "function") {
                    reqInfo.drawIcon(ctx, matX, y - 5, 1);
                }

                ctx.fillStyle = "white";
                ctx.font = "12px Arial";
                ctx.fillText(`x${amt}`, matX + 20, y + 5);

                matX += 60;
            }


            // Craft button
            const btnX = this.crX + this.crW - 80;
            const btnY = y - 12;
            const btnW = 60;
            const btnH = 24;

            const available = this.canCraft(recipe);
            ctx.fillStyle = available ? "green" : "gray";
            ctx.fillRect(btnX, btnY, btnW, btnH);
            ctx.strokeStyle = "white";
            ctx.strokeRect(btnX, btnY, btnW, btnH);

            ctx.fillStyle = "white";
            ctx.font = "12px Arial";
            ctx.fillText("Craft", btnX + 15, btnY + 16);

            this.recipeButtons[id] = { x: btnX, y: btnY, w: btnW, h: btnH, recipe };

            y += 40;
        }
    }
}
