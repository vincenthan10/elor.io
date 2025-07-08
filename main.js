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

function update() {
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

}

function drawPlayer() {
    ctx.beginPath();
    // draws player (always centered on camera)
    ctx.arc(player.x - camera.x, player.y - camera.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.strokeRect(-camera.x, -camera.y, mapWidth, mapHeight);
    drawPlayer();

    for (const wall of walls) {
        ctx.fillStyle = "#FF4400";
        ctx.fillRect(wall.x - camera.x, wall.y - camera.y, wall.width, wall.height);
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

function gameLoop() {
    // console.log(player.dx);
    // console.log(player.dy);
    // console.log(player.mouseMovement);
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
    keysPressed.add(e.key.toLowerCase());
    if (e.key == "q") player.mouseMovement = !player.mouseMovement;
})



document.addEventListener("keyup", (e) => {
    keysPressed.delete(e.key.toLowerCase());
})

document.addEventListener("mousemove", (e) => {
    // make sure player and mouse are in the same coordinate space
    const mouseX = e.offsetX + camera.x;
    const mouseY = e.offsetY + camera.y;

    player.dx = mouseX - player.x;
    player.dy = mouseY - player.y;
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

gameLoop();