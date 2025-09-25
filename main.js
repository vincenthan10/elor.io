import Player from "./player.js";
import FirePatch from "./firePatch.js";
import FireShard from "./fireShard.js";
import Inventory from "./inventory.js";
import Upgrade from "./upgrade.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const keysPressed = new Set();
const mapWidth = 2500;
const mapHeight = 1250;

const player = new Player(400, 300);
const playerSpawnX = 400;
const playerSpawnY = 300;

let mouseLeft = false;
let mouseRight = false;

// array - this is for enemy stat changes for different rarities
export const rarityTable = [
    { key: "Common", weight: 50, sizeMult: 1.0, hpMult: 1.0, dmgMult: 1.0, xpMult: 1.0, drops: 1, color: "#4fbe53ff" },
    { key: "Unusual", weight: 25, sizeMult: 1.2, hpMult: 1.8, dmgMult: 1.6, xpMult: 2.0, drops: 1, color: "#f1de37ff" }, // 2.1, 1.9
    { key: "Rare", weight: 13, sizeMult: 1.4, hpMult: 4, dmgMult: 3, xpMult: 4.1, drops: 1, color: "#2c1bc6ff" }, // 4.6, 3.6
    { key: "Epic", weight: 6.5, sizeMult: 1.7, hpMult: 8.2, dmgMult: 4.8, xpMult: 9.4, drops: 2, color: "#720bf0ff" }, // 11.9, 7
    { key: "Legendary", weight: 3, sizeMult: 2.5, hpMult: 20, dmgMult: 9, xpMult: 24.2, drops: 4, color: "#d5502bff" }, // 35, 13.5
    { key: "Mythic", weight: 1.5, sizeMult: 4, hpMult: 60, dmgMult: 16, xpMult: 73, drops: 7, color: "#04d3daff" }, // 120, 26
    { key: "Fabled", weight: 0.7, sizeMult: 6.5, hpMult: 200, dmgMult: 30, xpMult: 275, drops: 14, color: "#ff13a4ff" }, // 500, 60
    { key: "Supreme", weight: 0.3, sizeMult: 10, hpMult: 1200, dmgMult: 60, xpMult: 1583, drops: 50, color: "#666666" } // 3000, 125
]

const enemies = [
    new FirePatch(600, 400, "Common"),
    new FirePatch(900, 700, "Common")
];
// these 5 lines: maybe will be put into their respective enemy classes?
const FIRE_CAP = 50;
const MIN_SPAWN_INTERVAL = 1500; // 2 seconds
const MAX_SPAWN_INTERVAL = 5000; // 6 seconds
let lastFireSpawnTime = 0;
let fireSpawnInterval = 3000;

// ???
let fireShards = [];

// let inventoryOpen = false;
const inventoryButton = {
    x: 20,
    y: canvas.height - 130,
    width: 100,
    height: 30
}
const inv = new Inventory(player, canvas);
// const invX = 140;
// const invY = canvas.height - 200;
// const invW = 210;
// const invH = 180;

// let statsOpen = false;
const statsButton = {
    x: 20,
    y: canvas.height - 90,
    width: 100,
    height: 30
}
const stats = new Upgrade(player, canvas);
// const stX = 130;
// const stY = canvas.height - 220;
// const stW = 280;
// const stH = 200;

// let craftOpen = false;
const craftButton = {
    x: 20,
    y: canvas.height - 50,
    width: 100,
    height: 30
}
// const crX = 140;
// const crY = canvas.height - 200;
// const crW = 250;
// const crH = 180;

// object literal
// player.upgrades = {
//     hp: 0,
//     strength: 0,
//     bodyDamage: 0,
//     speed: 0,
//     regen: 0
// }
// const baseUpgradeCosts = {
//     hp: 1,
//     strength: 2,
//     bodyDamage: 2,
//     speed: 1,
//     regen: 2
// }
// const costIncreases = {
//     hp: 1,
//     strength: 2,
//     bodyDamage: 1,
//     speed: 2,
//     regen: 2
// }
// const statGains = {
//     hp: 4,
//     strength: 0.8,
//     bodyDamage: 0.5,
//     speed: 0.2,
//     regen: 0.4
// }
// const upgradeMultipliers = {
//     hp: 1.3,
//     strength: 1.35,
//     bodyDamage: 1.6,
//     speed: 1.3,
//     regen: 1.58
// }
// const maxUpgrades = {
//     hp: 8,
//     strength: 6,
//     bodyDamage: 6,
//     speed: 5,
//     regen: 9
// }

