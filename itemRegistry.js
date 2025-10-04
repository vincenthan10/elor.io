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
        params: {
            damage: 3,
            duration: 250,
            cooldown: 500,
            length: 30,
            width: 12,
            key: "basicSword"
        },
        drawIcon: (ctx, x, y, scale) => Sword.drawIcon(ctx, x, y, scale, "basic")
    },
    basicShield: {
        class: Shield,
        name: "Basic Shield",
        drawIcon: Shield.drawIcon
    },
    fireSword: {
        class: Sword,
        name: "Fire Sword",
        params: {
            damage: 5,
            duration: 250,
            cooldown: 500,
            length: 30,
            width: 12,
            key: "fireSword"
        },
        drawIcon: (ctx, x, y, scale) => Sword.drawIcon(ctx, x, y, scale, "fire")
    }
}
