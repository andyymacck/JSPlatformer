// GLOBAL VARIABLES
var c = document.getElementById("myCanvas");
var ctx = c.getContext("2d");
ctx.font = "30px Arial"
ctx.fillStyle = "blue"

var cloud1 = new Image()
cloud1.src = '/res/cloud1.png'

var cloud2 = new Image()
cloud2.src = '/res/cloud2.png'

var cloud3 = new Image()
cloud3.src = '/res/cloud3.png'

var cloud4 = new Image()
cloud4.src = '/res/cloud4.png'

var cloud5 = new Image()
cloud5.src = '/res/cloud5.png'

const tileSize = 32;
const gravity = -9.8;
const levels = [];
let paused = false;
let currentLevel = 0;
let currentCheckPoint = 0;
let cameraPosX = 0;
let cameraPosY = tileSize * -4;
const cameraBoundaryLeft = (c.width * 40) / 100;
const cameraBoundaryRight = (c.width * 56) / 100;
const cameraBoundaryTop = (c.height * 50) / 100;
const cameraBoundaryBottom = (c.height * 65) / 100;
const startTime = Date.now();
let elapsedTime = 0;
let coinsCollected = 0;
const jumpStrength = 17;
let previousTime = 0;
let winScreenTimer = 0;
let gameOverTimer = 0;

class Coin {
    constructor(x, y, sx = .2, sy = 0.2) {
        this.img = new Image();
        this.img.src = "/res/coin_11.png";
        this.startX = x;
        this.startY = y;
        this.posX = x;
        this.posY = y;
        this.scaleX = sx;
        this.scaleY = sy;
        this.collider = new Collider(
            x,
            y,
            this.img.width * sx,
            this.img.height * sy,
            "coin",
            true
        );
    }

    update() {
        this.posX = this.startX - cameraPosX;
        this.posY = this.startY - cameraPosY;
        this.collider.posX = this.posX;
        this.collider.posY = this.posY;

        if (this.collider.isActive)
            ctx.drawImage(
                this.img,
                this.posX,
                this.posY,
                this.img.width * this.scaleX,
                this.img.height * this.scaleY
            );
    }
}


class ExtraLife {
    constructor(x, y, sx = 0.2, sy = 0.2) {
        this.img = new Image();
        this.img.src = "/res/cross.png";
        this.startX = x;
        this.startY = y;
        this.posX = x;
        this.posY = y;
        this.scaleX = sx;
        this.scaleY = sy;
        this.collider = new Collider(
            x,
            y,
            this.img.width * sx,
            this.img.height * sy,
            "life",
            true
        );
    }

    update() {
        this.posX = this.startX - cameraPosX;
        this.posY = this.startY - cameraPosY;
        this.collider.posX = this.posX;
        this.collider.posY = this.posY;

        if (this.collider.isActive)
            ctx.drawImage(
                this.img,
                this.posX,
                this.posY,
                this.img.width * this.scaleX,
                this.img.height * this.scaleY
            );
    }
}

function gameLoop() {
    if (!paused) {
        updateGame();
        renderGame();
    }
    requestAnimationFrame(gameLoop);
}

// Toggles the pause state and menu visibility
function togglePause() {
    paused = !paused; // Flip pause state
    const pauseMenu = document.getElementById("pauseMenu");
    pauseMenu.style.display = paused ? "block" : "none";

    if (paused) {
        // Additional logic for pausing (e.g., stopping music or animations)
        console.log("Game paused");
    } else {
        console.log("Game resumed");
    }
}

// Resume Game
function resumeGame() {
    if (paused) togglePause(); // Only resume if paused
}

// Save Game Placeholder
function saveGame() {
    alert("Game saved! (Placeholder implementation)");
}

// Quit Game Placeholder
function quitGame() {
    alert("Quitting game... (Placeholder implementation)");
}

// Attach button listeners when the DOM is loaded
window.onload = () => {
    document.getElementById("resumeButton").onclick = resumeGame;
    document.getElementById("saveButton").onclick = saveGame;
    document.getElementById("quitButton").onclick = quitGame;

    // Bind a key for pausing/unpausing the game
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") { // Esc key to pause/unpause
            togglePause();
        }
    });

    // Start the game loop
    gameLoop();
};

// MOVING HAZARD CLASSES
class MovingHazard {
    constructor(src, x, y, sx = 1, sy = 1) {
        this.img = new Image();
        this.img.src = src;
        this.startX = x;
        this.startY = y;
        this.posX = x;
        this.posY = y;
        this.scaleX = sx;
        this.scaleY = sy;
        this.collider = new Collider(
            x,
            y,
            this.img.width * sx,
            this.img.height * sy,
            "hazard",
            true
        );
    }

    update() {
        this.posX = this.startX - cameraPosX;
        this.posY = this.startY - cameraPosY;
    }
}

class CircleMovingHazard extends MovingHazard {
    constructor(src, x, y, xAmp, yAmp, speed, sx = 1, sy = 1) {
        super(src, x, y, sx, sy);
        this.xAmplitude = xAmp;
        this.yAmplitude = yAmp;
        this.speed = speed;
    }

    update() {
        super.update()
        this.posX += Math.cos(elapsedTime * 0.001 * this.speed) * this.xAmplitude;
        this.posY += Math.sin(elapsedTime * 0.001 * this.speed) * this.yAmplitude;
        this.collider.posX = this.posX;
        this.collider.posY = this.posY;

        ctx.drawImage(
            this.img,
            this.posX,
            this.posY,
            this.img.width * this.scaleX,
            this.img.height * this.scaleY
        );
    }
}