// dictionary, CHANGE TO ARRAY
// const recipes = {
//     fireSword: {
//         name: "Fire Sword",
//         icon: "fireSword",
//         output: { item: "fireSword", amount: 1 },
//         cost: [
//             { item: "fireShard", amount: 10 }
//         ]
//     }
// };

let gameState = "title";
// username text cursor
let cursorVisible = true;
let cursorTimer = 0;
let username = "Unknown";
let usernameInput = "";
let gameOver = false;

const camera = {
    x: player.x - canvas.width / 2,
    y: player.y - canvas.height / 2
}

const walls = [
    { x: 0, y: 0, width: 900, height: 100 },
    { x: 120, y: 300, width: 100, height: 180 },
    { x: 800, y: 720, width: 650, height: 400 }
];

// Start with 2 patches
for (let i = 0; i < 2; i++) {
    spawnFirePatch();
}

// username text cursor
function updateCursor(deltaTime) {
    cursorTimer += deltaTime;
    if (cursorTimer >= 500) { // blink every 500 ms
        cursorVisible = !cursorVisible;
        cursorTimer = 0;
    }
}

function update(deltaTime) {
    if (gameOver) return;
    if (gameState === "title") {
        updateCursor(deltaTime);
        return;
    }
    player.update(deltaTime, keysPressed, camera, mapWidth, mapHeight, walls, canvas);
    if (!player.isAlive) {
        gameOver = true;
        return; // ensuring death
    }

    if (mouseLeft) {
        player.attack();
    }
    if (mouseRight) {
        player.defend();
    }
    enemies.forEach(e => e.update(deltaTime));
    checkSwordHits();
    // Remove dead enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        if (!enemies[i].isAlive) {
            const enemy = enemies[i];
            for (let j = 0; j < enemy.rarity.drops; j++) {
                const offsetX = (Math.random() - 0.5) * 20;
                const offsetY = (Math.random() - 0.5) * 20;
                fireShards.push(new FireShard(enemy.x + offsetX, enemy.y + offsetY));
                player.addXP(10);
            }
            player.addXP(enemy.xp);
            enemies.splice(i, 1);
        }
    }

    // Player-enemy collision
    enemies.forEach(enemy => {
        if (enemy.isAlive && !enemy.damageable.isFading) {
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < player.radius + enemy.radius) {
                const now = performance.now();

                if (!player.shield.isBlocking) {
                    takeDamage(enemy.damage, false, true);
                }
                enemy.damageable.takeDamage(player.bodyDamage, false, true);
                //enemy.lastDamageTime = now;

            }
        }
    })

    // Dynamic spawn timing
    const aliveCount = enemies.length;
    const now = performance.now();
    const difficultyFactor = aliveCount / FIRE_CAP;
    fireSpawnInterval = MIN_SPAWN_INTERVAL + difficultyFactor * (MAX_SPAWN_INTERVAL - MIN_SPAWN_INTERVAL);

    if (now - lastFireSpawnTime >= fireSpawnInterval) {
        spawnFirePatch();
        lastFireSpawnTime = now;
    }

    // Collect fire shards
    fireShards.forEach(shard => {
        if (!shard.isCollected && shard.isAlive) {
            shard.update(deltaTime);
            const dx = shard.x - player.x;
            const dy = shard.y - player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            // Use max dimension as "radius" for pickup
            const shardRadius = Math.max(shard.width, shard.height) / 2;
            if (dist < player.radius + shardRadius) {
                shard.isCollected = true;
                shard.isAlive = false;
                // increase inventory count
                inv.addItem(shard.key, 1);
            }
        }
    })
    fireShards = fireShards.filter(shard => shard.isAlive);
}

