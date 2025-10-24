import Player from "./player.js";
import FirePatch from "./firePatch.js";
import ZombieFlame from "./zombieFlame.js";
import FireShard from "./fireShard.js";
import Inventory from "./inventory.js";
import Upgrade from "./upgrade.js";
import Crafting from "./crafting.js";
import { ItemRegistry } from "./itemRegistry.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const keysPressed = new Set();
const mapWidth = 2500;
const mapHeight = 1250;

const player = new Player(400, 300);
let playerSpawnX = 400;
let playerSpawnY = 300;

let mouseLeft = false;
let mouseRight = false;

// array - this is for enemy stat changes for different rarities
export const rarityTable = [
    { key: "Common", weight: 50, sizeMult: 1.0, hpMult: 1.0, dmgMult: 1.0, xpMult: 1.0, drops: 1, aggro: 1, color: "#4fbe53ff" },
    { key: "Unusual", weight: 25, sizeMult: 1.2, hpMult: 1.8, dmgMult: 1.6, xpMult: 2.0, drops: 1, aggro: 1.1, color: "#f1de37ff" }, // 2.1, 1.9
    { key: "Rare", weight: 13, sizeMult: 1.4, hpMult: 4, dmgMult: 3, xpMult: 4.1, drops: 1, aggro: 1.3, color: "#2c1bc6ff" }, // 4.6, 3.6
    { key: "Epic", weight: 6.5, sizeMult: 1.7, hpMult: 8.2, dmgMult: 4.8, xpMult: 9.4, drops: 2, aggro: 1.6, color: "#720bf0ff" }, // 11.9, 7
    { key: "Legendary", weight: 3, sizeMult: 2.5, hpMult: 20, dmgMult: 9, xpMult: 24.2, drops: 4, aggro: 2, color: "#d5502bff" }, // 35, 13.5
    { key: "Mythic", weight: 1.5, sizeMult: 4, hpMult: 60, dmgMult: 16, xpMult: 73, drops: 7, aggro: 2.5, color: "#04d3daff" }, // 120, 26
    { key: "Fabled", weight: 0.7, sizeMult: 6.5, hpMult: 200, dmgMult: 30, xpMult: 275, drops: 14, aggro: 3.1, color: "#ff13a4ff" }, // 500, 60
    { key: "Supreme", weight: 0.3, sizeMult: 10, hpMult: 1200, dmgMult: 60, xpMult: 1583, drops: 50, aggro: 3.8, color: "#666666" } // 3000, 125
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

const inventoryButton = {
    x: 15,
    y: canvas.height - 130,
    width: 105,
    height: 30
}
const inv = new Inventory(player, canvas);

const statsButton = {
    x: 15,
    y: canvas.height - 90,
    width: 105,
    height: 30
}
const stats = new Upgrade(player, canvas);

const craftButton = {
    x: 15,
    y: canvas.height - 50,
    width: 105,
    height: 30
}

const craft = new Crafting(player, inv, canvas);

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
                player.addXP(2);
            }
            player.addXP(enemy.xp);
            enemies.splice(i, 1);
        }
    }

    // Player-enemy collision
    enemies.forEach(enemy => {
        if (enemy.isAlive && !enemy.damageable.isFading) {
            if (enemy.speed > 0 && enemy.distanceTo(player) <= enemy.aggro) enemy.follow(player, deltaTime, walls);
            // Make enemies not go through each other
            for (let i = 0; i < enemies.length; i++) {
                const e1 = enemies[i];
                if (e1.weight === 0 || !e1.isAlive) continue;

                for (let j = i + 1; j < enemies.length; j++) {
                    const e2 = enemies[j];
                    if (e2.weight === 0 || !e1.isAlive) continue;

                    const dx = e2.x - e1.x;
                    const dy = e2.y - e1.y;
                    const dist = Math.hypot(dx, dy);
                    const minDist = e1.radius + e2.radius;

                    if (dist < minDist && dist > 0) {
                        const force = (minDist - dist) * 0.1;
                        const nx = dx / dist;
                        const ny = dy / dist;

                        const new1X = e1.x - nx * force;
                        const new1Y = e1.y - ny * force;
                        const new2X = e2.x + nx * force;
                        const new2Y = e2.y + ny * force;

                        const e1HitsWall = e1.isCollidingWithWall(new1X, new1Y, walls);
                        const e2HitsWall = e2.isCollidingWithWall(new2X, new2Y, walls);

                        if (!e1HitsWall) {
                            e1.x = new1X;
                            e1.y = new1Y;
                        }
                        if (!e2HitsWall) {
                            e2.x = new2X;
                            e2.y = new2Y;
                        }
                    }
                }
            }

            if (checkCollision(player, enemy)) {
                const now = performance.now();

                if (!player.shield.isBlocking) {
                    takeDamage(enemy.damage, false, true);
                }
                enemy.damageable.takeDamage(player.bodyDamage, false, true);

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

function checkCollision(player, enemy) {
    if (enemy.shape === "circle") {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < player.radius + enemy.radius;
    } else if (enemy.shape === "square") {
        const halfR = enemy.radius / 2;

        const closestX = Math.max(enemy.x - halfR, Math.min(player.x, enemy.x + halfR));
        const closestY = Math.max(enemy.y - halfR, Math.min(player.y, enemy.y + halfR));

        const dx = player.x - closestX;
        const dy = player.y - closestY;

        return (dx * dx + dy * dy) < (player.radius * player.radius);
    }

    return false;

}

function draw() {
    if (gameState === "title") {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "76px Arial";
        ctx.fillText("elor.io", canvas.width / 2 - 98, canvas.height / 2 - 120);

        ctx.font = "24px Arial";
        ctx.fillText("Enter your username:", canvas.width / 2 - 110, canvas.height / 2 - 55);

        ctx.font = "14px Arial";
        ctx.fillText("Use arrow keys or WASD to move", canvas.width / 2 - 104, canvas.height / 2 + 100);
        ctx.fillText("Q to toggle between keyboard and mouse movement", canvas.width / 2 - 160, canvas.height / 2 + 120);
        ctx.fillText("Space or Left Click to attack", canvas.width / 2 - 88, canvas.height / 2 + 140);
        ctx.fillText("Shift or Right Click to block", canvas.width / 2 - 84, canvas.height / 2 + 160);

        ctx.strokeStyle = "white";
        ctx.strokeRect(canvas.width / 2 - 100, canvas.height / 2 - 30, 200, 35);

        ctx.font = "20px Arial";
        ctx.fillText(usernameInput, canvas.width / 2 - 90, canvas.height / 2 - 5);

        if (cursorVisible) {
            const textX = canvas.width / 2 - 90;
            const textY = canvas.height / 2 - 5;

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
        ctx.fillText("Press Enter to start", canvas.width / 2 - 80, canvas.height / 2 + 40);
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
    ctx.fillText("Inventory [Z]", inventoryButton.x + 9, inventoryButton.y + 20);

    if (inv.isOpen) {
        inv.draw(ctx);
    }

    // Stats button
    ctx.fillStyle = "#444";
    ctx.fillRect(statsButton.x, statsButton.y, statsButton.width, statsButton.height);
    ctx.strokeRect(statsButton.x, statsButton.y, statsButton.width, statsButton.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Upgrade [X]", statsButton.x + 12, statsButton.y + 20);

    if (stats.isOpen) {
        stats.draw(ctx);
    }

    // Craft button
    ctx.fillStyle = "#444";
    ctx.fillRect(craftButton.x, craftButton.y, craftButton.width, craftButton.height);
    ctx.strokeRect(craftButton.x, craftButton.y, craftButton.width, craftButton.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Crafting [C]", craftButton.x + 14, craftButton.y + 20);

    if (craft.isOpen) {
        craft.draw(ctx);
    }

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
        let n = Math.random();
        if (n < 0.4) {
            enemies.push(new FirePatch(x, y, rarityPicked.key));
            console.log("spawned FirePatch", rarityPicked.key, rarityPicked.weight);
        } else {
            enemies.push(new ZombieFlame(x, y, rarityPicked.key));
            console.log("spawned ZombieFlame", rarityPicked.key, rarityPicked.weight);
        }
        return;
    }
}

function takeDamage(amount) {
    if (!player.invincible) {
        player.damageable.takeDamage(amount, false, true);

    }
    if (!player.isAlive) {
        gameOver = true;
    }
    // console.log(`Player HP: ${player.hp}/${player.maxHp}`);
}

function resetPlayer() {
    player.isAlive = true;
    player.invincible = true;
    player.damageable.hp = player.damageable.maxHp;
    let tries = 0;
    while (tries < 10) {
        const x = Math.random() * (250) + 350;
        const y = Math.random() * (180) + 210;
        // Avoid spawning on top of another enemy
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
        playerSpawnX = x;
        playerSpawnY = y;
        break;
    }
    player.x = playerSpawnX;
    player.y = playerSpawnY;
    console.log(player.x + ", " + player.y);
    player.damageable.fadeTime = 1;
    gameOver = false;
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
            player.invincible = true;
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
        craft.close();
    }
    if (e.key == "x") {
        stats.isOpen = !stats.isOpen;
        inv.close();
        craft.close();
    }
    if (e.key == "c") {
        craft.isOpen = !craft.isOpen;
        inv.close();
        stats.close();
    }
    if (e.code == "Space") {
        mouseLeft = true;
    }
    if (e.code == "ShiftLeft" || e.code == "ShiftRight") mouseRight = true;
    if (e.code == "Enter" && gameOver) {
        resetPlayer();
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
            } else if (craft.isOpen && !(mouseX >= craft.crX && mouseX <= craft.crX + craft.crW && mouseY >= craft.crY && mouseY <= craft.crY + craft.crH)) {
                craft.close();
                return;
            } else if (!inv.isOpen && !stats.isOpen && !craft.isOpen) {
                mouseLeft = true;
            }
        }
    }

    if (e.button === 2 && !gameOver && !inv.isOpen && !stats.isOpen && !craft.isOpen) {
        mouseRight = true;
    }

})

document.addEventListener("mousedown", (e) => {
    if (e.button === 0 && gameOver) {
        resetPlayer();
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

    if (inv.isOpen) {
        for (let item in inv.cells) {
            const btn = inv.cells[item];
            if (
                mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                mouseY >= btn.y && mouseY <= btn.y + btn.h
            ) if (item.toLowerCase().includes("sword")) {
                // Equip sword
                console.log(item);
                const swordAmount = inv.items[item]?.amount || 0;
                if (swordAmount > 0) {
                    inv.items[item].amount -= 1;
                    if (inv.items[item].amount <= 0) delete inv.items[item];

                    const oldSword = player.sword;
                    if (oldSword) inv.addItem(oldSword.key, 1);

                    const swordInfo = ItemRegistry[item];
                    // console.log(oldSword.key);
                    if (swordInfo) {
                        const SwordClass = swordInfo.class;
                        const sword = new SwordClass(true, swordInfo.params.damage, swordInfo.params.duration, swordInfo.params.cooldown, swordInfo.params.length, swordInfo.params.width, swordInfo.params.key);

                        player.sword = sword;
                    }
                    // console.log(player.sword.key + ", " + player.damage);
                }
            } else if (item.toLowerCase().includes("shield")) {
                console.log(item);
                // Equip shield
                const shieldAmount = inv.items[item]?.amount || 0;
                if (shieldAmount > 0) {
                    inv.items[item].amount -= 1;
                    if (inv.items[item].amount <= 0) delete inv.items[item];

                    const oldShield = player.shield;
                    if (oldShield) inv.addItem(oldShield.key, 1);

                    const shieldInfo = ItemRegistry[item];
                    // console.log(oldShield.key);
                    if (shieldInfo) {
                        const ShieldClass = shieldInfo.class;
                        const shield = new ShieldClass(true, shieldInfo.params.blockDuration, shieldInfo.params.blockCooldown, shieldInfo.params.width, shieldInfo.params.height, shieldInfo.params.tipHeight, shieldInfo.params.key);
                        player.shield = shield;
                    }
                    // console.log(player.shield);
                }
            }
        }
    }

    if (stats.isOpen) {
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
                }
            }
        }
    }

    if (craft.isOpen) {
        for (let craftin in craft.recipeButtons) {
            const btn = craft.recipeButtons[craftin];
            if (mouseX >= btn.x && mouseX <= btn.x + btn.w &&
                mouseY >= btn.y && mouseY <= btn.y + btn.h) {
                craft.craft(btn.recipe);
            }
        }
    }

})

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
})

requestAnimationFrame(gameLoop);