class SineMovingHazard extends MovingHazard {
    constructor(src, x, y, xAmp, yAmp, speed, sx = 1, sy = 1) {
        super(src, x, y, sx, sy);
        this.xAmplitude = xAmp;
        this.yAmplitude = yAmp;
        this.speed = speed;
    }

    update() {
        super.update()
        this.posX += Math.sin(elapsedTime * 0.001 * this.speed) * this.xAmplitude;
        this.posY += Math.sin(elapsedTime * 0.001 * this.speed) * this.yAmplitude;
        this.collider.posX = this.posX;
        this.collider.posY = this.posY;

        ctx.drawImage(
            this.img,
            this.posX,
            this.posY,
            this.img.width * this.scaleX,
            this.img.height * this.scaleY
        );
    }
}

class WaveMovingHazard extends MovingHazard {
    constructor(src, x, y, xAmp, yAmp, speed, sx = 1, sy = 1) {
        super(src, x, y, sx, sy);
        this.xAmplitude = xAmp;
        this.yAmplitude = yAmp;
        this.speed = speed;
    }

    update() {
        super.update()
        this.posX += Math.sin(elapsedTime * 0.0003 * this.speed) * this.xAmplitude;
        this.posY += Math.sin(elapsedTime * 0.001 * this.speed) * this.yAmplitude;
        this.collider.posX = this.posX;
        this.collider.posY = this.posY;

        ctx.drawImage(
            this.img,
            this.posX,
            this.posY,
            this.img.width * this.scaleX,
            this.img.height * this.scaleY
        );
    }
}




// COLLIDER CLASS
class Collider {
    constructor(x, y, w, h, tag = "", isTrigger = false) {
        this.startX = x;
        this.startY = y;
        this.posX = x;
        this.posY = y;
        this.width = w;
        this.height = h;
        this.tag = tag;
        this.isTrigger = isTrigger;
        this.isActive = true;
        if (this.tag == "hazard") {
            this.color = "rgba(255,0,0,0.3)";
        } else if (this.tag == "checkpoint") {
            this.color = "rgba(0,0,255,0.3)";
        } else {
            this.color = "rgba(255,0,255,0.3)";
        }
    }

    setScale(scale) {
        this.startX *= scale;
        this.startY *= scale;
        this.posX *= scale;
        this.posY *= scale;
        this.width *= scale;
        this.height *= scale;
    }

    debugDraw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.posX, this.posY, this.width, this.height);
    }

    update() {
        this.posX = this.startX - cameraPosX;
        this.posY = this.startY - cameraPosY;
    }
}



// LEVEL CLASS
class Level {
    constructor(
        src,
        checkPointsX,
        checkPointsY,
        allColliders,
        movingHazards = [],
        allCoins = [],
        extraLives = [],
        importedTileSize = 32
    ) {
        this.img = new Image();
        this.img.src = src;
        this.checkPointsX = [...checkPointsX];
        this.checkPointsY = [...checkPointsY];
        this.levelColliders = [...allColliders];
        this.movingHazards = [...movingHazards];
        this.coins = [...allCoins];
        this.extraLives = [...extraLives];
        this.importedTileSize = importedTileSize;
    }

    drawMap() {
        ctx.drawImage(
            this.img,
            -cameraPosX,
            -cameraPosY,
            this.img.width * (tileSize / this.importedTileSize),
            this.img.height * (tileSize / this.importedTileSize)
        ); // Draw image at x=100, y=100 with width=200 and height=150
    }
}




// CHARACTER CLASS
class Character {
    constructor(x, y, speed, standingSrc, walkSrc, walkAltSrc, jumpSrc, scale) {
        this.maxLives = 3;
        this.currentLives = this.maxLives
        this.scale = scale;
        this.posX = x;
        this.posY = y;
        this.moveSpeed = speed;
        this.jumpStrength = 0;
        this.dx = 0;
        this.dy = 0;

        this.animState = "standing";
        this.standingSrc = standingSrc;
        this.walkSrc1 = walkSrc;
        this.walkSrc2 = walkAltSrc;
        this.jumpSrc = jumpSrc;

        this.img = new Image();
        this.img.src = standingSrc;
        this.img.width *= scale;
        this.img.height *= scale;
        
        this.width = this.img.width;
        this.height = this.img.height;
    }