function draw() {
    if (gameState === "title") {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "48px Arial";
        ctx.fillText("elor.io", canvas.width / 2 - 100, canvas.height / 2 - 80);

        ctx.font = "24px Arial";
        ctx.fillText("Enter your username:", canvas.width / 2 - 110, canvas.height / 2 - 20);

        ctx.strokeStyle = "white";
        ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 + 10, 200, 40);

        ctx.font = "20px Arial";
        ctx.fillText(usernameInput, canvas.width / 2 - 90, canvas.height / 2 + 37);

        if (cursorVisible) {
            const textX = canvas.width / 2 - 90;
            const textY = canvas.height / 2 + 37;

            // Measure the width of the usernameInput text so cursor is positioned right after it
            const textWidth = ctx.measureText(usernameInput).width;

            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(textX + textWidth + 2, textY - 20);
            ctx.lineTo(textX + textWidth + 2, textY + 5);
            ctx.stroke();
        }


        ctx.font = "18px Arial";
        ctx.fillText("Press Enter to start", canvas.width / 2 - 80, canvas.height / 2 + 80);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.strokeRect(-camera.x, -camera.y, mapWidth, mapHeight);
    ctx.lineWidth = 4;

    for (const wall of walls) {
        ctx.fillStyle = "#FF4400";
        ctx.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
    }
    player.draw(ctx, camera);
    enemies.forEach(e => e.draw(ctx, camera));
    fireShards.forEach(shard => shard.draw(ctx, camera, performance.now()));

    // Inventory button
    ctx.fillStyle = "#444";
    ctx.fillRect(inventoryButton.x, inventoryButton.y, inventoryButton.width, inventoryButton.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(inventoryButton.x, inventoryButton.y, inventoryButton.width, inventoryButton.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Inventory", inventoryButton.x + 15, inventoryButton.y + 20);

    if (inv.isOpen) {
        inv.draw(ctx);
    }

    // Stats button
    ctx.fillStyle = "#444";
    ctx.fillRect(statsButton.x, statsButton.y, statsButton.width, statsButton.height);
    ctx.strokeRect(statsButton.x, statsButton.y, statsButton.width, statsButton.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Upgrade", statsButton.x + 17, statsButton.y + 20);

    if (stats.isOpen) {
        stats.draw(ctx);
    }

    // Craft button
    ctx.fillStyle = "#444";
    ctx.fillRect(craftButton.x, craftButton.y, craftButton.width, craftButton.height);
    ctx.strokeRect(craftButton.x, craftButton.y, craftButton.width, craftButton.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Crafting", craftButton.x + 19, craftButton.y + 20);

    // if (craftOpen) {
    //     drawCrafting(ctx);
    // }

    // HP bar
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 125, 25);
    ctx.fillStyle = "limegreen";
    ctx.fillRect(10, 10, (player.damageable.hp / player.damageable.maxHp) * 125, 25);
    ctx.strokeStyle = "black";
    ctx.strokeRect(10, 10, 125, 25);
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(username, 10 + 125 / 2, 10 + 17); // center in bar
    ctx.textAlign = "left"; // reset alignment


    // XP bar background (gray)
    ctx.fillStyle = "#555";
    ctx.fillRect(10, 50, 75, 15);

    // XP bar fill (blue)
    ctx.fillStyle = "#436efcff";
    const xpWidth = (player.xp / player.xpNeeded) * 75;
    ctx.fillRect(10, 50, xpWidth, 15);

    // XP bar border
    ctx.strokeStyle = "black";
    ctx.strokeRect(10, 50, 75, 15);

    // XP text
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(`Level ${player.level}`, 10, 62.5);

    // Game Over screen
    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("Game Over", canvas.width / 2 - 100, canvas.height / 2 - 40);

        ctx.font = "16px Arial";
        ctx.fillText("Press Enter to respawn, or click anywhere", canvas.width / 2 - 133, canvas.height / 2);
    }

}

// function drawInventory(ctx) {
//     // Background box
//     ctx.fillStyle = "#222";
//     ctx.fillRect(invX, invY, invW, invH);
//     ctx.strokeStyle = "white";
//     ctx.strokeRect(invX, invY, invW, invH);
//     ctx.fillStyle = "white";
//     ctx.font = "18px Arial";
//     ctx.fillText("Inventory", invX + 10, invY + 25);

//     ctx.font = "14px Arial";
//     if (player.fireShards > 0) {
//         const shardIcon = new FireShard(invX + 10, invY + 40);
//         shardIcon.drawIcon(ctx, invX + 15, invY + 49);
//         ctx.fillStyle = "white";
//         ctx.fillText(`Fire Shards x ${player.fireShards}`, invX + 35, invY + 52);
//     } else {
//         ctx.fillStyle = "white";
//         ctx.fillText("Empty", invX + 20, invY + 52);
//     }
// }

// function drawStats(ctx) {

//     // Background
//     ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
//     ctx.fillRect(stX, stY, stW, stH);
//     ctx.strokeStyle = "white";
//     ctx.strokeRect(stX, stY, stW, stH);

//     ctx.fillStyle = "white";
//     ctx.font = "18px Arial";
//     ctx.fillText("Stats Menu", stX + 10, stY + 30);

//     ctx.font = "14px Arial";
//     // Skill points in top right
//     ctx.fillText(`Skill Points: ${player.skillPoints}`, stX + stW - 92, stY + 25);

//     const stats = [
//         { name: "HP", value: player.maxHp.toFixed(1), key: "hp" },
//         { name: "Strength", value: player.strength.toFixed(1), key: "strength" },
//         { name: "Body Damage", value: player.bodyDamage.toFixed(1), key: "bodyDamage" },
//         { name: "Speed", value: player.speed.toFixed(1), key: "speed" },
//         { name: "Regen", value: (player.regenRate * 1000).toFixed(3) + "/s", key: "regen" }
//     ];
//     const startY = stY + 60;
//     const lineHeight = 30;

//     stats.forEach((stat, i) => {
//         const y = startY + i * lineHeight;
//         const cost = getUpgradeCost(stat.key);

//         ctx.fillStyle = "white";
//         ctx.fillText(`${stat.name}: ${stat.value}  (Lvl ${player.upgrades[stat.key]}/${maxUpgrades[stat.key]})`, stX + 10, y);

//         // Draw upgrade button
//         const btnX = stX + stW - 90;
//         const btnY = y - 14;
//         const btnW = 80;
//         const btnH = 20;

//         const isMax = player.upgrades[stat.key] >= maxUpgrades[stat.key];

//         // Button color (green if affordable and not maxed, else gray)
//         ctx.fillStyle = (!isMax && player.skillPoints >= cost) ? "green" : "gray";
//         ctx.fillRect(btnX, btnY, btnW, btnH);
//         ctx.strokeStyle = "white";
//         ctx.strokeRect(btnX, btnY, btnW, btnH);

//         // Text
//         ctx.fillStyle = "white";
//         ctx.font = "12px Arial";
//         if (isMax) {
//             ctx.fillText("MAX", btnX + 25, btnY + 14);
//         } else {
//             ctx.fillText(`+ (${cost})`, btnX + 25, btnY + 14);
//         }


//         // Store button hitbox for clicks
//         statButtons[stat.key] = { x: btnX, y: btnY, w: btnW, h: btnH, cost: cost };
//     });
// }

// let statButtons = {};

// function drawCrafting(ctx) {
//     // Background box
//     ctx.fillStyle = "#222";
//     ctx.fillRect(crX, crY, crW, crH);
//     ctx.strokeStyle = "white";
//     ctx.strokeRect(crX, crY, crW, crH);
//     ctx.fillStyle = "white";
//     ctx.font = "18px Arial";
//     ctx.fillText("Crafting", crX + 15, crY + 25);

//     let y = 55;
//     for (let key in recipes) {
//         const recipe = recipes[key];
//         if (!canSeeRecipe(recipe)) continue;


//     }
// }

// function canSeeRecipe(recipe) {
//     return recipe.cost.some(req => player.inventory[req.item] >= 1);
// }

// // Calculate cost based on current level
// function getUpgradeCost(stat) {
//     return baseUpgradeCosts[stat] + costIncreases[stat] * player.upgrades[stat];
// }

// function isCollidingWithWall(x, y) {
//     for (const wall of walls) {
//         // Find closest point on rectangle to the circle
//         const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.width));
//         const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.height));

//         // Find distance between circle center and that point
//         const dx = x - closestX;
//         const dy = y - closestY;

//         if (dx * dx + dy * dy < player.radius * player.radius) {
//             return true;
//         }
//     }
//     return false;
// }


// maybe reorganize later?
function checkSwordHits() {
    if (!player.sword.isSwinging) return;

    enemies.forEach(enemy => {
        if (!enemy.isAlive || enemy.isFading) return;

        const angleOffset = 10 * Math.PI / 180;
        const adjustedFacingAngle = player.aimAngle + angleOffset;

        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angleToEnemy = Math.atan2(dy, dx);
        // difference between facing direction and fire direction
        let angleDiff = Math.abs(angleToEnemy - adjustedFacingAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        // console.log("player.angle:", player.aimAngle, "angleToFire:", angleToFire, "diff:", angleDiff);


        const swingArc = Math.PI * 72 / 180;

        // Sword hit range: within sword reach & in swing
        if (dist < player.radius + enemy.radius + 40 && angleDiff <= swingArc) {
            enemy.damageable.takeDamage(player.damage, true, false);
        }
    })
}

function pickRarityByWeight(playerLevel) {
    const adjustedRarityTable = rarityTable.map(r => {
        let adjustedWeight = r.weight;
        if (r.key === "Common") {
            adjustedWeight = r.weight * Math.max(1 - (playerLevel - 1) * 0.02, 0.01);
        }
        if (r.key === "Unusual") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.02);
        }
        if (r.key === "Rare") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.06);
        }
        if (r.key === "Epic") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.1);
        }
        if (r.key === "Legendary") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.12);
        }
        if (r.key === "Mythic") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.14);
        }
        if (r.key === "Fabled") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.15);
        }
        if (r.key === "Supreme") {
            adjustedWeight = r.weight * (1 + (playerLevel - 1) * 0.16);
        }
        return { ...r, weight: adjustedWeight };
    })

    const total = adjustedRarityTable.reduce((s, r) => s + r.weight, 0);
    let roll = Math.random() * total;
    for (const r of adjustedRarityTable) {
        if (roll < r.weight) {
            // console.log(`🔥 ${r.key} ${r.weight.toFixed(2)}`);
            return r;
        }
        roll -= r.weight;
    }
    // console.log(`🔥 (fallback): ${adjustedRarityTable[0].key}  ${adjustedRarityTable[0].weight.toFixed(2)}`);
    return adjustedRarityTable[0];
}

