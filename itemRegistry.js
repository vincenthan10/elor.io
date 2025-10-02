import FireShard from "./fireShard.js";
import Sword from "./sword.js";
import Shield from "./shield.js";

export const ItemRegistry = {
    fireShard: {
        class: FireShard,
        name: "Fire Shard",
        drawIcon: FireShard.drawIcon
    },
    basicSword: {
        class: Sword,
        name: "Basic Sword",
        drawIcon: Sword.drawIcon
    },
    basicShield: {
        class: Shield,
        name: "Basic Shield",
        drawIcon: Shield.drawIcon
    }
}