    update() {

        if (!this.isOnFloor()) {
            this.dy -= gravity;
        } else {
            this.dy = 0;
            this.fallTime = 0;
        }

        if (this.jumpStrength > 0) {
            if (!this.isOnFloor() || (this.isOnFloor() && this.jumpStrength > jumpStrength - 1)) {
                this.jumpStrength -= 0.15;
                this.dy -= this.jumpStrength;
            } else {
                this.jumpStrength = 0;
            }
        } else {
            this.jumpStrength = 0;
        }


        //iterating through all colliders/triggers in the level
        for (var i = 0; i < levels[currentLevel].levelColliders.length; i++) {
            //Skip over collider if inactive
            if (!levels[currentLevel].levelColliders[i].isActive) continue;

            //this handles wall collisions
            if (
                getCollisionSide(this, levels[currentLevel].levelColliders[i]) != ""
            ) {
                if (
                    getCollisionSide(this, levels[currentLevel].levelColliders[i]) ==
                    "right" &&
                    this.dx > 0 &&
                    !levels[currentLevel].levelColliders[i].isTrigger
                ) {
                    this.dx = 0;
                }
                if (
                    getCollisionSide(this, levels[currentLevel].levelColliders[i]) ==
                    "left" &&
                    this.dx < 0 &&
                    !levels[currentLevel].levelColliders[i].isTrigger
                ) {
                    this.dx = 0;
                }

                if (
                    getCollisionSide(this, levels[currentLevel].levelColliders[i]) ==
                    "top" &&
                    !levels[currentLevel].levelColliders[i].isTrigger
                ) {
                    this.posY = levels[currentLevel].levelColliders[i].posY + levels[currentLevel].levelColliders[i].height
                    this.dy += 1;
                    this.jumpStrength -= 1.5;
                }

                if (
                    getCollisionSide(this, levels[currentLevel].levelColliders[i]) ==
                    "bottom" &&
                    !levels[currentLevel].levelColliders[i].isTrigger
                ) {
                    this.posY = levels[currentLevel].levelColliders[i].posY - this.img.height
                }
            }

            //handles trigger collision event
            if (
                levels[currentLevel].levelColliders[i].isTrigger &&
                this.isColliding(levels[currentLevel].levelColliders[i])
            ) {
                switch (levels[currentLevel].levelColliders[i].tag) {
                    case "hazard":
                        this.takeDamage();
                        break;
                    case "finish":
                        levels[currentLevel].levelColliders[i].isActive = false;
                        if (currentLevel < levels.length - 1) {
                            winScreenTimer = 2;
                            switchLevel(currentLevel + 1);
                        } else {
                            winScreenTimer = 5;
                            this.currentLives = this.maxLives
                            switchLevel(0);
                        }
                        break;
                    case "checkpoint":
                        currentCheckPoint += 1;
                        levels[currentLevel].levelColliders[i].isActive = false;
                        break;
                    default:
                        break;
                }
            }
        }

        // Moving hazards
        for (var i = 0; i < levels[currentLevel].movingHazards.length; i++) {
            if (this.isColliding(levels[currentLevel].movingHazards[i].collider)) {
                this.takeDamage()
            }
        }
        
        // Coins
        for (var i = 0; i < levels[currentLevel].coins.length; i++) {
            if (this.isColliding(levels[currentLevel].coins[i].collider)) {
                levels[currentLevel].coins[i].collider.isActive = false;
                coinsCollected++;
            }
        }

        // Extra Lives
        for (var i = 0; i < levels[currentLevel].extraLives.length; i++) {
            if (this.isColliding(levels[currentLevel].extraLives[i].collider)) {
                levels[currentLevel].extraLives[i].collider.isActive = false;
                this.currentLives++;
            }
        }

        this.handleAnimationState();
        this.executeMovement();
        this.drawCharacter();
    }

    takeDamage() {
        this.currentLives--;
        if (this.currentLives <= 0) {
            this.onGameOver()
        } else {
            this.respawn()
        }
    }

    respawn() {
        this.dx = 0;
        this.dy = 0;
        this.jumpStrength = 0;
        // Just to safeguard against out of range index error
        if (currentCheckPoint >= levels[currentLevel].checkPointsX.length) {
            currentCheckPoint = levels[currentLevel].checkPointsX.length - 1
        }
        
        this.posX = levels[currentLevel].checkPointsX[currentCheckPoint];
        this.posY = levels[currentLevel].checkPointsY[currentCheckPoint];
    }

    onGameOver() {
        this.currentLives = this.maxLives
        gameOverTimer = 2;
        switchLevel(0)
    }

    moveCharacter(deltaX, deltaY) {
        this.dx += deltaX;
        this.dy += deltaY;
    }

    executeMovement() {
        // X axis camera boundaries
        if (this.posX > cameraBoundaryLeft && this.posX < cameraBoundaryRight) {
            this.posX += this.dx;
        } else {
            if (this.dx > 0 && this.posX >= cameraBoundaryRight) {
                cameraPosX += this.dx;
            } else if (this.dx < 0 && this.posX <= cameraBoundaryLeft) {
                cameraPosX += this.dx;
            } else {
                this.posX += this.dx;
            }
        }
        // Y axis camera boundaries
        if (this.posY > cameraBoundaryTop && this.posY < cameraBoundaryBottom) {
            this.posY += this.dy;
        } else {
            if (this.dy > 0 && this.posY >= cameraBoundaryBottom) {
                cameraPosY += this.dy;
            } else if (this.dy < 0 && this.posY <= cameraBoundaryTop) {
                cameraPosY += this.dy;
            } else {
                this.posY += this.dy;
            }
        }
        this.dx = 0;
        this.dy = 0;
    }

    isColliding(other) {
        return (other.isActive &&
            this.posX <= other.posX + other.width && // Right edge of character is right of left edge of other object
            this.posX + this.img.width >= other.posX && // Left edge of character is left of right edge of other object
            this.posY <= other.posY + other.height && // Bottom edge of character is below top edge of other object
            this.posY + this.img.height >= other.posY // Top edge of character is above bottom edge of other object

        );
    }

    isOnFloor() {
        for (var i = 0; i < levels[currentLevel].levelColliders.length; i++) {
            if (
                getCollisionSide(this, levels[currentLevel].levelColliders[i]) ==
                "bottom" &&
                !levels[currentLevel].levelColliders[i].isTrigger
            ) {
                return true;
            }
        }
        return false;
    }