function spawnFirePatch() {
    if (enemies.length >= FIRE_CAP) return;
    const rarityPicked = pickRarityByWeight(player.level);

    let tries = 0;
    while (tries < 50) { // avoid infinite loop if map is crowded
        const x = Math.random() * (mapWidth - 100) + 50;
        const y = Math.random() * (mapHeight - 100) + 50;

        // 1. Avoid spawning inside player
        const distToPlayer = Math.hypot(x - player.x, y - player.y);
        if (distToPlayer < player.radius + 50) {
            tries++;
            continue;
        }

        // 2. Avoid spawning inside walls
        let insideWall = false;
        for (const wall of walls) {
            if (x > wall.x - 30 * rarityPicked.sizeMult && x < wall.x + wall.width + 30 * rarityPicked.sizeMult && y > wall.y - 30 * rarityPicked.sizeMult && y < wall.y + wall.height + 30 * rarityPicked.sizeMult) {
                insideWall = true;
                break;
            }
        }
        if (insideWall) {
            tries++;
            continue;
        }

        // 3. Avoid spawning on top of another enemy
        let tooCloseToEnemy = false;
        for (const enemy of enemies) {
            const distToEnemy = Math.hypot(x - enemy.x, y - enemy.y);
            if (distToEnemy < enemy.radius * 3) {
                tooCloseToEnemy = true;
            }
        }
        if (tooCloseToEnemy) {
            tries++;
            continue;
        }

        // Valid location found
        enemies.push(new FirePatch(x, y, rarityPicked.key));
        console.log("spawned", rarityPicked.key, rarityPicked.weight);
        return;
    }
}

