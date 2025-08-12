const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const keysPressed = new Set();
const mapWidth = 2500;
const mapHeight = 1250;

const player = new Player(400, 300);
const playerSpawnX = 400;
const playerSpawnY = 300;

const firePatches = [
    new FirePatch(600, 400),
    new FirePatch(900, 700)
];
const FIRE_CAP = 50;
const MIN_SPAWN_INTERVAL = 1500; // 2 seconds
const MAX_SPAWN_INTERVAL = 5000; // 6 seconds
let lastFireSpawnTime = 0;
let fireSpawnInterval = 3000;

let fireShards = [];

let inventoryOpen = false;
const inventoryButton = {
    x: 20,
    y: canvas.height - 50,
    width: 100,
    height: 30
}
const invX = 150;
const invY = canvas.height - 150;
const invW = 200;
const invH = 120;

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
    player.update(deltaTime, keysPressed, camera, mapWidth, mapHeight, isCollidingWithWall);
    firePatches.forEach(f => f.update(deltaTime));
    checkSwordHits();
    // Remove dead fires
    for (let i = firePatches.length - 1; i >= 0; i--) {
        if (!firePatches[i].isAlive) {
            firePatches.splice(i, 1);
        }
    }

    // Player-fire collision
    firePatches.forEach(fire => {
        if (fire.isAlive && !fire.isFading) {
            const dx = player.x - fire.x;
            const dy = player.y - fire.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < player.radius + fire.radius) {
                const now = performance.now();
                if (now - fire.lastDamageTime >= fire.damageDelay && !player.isBlocking) {
                    takeDamage(fire.damage);
                    fire.hit(player.bodyDamage);
                    fire.lastDamageTime = now;
                    if (fire.isFading) {
                        fireShards.push(new FireShard(fire.x, fire.y));
                        player.addXP(fire.xp);
                    }
                }
            }
        }
    })

    // Dynamic spawn timing
    const aliveCount = firePatches.length;
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
                // increase inventory count
                player.fireShards += 1;
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

    for (const wall of walls) {
        ctx.fillStyle = "#FF4400";
        ctx.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
    }
    player.draw(ctx, camera);
    firePatches.forEach(f => f.draw(ctx, camera));
    fireShards.forEach(shard => shard.draw(ctx, camera, performance.now()));

    // Inventory button
    ctx.fillStyle = "#444";
    ctx.fillRect(inventoryButton.x, inventoryButton.y, inventoryButton.width, inventoryButton.height);
    ctx.strokeStyle = "white";
    ctx.strokeRect(inventoryButton.x, inventoryButton.y, inventoryButton.width, inventoryButton.height);
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Inventory", inventoryButton.x + 15, inventoryButton.y + 20);

    if (inventoryOpen) {

        // Background box
        ctx.fillStyle = "#222";
        ctx.fillRect(invX, invY, invW, invH);
        ctx.strokeStyle = "white";
        ctx.strokeRect(invX, invY, invW, invH);
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.fillText("Inventory", invX + 10, invY + 25);

        if (player.fireShards > 0) {
            const shardIcon = new FireShard(invX + 10, invY + 40);
            shardIcon.drawIcon(ctx, invX + 15, invY + 40);
            ctx.fillStyle = "white";
            ctx.fillText(`Fire Shards x ${player.fireShards}`, invX + 35, invY + 50);
        } else {
            ctx.fillStyle = "white";
            ctx.fillText("Empty", invX + 20, invY + 55);
        }
    }

    // HP bar
    ctx.fillStyle = "red";
    ctx.fillRect(10, 10, 125, 25);
    ctx.fillStyle = "limegreen";
    ctx.fillRect(10, 10, (player.hp / player.maxHp) * 125, 25);
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



function isCollidingWithWall(x, y) {
    for (const wall of walls) {
        // Find closest point on rectangle to the circle
        const closestX = Math.max(wall.x, Math.min(x, wall.x + wall.width));
        const closestY = Math.max(wall.y, Math.min(y, wall.y + wall.height));

        // Find distance between circle center and that point
        const dx = x - closestX;
        const dy = y - closestY;

        if (dx * dx + dy * dy < player.radius * player.radius) {
            return true;
        }
    }
    return false;
}