    handleAnimationState() {
        // Determine state 
        if (this.isOnFloor()) {
            if (this.dx < 0) {
                this.animState = "walking"
            } else if (this.dx > 0) {
                this.animState = "walking"
            } else {
                this.animState = "standing";
            }
        } else {
            this.animState = "jumping";
        }

        // Apply corresponding src path, based on current state
        switch (this.animState) {
            case "standing":
                this.img.src = this.standingSrc
                break;
            case "walking":
                if (elapsedTime % 500 > 250)
                    this.img.src = this.walkSrc1
                else
                    this.img.src = this.walkSrc2
                break;
            case "jumping":
                this.img.src = this.jumpSrc
                break;
            default:
                break;
        }
    }

    drawCharacter() {
        ctx.fillStyle = this.color;
        ctx.drawImage(this.img, this.posX, this.posY, this.img.width, this.img.height);
    }
}



//FUNCTIONS
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function getCollisionSide(rect1, rect2) {
    const collisionDetected = rect1.isColliding(rect2);
    if (!collisionDetected) {
        return ""; // No collision
    }

    const left = rect2.posX + rect2.width - rect1.posX;
    const right = rect2.posX - rect1.posX - rect1.width;
    const top = rect2.posY + rect2.height - rect1.posY;
    const bottom = rect2.posY - rect1.posY - rect1.height;

    // Calculate the distance between rect2 and rect1 on each side
    const dx = Math.min(Math.abs(left), Math.abs(right));
    const dy = Math.min(Math.abs(top), Math.abs(bottom));

    if (dx > dy) {
        // Collision is more vertical
        if (rect1.posY < rect2.posY) {
            return "bottom"; // Colliding from the bottom
        } else {
            return "top"; // Colliding from the top
        }
    } else {
        // Collision is more horizontal
        if (rect1.posX < rect2.posX) {
            return "right"; // Colliding from the right
        } else {
            return "left"; // Colliding from the left
        }
    }
}

function switchLevel(index) {
    currentLevel = index;

    cameraPosX = 0;
    cameraPosY = 0;

    //Reactivate all triggers
    for (var i = 0; i < levels[currentLevel].levelColliders.length; i++) {
        levels[currentLevel].levelColliders[i].isActive = true;
    }
    for (var i = 0; i < levels[currentLevel].coins.length; i++) {
        levels[currentLevel].coins[i].collider.isActive = true;
    }
    for (var i = 0; i < levels[currentLevel].extraLives.length; i++) {
        levels[currentLevel].extraLives[i].collider.isActive = true;
    }
    currentCheckPoint = 0;
    player.posX = levels[currentLevel].checkPointsX[0];
    player.posY = levels[currentLevel].checkPointsY[0];
}




// SETUP LEVELS HERE
const level1 = new Level(
    "/res/level1.png",
    [70],
    [200],
    [
        new Collider(tileSize * 2, tileSize * 7, tileSize * 5, tileSize * 1),
        new Collider(tileSize * 18, tileSize * 12, tileSize * 5, tileSize * 1),
        new Collider(tileSize * 24, tileSize * 6, tileSize * 3, tileSize * 1),
        new Collider(tileSize * 33, tileSize * 9, tileSize * 7, tileSize * 1),
        new Collider(tileSize * 45, tileSize * 12, tileSize * 3, tileSize * 1),
        new Collider(tileSize * 10, tileSize * 10, tileSize * 2, tileSize * 3),
        new Collider(tileSize * 52, tileSize * 7, tileSize * 2, tileSize * 3),
        new Collider(tileSize * 75, tileSize * 7, tileSize * 2, tileSize * 3),
        new Collider(tileSize * 72, tileSize * 10, tileSize * 2, tileSize * 3),
        new Collider(tileSize * 81, tileSize * 5, tileSize * 13, tileSize * 5),
        new Collider(tileSize * 81, tileSize * 23, tileSize * 18, tileSize * 2),
        new Collider(tileSize * 61, tileSize * 23, tileSize * 10, tileSize * 2),
        new Collider(tileSize * 23, tileSize * 23, tileSize * 31, tileSize * 2),
        new Collider(tileSize * 53, tileSize * 20, tileSize * 1, tileSize * 3),
        new Collider(tileSize * 6, tileSize * 20, tileSize * 3, tileSize * 1),
        new Collider(tileSize * 12, tileSize * 17, tileSize * 4, tileSize * 1),
        new Collider(tileSize * 10, tileSize * 23, tileSize * 11, tileSize * 2),
        new Collider(tileSize * 20, tileSize * 21, tileSize * 1, tileSize * 2),
        new Collider(tileSize * 24, tileSize * 20, tileSize * 1, tileSize * 1),
        new Collider(tileSize * 26, tileSize * 18, tileSize * 1, tileSize * 1),
        new Collider(tileSize * 28, tileSize * 16, tileSize * 1, tileSize * 1),
        new Collider(tileSize * 30, tileSize * 14, tileSize * 1, tileSize * 1),
        new Collider(tileSize * 36, tileSize * 17, tileSize * 2, tileSize * 1),
        new Collider(tileSize * 39, tileSize * 15, tileSize * 2, tileSize * 1),
        new Collider(tileSize * 55, tileSize * 14, tileSize * 1, tileSize * 1),
        new Collider(tileSize * 59, tileSize * 17, tileSize * 2, tileSize * 1),
        new Collider(tileSize * 63, tileSize * 15, tileSize * 2, tileSize * 1),
        new Collider(tileSize * 65, tileSize * 15, tileSize * 1, tileSize * 1),
        new Collider(tileSize * 0, tileSize * 24, tileSize * 10, tileSize * 1),
        new Collider(tileSize * 98, tileSize * 21, tileSize * 2, tileSize * 2, "finish", true),
        new Collider(tileSize * -20, tileSize * 25, tileSize * 120, tileSize * 3, "hazard", true),
    ],
    [
        new WaveMovingHazard(
            "/res/ghost.png",
            tileSize * 11,
            tileSize * 15,
            150, 70, 3,
            1,
            1
        ),
        new CircleMovingHazard(
            "/res/bat_fly.png",
            tileSize * 20,
            tileSize * 15,
            50, 45, 3,
            1,
            1
        ),
        new SineMovingHazard(
            "/res/bee_fly.png",
            tileSize * 30,
            tileSize * 20,
            50, 40, 3,
            1,
            1
        ),
    ],
    [
        new Coin(100, 300),
        new Coin(220, 300),
        new Coin(300, 300),
        new Coin(500, 500),
        new Coin(900, 500),
        new Coin(1000, 500),
        new Coin(1200, 500),

    ], [
        new ExtraLife(220, 300),
    ]);

