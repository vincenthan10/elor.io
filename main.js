const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const keysPressed = new Set();
const mapWidth = 2500;
const mapHeight = 1250;

const player = new Player(400, 300);

const firePatches = [
    new FirePatch(600, 400),
    new FirePatch(900, 700)
]

const camera = {
    x: player.x - canvas.width / 2,
    y: player.y - canvas.height / 2
}

const walls = [
    { x: 0, y: 0, width: 900, height: 100 },
    { x: 120, y: 300, width: 100, height: 180 },
    { x: 800, y: 720, width: 650, height: 400 }
];

function update(deltaTime) {
    player.update(deltaTime, keysPressed, camera, mapWidth, mapHeight, isCollidingWithWall);
    firePatches.forEach(f => f.update(deltaTime));
    checkSwordHits();
}

function draw() {

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

        const dx = fire.x - player.x;
        const dy = fire.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Sword hit range: within sword reach & in swing
        if (dist < player.radius + fire.radius + 40) {
            fire.hit();
        }
    })
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
    keysPressed.add(e.key.toLowerCase());
    if (e.key == "q") player.mouseMovement = !player.mouseMovement;
    if (e.code == "Space") startSwordSwing();
    if (e.code == "ShiftLeft" || e.code == "ShiftRight") startShieldBlock();
})



document.addEventListener("keyup", (e) => {
    keysPressed.delete(e.key.toLowerCase());
})

document.addEventListener("mousedown", (e) => {
    if (e.button === 0) startSwordSwing(); // left click
    if (e.button === 2) startShieldBlock(); //right click
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