function startSwordSwing() {
    // current time
    const now = performance.now();
    if (!player.isSwinging && now - player.lastSwingTime >= player.swingCooldown) {
        player.isSwinging = true;
        player.swingTimer = 0;
        player.lastSwingTime = now;
    }
}

function startShieldBlock() {
    const now = performance.now();
    if (!player.isBlocking && now - player.lastBlockTime >= player.blockCooldown) {
        player.isBlocking = true;
        player.blockTimer = 0;
        player.lastBlockTime = now;
    }
}

function checkSwordHits() {
    if (!player.isSwinging) return;

    firePatches.forEach(fire => {
        if (!fire.isAlive || fire.isFading) return;

        const angleOffset = 10 * Math.PI / 180;
        const adjustedFacingAngle = player.aimAngle + angleOffset;

        const dx = fire.x - player.x;
        const dy = fire.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angleToFire = Math.atan2(dy, dx);
        // difference between facing direction and fire direction
        let angleDiff = Math.abs(angleToFire - adjustedFacingAngle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        // console.log("player.angle:", player.aimAngle, "angleToFire:", angleToFire, "diff:", angleDiff);


        const swingArc = Math.PI * 72 / 180;

        // Sword hit range: within sword reach & in swing
        if (dist < player.radius + fire.radius + 40 && angleDiff <= swingArc) {
            fire.hit(player.damage);
            if (fire.isFading) {
                fireShards.push(new FireShard(fire.x, fire.y));
                player.addXP(fire.xp);
            }
        }
    })
}

function spawnFirePatch() {
    if (firePatches.length >= FIRE_CAP) return;

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
            if (x > wall.x - 25 && x < wall.x + wall.width + 25 && y > wall.y - 25 && y < wall.y + wall.height + 25) {
                insideWall = true;
                break;
            }
        }
        if (insideWall) {
            tries++;
            continue;
        }

        // 3. Avoid spawning on top of another fire patch
        let tooCloseToFire = false;
        for (const fire of firePatches) {
            const distToFire = Math.hypot(x - fire.x, y - fire.y);
            if (distToFire < fire.radius * 2) {
                tooCloseToFire = true;
            }
        }
        if (tooCloseToFire) {
            tries++;
            continue;
        }

        // Valid location found
        firePatches.push(new FirePatch(x, y));
        console.log(firePatches.length);
        return;
    }
}

function takeDamage(amount) {
    player.hp -= amount;
    if (player.hp < 0) {
        player.hp = 0;
        gameOver = true;
    }
    console.log(`Player HP: ${player.hp}/${player.maxHp}`);
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
    if (e.key == "z") inventoryOpen = !inventoryOpen;
    if (e.code == "Space") startSwordSwing();
    if (e.code == "ShiftLeft" || e.code == "ShiftRight") startShieldBlock();
    if (e.code == "Enter" && gameOver) {
        player.x = playerSpawnX;
        player.y = playerSpawnY;
        player.hp = player.maxHp;
        gameOver = false;
    }


})



document.addEventListener("keyup", (e) => {
    keysPressed.delete(e.key.toLowerCase());
})

canvas.addEventListener("mousedown", (e) => {
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;

    // Check if inside button
    if (e.button === 0 && !gameOver) {
        if (mouseX >= inventoryButton.x && mouseX <= inventoryButton.x + inventoryButton.width && mouseY >= inventoryButton.y && mouseY <= inventoryButton.y + inventoryButton.height) {
            inventoryOpen = true;
            return; // returns so that it doesn't swing sword or block
        } else {
            if (inventoryOpen && !(mouseX >= invX && mouseX <= invX + invW && mouseY >= invY && mouseY <= invY + invH)) {
                inventoryOpen = false;
                return;
            } else {
                startSwordSwing();
            }
        }
    }

    if (e.button === 2) {
        startShieldBlock();
    }


})

document.addEventListener("mousedown", (e) => {
    if (e.button === 0 && gameOver) {
        player.hp = player.maxHp;
        player.x = playerSpawnX;
        player.y = playerSpawnY;
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

canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
})

requestAnimationFrame(gameLoop);