const level2 = new Level(
    "/res/level2.png",
    [100],
    [-50],
    [
        new Collider(tileSize * 0, tileSize * 12, tileSize * 3, tileSize * 8),
        new Collider(tileSize * 6, tileSize * 21, tileSize * 3, tileSize * 2),
        new Collider(tileSize * 12, tileSize * 17, tileSize * 1, tileSize * 4),
        new Collider(tileSize * 7, tileSize * 25, tileSize * 4, tileSize * 3),


        new Collider(tileSize * 6, tileSize * 12, tileSize * 6, tileSize * 7),
        new Collider(tileSize * 0, tileSize * 22, tileSize * 1, tileSize * 8),
        new Collider(tileSize * 0, tileSize * 25, tileSize * 2, tileSize * 17),
        new Collider(tileSize * 11, tileSize * 23, tileSize * 19, tileSize * 6),


        new Collider(tileSize * 14, tileSize * 4, tileSize * 7, tileSize * 3),
        new Collider(tileSize * 6, tileSize * 33, tileSize * 18, tileSize * 8),
        new Collider(tileSize * 22, tileSize * 37, tileSize * 12, tileSize * 6),

        //new Collider(tileSize * 11, tileSize * 20, tileSize * 6, tileSize * 5),
        new Collider(tileSize * 12, tileSize * 20, tileSize * 5, tileSize * 2),
        new Collider(tileSize * 15, tileSize * 21, tileSize * 5, tileSize * 2),
        new Collider(tileSize * 20, tileSize * 22, tileSize * 7, tileSize * 2),
        new Collider(tileSize * 44, tileSize * 21, tileSize * 30, tileSize * 3),

        new Collider(tileSize * 43, tileSize * 36, tileSize * 4, tileSize * 2),//bottom basefloating

        new Collider(tileSize * 35, tileSize * 43, tileSize * 44, tileSize * 2),//bottom base
        new Collider(tileSize * 50, tileSize * 41, tileSize * 8, tileSize * 2),//bottom base2
        new Collider(tileSize * 68, tileSize * 41, tileSize * 6, tileSize * 2),//bottom base3
        new Collider(tileSize * 72, tileSize * 39, tileSize * 6, tileSize * 3),//bottom base4
        new Collider(tileSize * 76, tileSize * 37, tileSize * 5, tileSize * 5),//bottom base5
        new Collider(tileSize * 84, tileSize * 40, tileSize * 3, tileSize * 2),//small squarefarright
        new Collider(tileSize * 89, tileSize * 37, tileSize * 3, tileSize * 2),//small squarefarright2
        new Collider(tileSize * 94, tileSize * 34, tileSize * 3, tileSize * 2),//small squarefarright3
        new Collider(tileSize * 89, tileSize * 29, tileSize * 3, tileSize * 2),//small squarefarright4
        new Collider(tileSize * 89, tileSize * 23, tileSize * 3, tileSize * 2),//small squarefarright5
        new Collider(tileSize * 97, tileSize * 20, tileSize * 3, tileSize * 2),//small squarefarright6

        new Collider(tileSize * 81, tileSize * 26, tileSize * 4, tileSize * 4),//mazefarright1
        new Collider(tileSize * 80, tileSize * 19, tileSize * 2, tileSize * 7),//mazefarright2
        new Collider(tileSize * 81, tileSize * 19, tileSize * 3, tileSize * 2),//mazefarright2
        new Collider(tileSize * 79, tileSize * 25, tileSize * 3, tileSize * 4),//mazefarright4
        new Collider(tileSize * 77, tileSize * 26, tileSize * 3, tileSize * 2),//mazefarright5
        new Collider(tileSize * 73, tileSize * 28, tileSize * 6, tileSize * 2),//mazefarright6
        new Collider(tileSize * 68, tileSize * 29, tileSize * 6, tileSize * 3),//mazefarright7
        new Collider(tileSize * 60, tileSize * 32, tileSize * 8, tileSize * 4),//mazefarright8
        new Collider(tileSize * 62, tileSize * 23, tileSize * 8, tileSize * 4),//mazefarright9
        new Collider(tileSize * 70, tileSize * 22, tileSize * 4, tileSize * 4),//mazefarright10
        new Collider(tileSize * 44, tileSize * 26, tileSize * 13, tileSize * 5),//mazeexit1
        new Collider(tileSize * 45, tileSize * 9, tileSize * 7, tileSize * 10),//mazeexit2

        new Collider(300, 0, tileSize * 1, tileSize * 50, "checkpoint", true),
        new Collider(1500, 0, tileSize * 2, tileSize * 30, 'Finish', true),
    ], [
        new SineMovingHazard('/res/bee_fly.png', tileSize * 10, tileSize * 10, 50, 10, 3),
        new CircleMovingHazard('/res/bat_fly.png', tileSize * 20, tileSize * 20, 50, 50, 3),
        new CircleMovingHazard(
            "/res/bat_fly.png",
            tileSize * 50,
            tileSize * 11,
            25, 55, 3,
            1,
            1)
    ], [
        new Coin(100, 300),
        new Coin(130, 300),
        new Coin(160, 300),
        new Coin(190, 300),
        new Coin(220, 300),
    ], [
        new ExtraLife(200, 200),
    ]);

