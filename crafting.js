import Menu from "./menu.js";
import { ItemRegistry } from "./itemRegistry";
import { CraftingRegistry } from "./craftingRegistry.js";

export default class Crafting extends Menu {
    constructor(player, canvas) {
        super([]);
        this.player = player;
        this.canvas = canvas;
        this.crX = 130;
        this.crY = canvas.height - 220;
        this.crW = 300;
        this.crH = 200;
        this.recipeButtons = {};
    }

    open() { super.open() };
    close() { super.close() };

    canCraft(recipe, inventory) {
        for (let key in recipe.requires) {
            if (!inventory.items[key] || inventory.items[key].amount < recipe.requires[key]) {
                return false;
            }
        }
        return true;
    }

    craft(recipe, inventory) {
        if (!this.canCraft(recipe, inventory)) return false;

        // Subtract materials
        for (let key in recipe.requires) {
            inventory.items[key].amount -= recipe.requires[key];
            if (inventory.items[key].amount <= 0) {
                delete inventory.items[key];
            }
        }

        // Add result
        for (let key in recipe.produces) {
            inventory.addItem(key, recipe.produces[key]);
        }
        return true;
    }

    draw(ctx) {

    }
}