function takeDamage(amount) {
    player.damageable.takeDamage(amount, false, true);
    if (!player.isAlive) {
        gameOver = true;
    }
    // console.log(`Player HP: ${player.hp}/${player.maxHp}`);
}


let lastTimestamp = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    update(deltaTime);
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    if (gameState === "title") {
        if (e.key === "Backspace") {
            usernameInput = usernameInput.slice(0, -1);
            e.preventDefault();
        } else if (e.key === "Enter") {
            username = usernameInput.trim() || "Unknown";
            gameState = "playing";
        } else if (e.key.length === 1 && usernameInput.length < 15) {
            usernameInput += e.key;
            e.preventDefault();
        }
        return;
    }

    keysPressed.add(e.key.toLowerCase());
    if (e.key == "q") player.mouseMovement = !player.mouseMovement;
    if (e.key == "z") {
        inv.isOpen = !inv.isOpen;
        stats.close();
    }
    if (e.key == "x") {
        stats.isOpen = !stats.isOpen;
        inv.close();
    }
    if (e.key == "c") {
        // craftOpen = ;
        // inventoryOpen = false;
        // statsOpen = false;
    }
    if (e.code == "Space") {
        mouseLeft = true;
    }
    if (e.code == "ShiftLeft" || e.code == "ShiftRight") mouseRight = true;
    if (e.code == "Enter" && gameOver) {
        player.isAlive = true;
        player.x = playerSpawnX;
        player.y = playerSpawnY;
        player.damageable.hp = player.damageable.maxHp;
        player.damageable.fadeTime = 1;
        gameOver = false;
    }


})