const level3 = new Level('/res/level3.png', [10], [100], [
    new Collider(tileSize * 0, tileSize * 28, tileSize * 10, tileSize * 36),
    new Collider(tileSize * 0, tileSize * 64, tileSize * 8, tileSize * 30),
    new Collider(tileSize * 10, tileSize * 42, tileSize * 2, tileSize * 22),
    new Collider(tileSize * 28, tileSize * 32, tileSize * 8, tileSize * 32),
    new Collider(tileSize * 24, tileSize * 36, tileSize * 8, tileSize * 28),
    new Collider(tileSize * 36, tileSize * 56, tileSize * 6, tileSize * 4),
    new Collider(tileSize * 46, tileSize * 32, tileSize * 2, tileSize * 10),
    new Collider(tileSize * 50, tileSize * 28, tileSize * 2, tileSize * 14),
    new Collider(tileSize * 46, tileSize * 40, tileSize * 6, tileSize * 2),
    new Collider(tileSize * 54, tileSize * 56, tileSize * 6, tileSize * 2),
    new Collider(tileSize * 58, tileSize * 48, tileSize * 2, tileSize * 10),
    new Collider(tileSize * 54, tileSize * 44, tileSize * 2, tileSize * 14),
    new Collider(tileSize * 66, tileSize * 40, tileSize * 6, tileSize * 38),
    new Collider(tileSize * 66, tileSize * 72, tileSize * 16, tileSize * 6),
    new Collider(tileSize * 60, tileSize * 68, tileSize * 8, tileSize * 6),
    new Collider(tileSize * 62, tileSize * 62, tileSize * 2, tileSize * 6),
    new Collider(tileSize * 12, tileSize * 50, tileSize * 10, tileSize * 2),
    new Collider(tileSize * 18, tileSize * 42, tileSize * 10, tileSize * 2),
    new Collider(tileSize * 18, tileSize * 42, tileSize * 2, tileSize * 10),
    new Collider(tileSize * 20, tileSize * 40, tileSize * 10, tileSize * 2),
    new Collider(tileSize * 12, tileSize * 62, tileSize * 12, tileSize * 2),

    // U Shape
    new Collider(tileSize * 78, tileSize * 62, tileSize * 6, tileSize * 2),
    new Collider(tileSize * 82, tileSize * 54, tileSize * 2, tileSize * 10),
    new Collider(tileSize * 78, tileSize * 50, tileSize * 2, tileSize * 14),

    // Tall strand
    new Collider(tileSize * 116, tileSize * 56, tileSize * 2, tileSize * 38),
    new Collider(tileSize * 84, tileSize * 284, tileSize * 2, tileSize * 38),
    new Collider(tileSize * 94, tileSize * 284, tileSize * 2, tileSize * 38),
    new Collider(tileSize * 104, tileSize * 284, tileSize * 2, tileSize * 38),
    new Collider(tileSize * 114, tileSize * 286, tileSize * 2, tileSize * 38),
    new Collider(tileSize * 124, tileSize * 284, tileSize * 2, tileSize * 38),

    //Individual Blocks
    new Collider(tileSize * 40, tileSize * 68, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 48, tileSize * 62, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 62, tileSize * 54, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 100, tileSize * 106, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 100, tileSize * 140, tileSize * 2, tileSize * 2),
    // - Lower Vertical Corridor
    new Collider(tileSize * 16, tileSize * 124, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 8, tileSize * 130, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 20, tileSize * 130, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 14, tileSize * 136, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 8, tileSize * 142, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 22, tileSize * 142, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 14, tileSize * 148, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 12, tileSize * 156, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 20, tileSize * 158, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 10, tileSize * 166, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 20, tileSize * 170, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 10, tileSize * 176, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 18, tileSize * 182, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 8, tileSize * 188, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 18, tileSize * 194, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 12, tileSize * 202, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 20, tileSize * 208, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 10, tileSize * 214, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 20, tileSize * 218, tileSize * 2, tileSize * 2),
    new Collider(tileSize * 10, tileSize * 224, tileSize * 2, tileSize * 2),

    // Larger Blocks
    new Collider(tileSize * 28, tileSize * 66, tileSize * 6, tileSize * 4),
    new Collider(tileSize * 38, tileSize * 78, tileSize * 20, tileSize * 4),
    new Collider(tileSize * 42, tileSize * 108, tileSize * 24, tileSize * 4),
    new Collider(tileSize * 70, tileSize * 286, tileSize * 6, tileSize * 38),
    new Collider(tileSize * 66, tileSize * 142, tileSize * 6, tileSize * 2),
    new Collider(tileSize * 66, tileSize * 144, tileSize * 10, tileSize * 4),
    new Collider(tileSize * 24, tileSize * 230, tileSize * 2, tileSize * 10),
    new Collider(tileSize * 24, tileSize * 230, tileSize * 2, tileSize * 10),
    new Collider(tileSize * 24, tileSize * 238, tileSize * 20, tileSize * 2),
    new Collider(tileSize * 36, tileSize * 238, tileSize * 2, tileSize * 18),
    new Collider(tileSize * 38, tileSize * 254, tileSize * 19, tileSize * 2),
    new Collider(tileSize * 36, tileSize * 210, tileSize * 6, tileSize * 2),
    new Collider(tileSize * 48, tileSize * 222, tileSize * 8, tileSize * 2),
    new Collider(tileSize * 88, tileSize * 82, tileSize * 8, tileSize * 2),
    new Collider(tileSize * 84, tileSize * 84, tileSize * 12, tileSize * 2),
    new Collider(tileSize * 80, tileSize * 142, tileSize * 16, tileSize * 2),
    new Collider(tileSize * 40, tileSize * 80, tileSize * 18, tileSize * 16),
    new Collider(tileSize * 58, tileSize * 86, tileSize * 20, tileSize * 10),
    new Collider(tileSize * 8, tileSize * 70, tileSize * 26, tileSize * 22),
    new Collider(tileSize * 34, tileSize * 82, tileSize * 18, tileSize * 12),

    // Massive Pieces
    new Collider(tileSize * 0, tileSize * 124, tileSize * 6, tileSize * 200),
    new Collider(tileSize * 6, tileSize * 230, tileSize * 4, tileSize * 100),
    new Collider(tileSize * 10, tileSize * 250, tileSize * 22, tileSize * 100),
    new Collider(tileSize * 0, tileSize * 290, tileSize * 70, tileSize * 38),
    new Collider(tileSize * 26, tileSize * 124, tileSize * 6, tileSize * 116),
    new Collider(tileSize * 32, tileSize * 128, tileSize * 4, tileSize * 112),
    new Collider(tileSize * 42, tileSize * 132, tileSize * 6, tileSize * 116),
    new Collider(tileSize * 56, tileSize * 138, tileSize * 6, tileSize * 146),
    new Collider(tileSize * 30, tileSize * 262, tileSize * 18, tileSize * 14),
    new Collider(tileSize * 30, tileSize * 270, tileSize * 10, tileSize * 100),
    new Collider(tileSize * 104, tileSize * 82, tileSize * 75, tileSize * 40),
    new Collider(tileSize * 106, tileSize * 122, tileSize * 75, tileSize * 60),
    new Collider(tileSize * 134, tileSize * 292, tileSize * 60, tileSize * 38),
    new Collider(tileSize * 66, tileSize * 148, tileSize * 100, tileSize * 34),
    new Collider(tileSize * 78, tileSize * 86, tileSize * 18, tileSize * 56),

    // Ridges on the sides
    // - Left Side
    new Collider(tileSize * 95, tileSize * 90, tileSize * 3, tileSize * 4),
    new Collider(tileSize * 95, tileSize * 104, tileSize * 3, tileSize * 6),
    new Collider(tileSize * 95, tileSize * 118, tileSize * 3, tileSize * 6),
    new Collider(tileSize * 95, tileSize * 128, tileSize * 3, tileSize * 4),
    // - Right Side
    new Collider(tileSize * 102, tileSize * 94, tileSize * 3, tileSize * 4),
    new Collider(tileSize * 102, tileSize * 112, tileSize * 3, tileSize * 4),
    new Collider(tileSize * 102, tileSize * 122, tileSize * 7, tileSize * 14),

    new Collider(300, 0, tileSize * 1, tileSize * 50, 'checkpoint', true),
    new Collider(4620, 700, tileSize * 1, tileSize * 400, 'finish', true),
], [
    new SineMovingHazard('/res/bee_fly.png', tileSize * 10, tileSize * 2, 50, -30, 3),
    new CircleMovingHazard('/res/bat_fly.png', tileSize * 12, tileSize * 5, 75, 100, 3),
], [
    new Coin(100, 300),
    new Coin(130, 300),
    new Coin(160, 300),
    new Coin(190, 300),
    new Coin(220, 300),
], [
    new ExtraLife(200, 200),
]);

