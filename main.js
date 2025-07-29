const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const keysPressed = new Set();
const mapWidth = 2500;
const mapHeight = 1250;

const player = {
    x: 400,
    y: 300,
    radius: 20,
    speed: 3,
    aimAngle: 0,
    // sword animation
    isSwinging: false,
    swingTimer: 0,
    swingDuration: 250, //milliseconds
    swingCooldown: 650,
    lastSwingTime: -Infinity,
    swingAngleOffset: 0,
    // shield animation
    isBlocking: false,
    blockTimer: 0,
    blockDuration: 500, //milliseconds
    blockCooldown: 800,
    lastBlockTime: -Infinity,
    // for mouse only
    dx: 0,
    dy: 0,
    mouseMovement: false
};

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
    //keyboard movement
    let dx = 0;
    let dy = 0;
    if (!player.mouseMovement) {
        if (keysPressed.has("w") || keysPressed.has("arrowup")) dy -= player.speed;
        if (keysPressed.has("s") || keysPressed.has("arrowdown")) dy += player.speed;
        if (keysPressed.has("a") || keysPressed.has("arrowleft")) dx -= player.speed;
        if (keysPressed.has("d") || keysPressed.has("arrowright")) dx += player.speed;
        if (dx !== 0 && dy !== 0) {
            dx /= Math.sqrt(2);
            dy /= Math.sqrt(2);
        }
    }
    // disallow player to move past boundaries
    if (player.x - player.radius <= 0 && (player.dx < 0 || dx < 0)) {
        dx = 0;
        player.dx = 0;
    }
    if (player.x + player.radius >= mapWidth && (player.dx > 0 || dx > 0)) {
        dx = 0;
        player.dx = 0;
    }
    if (player.y - player.radius <= 0 && (player.dy < 0 || dy < 0)) {
        dy = 0;
        player.dy = 0;
    }
    if (player.y + player.radius >= mapHeight && (player.dy > 0 || dy > 0)) {
        dy = 0;
        player.dy = 0;
    }

    if (!player.mouseMovement) {
        let newX = player.x + dx;
        let newY = player.y + dy;
        if (!isCollidingWithWall(newX, player.y)) player.x = newX;
        if (!isCollidingWithWall(player.x, newY)) player.y = newY;
    } else {
        // mouse movement
        let newX = player.x + player.dx;
        let newY = player.y + player.dy;
        if (!isCollidingWithWall(newX, player.y)) player.x = newX;
        if (!isCollidingWithWall(player.x, newY)) player.y = newY;
    }



    camera.x = player.x - canvas.width / 2;
    camera.y = player.y - canvas.height / 2;

    // clamp camera so it doesn't scroll past the map
    camera.x = Math.max(0, Math.min(camera.x, mapWidth - canvas.width));
    camera.y = Math.max(0, Math.min(camera.y, mapHeight - canvas.height));

    // sword animation
    if (player.isSwinging) {
        player.swingTimer += deltaTime;
        const progress = player.swingTimer / player.swingDuration;

        // animate an arc from -45 degrees to +45 degrees relative to player aim
        const maxOffset = Math.PI / 4;
        player.swingAngleOffset = -maxOffset + (progress * 2 * maxOffset);

        if (progress >= 1) {
            player.isSwinging = false;
            player.swingAngleOffset = 0;
        }
    }

    // shield animation
    if (player.isBlocking) {
        player.blockTimer += deltaTime;
        if (player.blockTimer >= player.blockDuration) {
            player.isBlocking = false;
        }
    }

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
    drawPlayer();

}

function drawPlayer() {
    ctx.beginPath();
    // draws player (always centered on camera)
    ctx.arc(player.x - camera.x, player.y - camera.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();

    // SWORD
    const swordLength = 30;
    const swordWidth = 12;
    const angle = player.aimAngle;
    const swordAngle = player.aimAngle + player.swingAngleOffset;

    // offset base of sowrd to the right of the player's body
    const handOffsetAngle = swordAngle + Math.PI / 2.1;
    const handOffsetDistance = player.radius * 1.1;

    // tip of sword
    const tipX = player.x + Math.cos(swordAngle) * (player.radius + swordLength);
    const tipY = player.y + Math.sin(swordAngle) * (player.radius + swordLength);

    // base of the sword
    const baseX = player.x + Math.cos(handOffsetAngle) * handOffsetDistance;
    const baseY = player.y + Math.sin(handOffsetAngle) * handOffsetDistance;

    // perpendicular offsets for triangle width
    const offsetX = Math.cos(swordAngle + Math.PI / 2) * (swordWidth / 2);
    const offsetY = Math.sin(swordAngle + Math.PI / 2) * (swordWidth / 2);

    // base corners
    const base1X = baseX + offsetX;
    const base1Y = baseY + offsetY;

    const base2X = baseX - offsetX;
    const base2Y = baseY - offsetY;

    // draw triangle
    ctx.fillStyle = "silver";
    ctx.beginPath();
    ctx.moveTo(tipX - camera.x, tipY - camera.y);
    ctx.lineTo(base1X - camera.x, base1Y - camera.y);
    ctx.lineTo(base2X - camera.x, base2Y - camera.y);
    ctx.closePath();
    ctx.fill();


    // SHIELD (custom pentagon: triangle on top of square)
    const shieldWidth = 22;
    const shieldHeight = 25;
    const shieldTipHeight = 10;
    const halfW = shieldWidth / 2;

    const shieldLocalPoints = [
        { x: shieldHeight + shieldTipHeight, y: 0 },   // tip (right side)
        { x: shieldHeight, y: -halfW },                // top right
        { x: 0, y: -halfW },                            // top left
        { x: 0, y: halfW },                             // bottom left
        { x: shieldHeight, y: halfW }                  // bottom right
    ];

    const isBlocking = player.isBlocking;
    // if isBlocking, calculate the progress, otherwise, progress is 0
    const blockProgress = isBlocking ? Math.min(player.blockTimer / player.blockDuration, 1) : 0;
    const blockScale = 1 + 0.3 * Math.sin(blockProgress * Math.PI); // scale to grow and shrink when blocking

    const offsetAngle = angle - Math.PI / 2.1;
    const offsetDistance = player.radius * 1.1;

    const shieldCenterX = player.x + Math.cos(offsetAngle) * offsetDistance;
    const shieldCenterY = player.y + Math.sin(offsetAngle) * offsetDistance;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.fillStyle = isBlocking ? "#88ffff" : "#88aaff";
    ctx.save();
    ctx.translate(shieldCenterX - camera.x, shieldCenterY - camera.y);
    ctx.rotate(player.aimAngle);
    ctx.scale(blockScale, blockScale); //scale relative to center
    ctx.beginPath();

    for (let i = 0; i < shieldLocalPoints.length; i++) {
        const local = shieldLocalPoints[i];


        if (i === 0) {
            ctx.moveTo(local.x, local.y);
        } else {
            ctx.lineTo(local.x, local.y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

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
    // make sure player and mouse are in the same coordinate space
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