document.addEventListener("keyup", (e) => {
    keysPressed.delete(e.key.toLowerCase());
    if (e.code === "Space") mouseLeft = false;
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") mouseRight = false;
})

canvas.addEventListener("mousedown", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Check if inside button
    if (e.button === 0 && !gameOver && gameState === "playing") {
        if (mouseX >= inventoryButton.x && mouseX <= inventoryButton.x + inventoryButton.width && mouseY >= inventoryButton.y && mouseY <= inventoryButton.y + inventoryButton.height) {
            stats.close();
            inv.open();
            return; // returns so that it doesn't swing sword or block
        } else if (mouseX >= statsButton.x && mouseX <= statsButton.x + statsButton.width && mouseY >= statsButton.y && mouseY <= statsButton.y + statsButton.height) {
            inv.close();
            stats.open();
            return;
        } else {
            if (inv.isOpen && !(mouseX >= inv.invX && mouseX <= inv.invX + inv.invW && mouseY >= inv.invY && mouseY <= inv.invY + inv.invH)) {
                inv.close();
                return;
            } else if (stats.isOpen && !(mouseX >= stats.stX && mouseX <= stats.stX + stats.stW && mouseY >= stats.stY && mouseY <= stats.stY + stats.stH)) {
                stats.close();
                return;
            } else if (!inv.isOpen && !stats.isOpen) {
                mouseLeft = true;
            }
        }
    }

    if (e.button === 2 && !gameOver && !inv.isOpen && !stats.isOpen) {
        mouseRight = true;
    }

})

document.addEventListener("mousedown", (e) => {
    if (e.button === 0 && gameOver) {
        player.isAlive = true;
        player.damageable.hp = player.damageable.maxHp;
        player.x = playerSpawnX;
        player.y = playerSpawnY;
        player.damageable.fadeTime = 1;
        gameOver = false;
    }
})

document.addEventListener("mousemove", (e) => {
    const mouseX = e.offsetX + camera.x;
    const mouseY = e.offsetY + camera.y;

    player.dx = mouseX - player.x;
    player.dy = mouseY - player.y;
    player.aimAngle = Math.atan2(player.dy, player.dx);

    let length = Math.sqrt(player.dx * player.dx + player.dy * player.dy);

    if (length < 10) {
        player.dx = 0;
        player.dy = 0;
    } else {
        player.dx /= length;
        player.dy /= length;
        let scaledSpeed = Math.min(length / 100, 1) * player.speed;
        player.dx *= scaledSpeed;
        player.dy *= scaledSpeed;
    }
    // console.log(length);
})

window.addEventListener("mouseup", (e) => {
    if (e.button === 0) mouseLeft = false;
    if (e.button === 2) mouseRight = false;
});

document.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let stat in stats.statButtons) {
        const btn = stats.statButtons[stat];
        if (
            mouseX >= btn.x && mouseX <= btn.x + btn.w &&
            mouseY >= btn.y && mouseY <= btn.y + btn.h
        ) {
            if (player.skillPoints >= btn.cost && stats.upgrades[stat] < 9) {
                player.skillPoints -= btn.cost;
                stats.upgrades[stat]++;
                stats.boostStats(stat);
                // // Apply upgrade effect
                // switch (stat) {
                //     case "hp":
                //         let hpPerc = player.hp / player.maxHp;
                //         player.maxHp += statGains.hp * Math.pow(upgradeMultipliers.hp, player.upgrades[stat] - 1);
                //         player.hp = player.maxHp * hpPerc;
                //         break;
                //     case "bodyDamage":
                //         player.bodyDamage += statGains.bodyDamage * Math.pow(upgradeMultipliers.bodyDamage, player.upgrades[stat] - 1);
                //         break;
                //     case "speed":
                //         player.speed += statGains.speed * Math.pow(upgradeMultipliers.speed, player.upgrades[stat] - 1);
                //         break;
                //     case "regen":
                //         player.regenRate *= upgradeMultipliers.regen;
                //         break;
                //     case "strength":
                //         player.strength += statGains.strength * Math.pow(upgradeMultipliers.strength, player.upgrades[stat] - 1);
                // }
            }
        }
    }
})

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
})

requestAnimationFrame(gameLoop);