level3.levelColliders.forEach(col => {
    col.setScale(0.5);
})


levels.push(level1);
levels.push(level2);
levels.push(level3);


//------

// ADD CHARACTERS HERE
const player = new Character(
    c.width / 2 - tileSize,
    tileSize * 12,
    3,
    "/res/alienYellow.png",
    "/res/alienYellow_walk1.png",
    "/res/alienYellow_walk2.png",
    "/res/alienYellow_jump.png",
    0.5
);
//------

// INPUT HANDLING
const pressedKeys = new Set();

document.addEventListener("keydown", (event) => {
    pressedKeys.add(event.key); // Add key to the set
});
document.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.key); // Remove key when it's released
});

function handleInput() {
    if (pressedKeys.has("a")) {
        player.moveCharacter(-player.moveSpeed, 0);
    }
    if (pressedKeys.has("d")) {
        player.moveCharacter(player.moveSpeed, 0);
    }

    //
    // if (pressedKeys.has("w")) {
    //   player.moveCharacter(0, -player.moveSpeed);
    //   }
    //  if (pressedKeys.has("s")) {
    //  player.moveCharacter(0, player.moveSpeed);
    //   }
    //

    // Jump button
    if (pressedKeys.has(" ") && player.isOnFloor()) {
        player.jumpStrength = jumpStrength;
    }

    if (pressedKeys.has("1")) {
        switchLevel(0);
    }
    if (pressedKeys.has("2")) {
        switchLevel(1);
    }
    if (pressedKeys.has("3")) {
        switchLevel(2);
    }
}

function handleWinScreen(deltaTime) {
    // Check to see if we should even be running the rest of the function
    if (winScreenTimer <= 0) {
        return
    }

    // Draw the screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    if (currentLevel == 1 || currentLevel == 2) {
        ctx.fillText("YOU BEAT THE LEVEL! NOW FOR LEVEL " + (currentLevel + 1), c.width / 2, c.height / 2);
        // Decrease the timer
        winScreenTimer -= deltaTime / 1000;
    } else if (currentLevel == 0) {
        ctx.fillText("YOU BEAT THE GAME! THANKS FOR PLAYING", c.width / 2, c.height / 2);
        // Decrease the timer
        winScreenTimer -= deltaTime / 1000;
    }
}

function handleGameOverScreen(deltaTime) {
    // Check to see if we should even be running the rest of the function
    if (gameOverTimer <= 0) {
        return
    }

    // Draw the screen
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, c.width, c.height);

    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText("GAME OVER", c.width / 2, c.height / 2);

    // Decrease the timer
    gameOverTimer -= deltaTime / 1000;
}

function drawParallax() {
    ctx.drawImage(cloud1, -100 - (cameraPosX * 0.2),  (-cameraPosY * 0.2))
    ctx.drawImage(cloud2, 800 - (cameraPosX * 0.2), 100 - (cameraPosY * 0.2))
    ctx.drawImage(cloud3, 400 - (cameraPosX * 0.2), 400 - (cameraPosY * 0.2))
    ctx.drawImage(cloud4, 100 - (cameraPosX * 0.2), 600 - (cameraPosY * 0.2))
    ctx.drawImage(cloud5, 800 - (cameraPosX * 0.2), 500 - (cameraPosY * 0.2))

    ctx.drawImage(cloud1, -100 - (cameraPosX * 0.2), 800 - (cameraPosY * 0.2))
    ctx.drawImage(cloud2, 800 - (cameraPosX * 0.2), 1100 - (cameraPosY * 0.2))
    ctx.drawImage(cloud3, 400 - (cameraPosX * 0.2), 1500 - (cameraPosY * 0.2))
    ctx.drawImage(cloud4, 100 - (cameraPosX * 0.2), 1800 - (cameraPosY * 0.2))
    ctx.drawImage(cloud5, 800 - (cameraPosX * 0.2), 2000 - (cameraPosY * 0.2))

    ctx.drawImage(cloud1, 1200 - (cameraPosX * 0.2),  -(cameraPosY * 0.2))
    ctx.drawImage(cloud2, 2100 - (cameraPosX * 0.2), 100 - (cameraPosY * 0.2))
    ctx.drawImage(cloud3, 1500 - (cameraPosX * 0.2), 400 - (cameraPosY * 0.2))
    ctx.drawImage(cloud4, 1400 - (cameraPosX * 0.2), 600 - (cameraPosY * 0.2))
    ctx.drawImage(cloud5, 2100 - (cameraPosX * 0.2), 500 - (cameraPosY * 0.2))

    ctx.drawImage(cloud1, 1200 - (cameraPosX * 0.2), 800 - (cameraPosY * 0.2))
    ctx.drawImage(cloud2, 2100 - (cameraPosX * 0.2), 1100 - (cameraPosY * 0.2))
    ctx.drawImage(cloud3, 1500 - (cameraPosX * 0.2), 1500 - (cameraPosY * 0.2))
    ctx.drawImage(cloud4, 1400 - (cameraPosX * 0.2), 1800 - (cameraPosY * 0.2))
    ctx.drawImage(cloud5, 2100 - (cameraPosX * 0.2), 2000 - (cameraPosY * 0.2))
}

//------

//MAIN GAME LOOP
function draw() {
    // Clear the canvas
    ctx.clearRect(0, 0, c.width, c.height);

    // Sky
    ctx.fillStyle = "rgb(150,120,255)"
    ctx.fillRect(0, 0, c.width, c.height);

    // Background
    drawParallax()

    //Update time variables
    let currentTime = Date.now();
    elapsedTime = currentTime - startTime;
    let deltaTime = currentTime - previousTime;
    previousTime = currentTime;

    if (currentLevel < levels.length) {
        levels[currentLevel].drawMap();

        for (var i = 0; i < levels[currentLevel].levelColliders.length; i++) {
            if (levels[currentLevel].levelColliders[i].isActive) {
                levels[currentLevel].levelColliders[i].update();
                levels[currentLevel].levelColliders[i].debugDraw();
            }
        }

        for (var i = 0; i < levels[currentLevel].movingHazards.length; i++) {
            levels[currentLevel].movingHazards[i].update();
        }

        for (var i = 0; i < levels[currentLevel].coins.length; i++) {
            levels[currentLevel].coins[i].update();
        }

        for (var i = 0; i < levels[currentLevel].extraLives.length; i++) {
            levels[currentLevel].extraLives[i].update();
        }

        handleInput();
        player.update();

        ctx.textAlign = 'left'
        ctx.fillStyle = "black"
        ctx.fillText("Coins: " + coinsCollected, 50, 50);

        ctx.textAlign = 'right'
        ctx.fillText("Lives: " + player.currentLives, c.width - 50, 50);
    }

    handleWinScreen(deltaTime);
    handleGameOverScreen(deltaTime);

    // Request the next frame
    requestAnimationFrame(draw);
}
// Start the animation loop
requestAnimationFrame(draw);

