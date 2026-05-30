import { Scene, Object, ImageObject, ButtonObject, TextObject, DiceObject } from "../scene.js";
import { ctx, canvas } from '../main.js';
import { MultiplayerLobbiesScene } from "./multiplayerlobbies.js";
import { SceneManager } from "../main.js";
import { getBestMove, getRandomMove } from "../robot.js";
import { Lobby, ROWS, COLS, GRID_SIZE } from "../lobby.js";


let waiter = 0;
let waitTime = 80;
let initialized = false;

// Define the drawing area (cyan rectangle)
const playerDrawArea = {
    x: 800,
    y: 600,
    width: 600,
    height: 400
};

const enemyDrawArea = {
    x: 800,
    y: 30,
    width: 600,
    height: 400
};


const gameLobby = new Lobby();

// Calculate pixel size based on grid dimensions
const CELL_W = playerDrawArea.width / COLS;
const CELL_H = playerDrawArea.height / ROWS;

// Mouse state
let drawing = false;

// Converts mouse position to grid coordinates
function getGridCoords(mx, my) {
    let col = Math.floor((mx - playerDrawArea.x) / CELL_W);
    let row = Math.floor((my - playerDrawArea.y) / CELL_H);
    return { row, col };
}

// Check if mouse is inside the draw area
function isInsideDrawArea(mx, my) {
    return mx >= playerDrawArea.x && mx < playerDrawArea.x + playerDrawArea.width &&
        my >= playerDrawArea.y && my < playerDrawArea.y + playerDrawArea.height;
}

// Add event listeners for drawing
addEventListener("mousedown", function (e) {
    if (!canvas) return;
    const scale = canvas.height / innerHeight; // Dynamic scaling
    const mx = e.clientX * scale;
    const my = e.clientY * scale;

    if (isInsideDrawArea(mx, my)) {
        drawing = true;
        let { row, col } = getGridCoords(mx, my);
        if (col >= 0 && col < COLS) { //row >= 0 && row < ROWS 
            gameLobby.placeDice(col);

        }
    }
});

addEventListener("mousemove", function (e) {
    if (!drawing || !canvas) return;

    const scale = canvas.height / innerHeight;
    const mx = e.clientX * scale;
    const my = e.clientY * scale;

    if (isInsideDrawArea(mx, my)) {
        let { row, col } = getGridCoords(mx, my);
        if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
            //grid[row][col] = 1; // Mark cell as "drawn"
        }
    }
});

addEventListener("mouseup", function () {
    drawing = false;
});

// Define the Lobby Scene
export const singleplayerGameScene = new Scene([
    new Object(() => [10, 10], function () {
        const [x, y] = this.position();
        ctx.fillStyle = "orange";
        ctx.fillRect(x, y, canvas.width, canvas.height);

        // Draw cyan rectangle (drawing area)
        ctx.fillStyle = "cyan";
        ctx.fillRect(playerDrawArea.x, playerDrawArea.y, playerDrawArea.width, playerDrawArea.height);
        ctx.fillRect(enemyDrawArea.x, enemyDrawArea.y, enemyDrawArea.width, enemyDrawArea.height);

        // Draw the grid
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                ctx.fillStyle = gameLobby.playerColorColumns[c]; // Drawn pixels
                ctx.fillRect(
                    playerDrawArea.x + c * CELL_W,
                    playerDrawArea.y + r * CELL_H,
                    CELL_W,
                    CELL_H
                );
                ctx.fillStyle = gameLobby.enemyColorColumns[c];
                ctx.fillRect(
                    enemyDrawArea.x + c * CELL_W,
                    enemyDrawArea.y + r * CELL_H,
                    CELL_W,
                    CELL_H
                );
            }
        }

        // Draw grid lines (optional)
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 2;
        for (let r = 0; r <= ROWS; r++) {
            // Player
            let py = playerDrawArea.y + r * CELL_H;
            ctx.beginPath();
            ctx.moveTo(playerDrawArea.x, py);
            ctx.lineTo(playerDrawArea.x + playerDrawArea.width, py);
            ctx.stroke();
            //enemy
            let ey = enemyDrawArea.y + r * CELL_H;
            ctx.beginPath();
            ctx.moveTo(enemyDrawArea.x, ey);
            ctx.lineTo(enemyDrawArea.x + enemyDrawArea.width, ey);
            ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
            //player
            let px = playerDrawArea.x + c * CELL_W;
            ctx.beginPath();
            ctx.moveTo(px, playerDrawArea.y);
            ctx.lineTo(px, playerDrawArea.y + playerDrawArea.height);
            ctx.stroke();
            //enemy
            let ex = enemyDrawArea.x + c * CELL_W;
            ctx.beginPath();
            ctx.moveTo(ex, enemyDrawArea.y);
            ctx.lineTo(ex, enemyDrawArea.y + enemyDrawArea.height);
            ctx.stroke();
        }
    }),
    new ButtonObject(() => [(canvas.width / 2) + 400, canvas.height / 2], () => [300, 100], function () {
        const [x, y] = this.position();
        const [w, h] = this.dimensions();
        ctx.fillStyle = "red";
        ctx.fillRect(x, y, w, h);
    }, function () {
        //SceneManager.currentScene = MultiplayerLobbiesScene;
        //randomDice = 4;
        gameLobby.randomizeDice();
        //sendGrid(playerGrid);
    }),

    // Current dice
    new DiceObject(() => { return gameLobby.currentDice; }, () => [590, 750], 100, () => { }),

    // All the invisible dice in the player grid
    new DiceObject(() => { return gameLobby.playerGrid.at(0).at(0); }, () => [850, 620], 100, () => { }),
    new DiceObject(() => { return gameLobby.playerGrid.at(0).at(1); }, () => [1050, 620], 100, () => { }),
    new DiceObject(() => { return gameLobby.playerGrid.at(0).at(2); }, () => [1250, 620], 100, () => { }),

    new DiceObject(() => { return gameLobby.playerGrid.at(1).at(0); }, () => [850, 750], 100, () => { }),
    new DiceObject(() => { return gameLobby.playerGrid.at(1).at(1); }, () => [1050, 750], 100, () => { }),
    new DiceObject(() => { return gameLobby.playerGrid.at(1).at(2); }, () => [1250, 750], 100, () => { }),

    new DiceObject(() => { return gameLobby.playerGrid.at(2).at(0); }, () => [850, 880], 100, () => { }),
    new DiceObject(() => { return gameLobby.playerGrid.at(2).at(1); }, () => [1050, 880], 100, () => { }),
    new DiceObject(() => { return gameLobby.playerGrid.at(2).at(2); }, () => [1250, 880], 100, () => { }),

    // ENEMY Current dice
    new DiceObject(() => { return gameLobby.enemyCurrentDice; }, () => [590, 180], 100, () => { }),

    // All the invisible dice in the ENEMY grid
    new DiceObject(() => { return gameLobby.enemyGrid.at(0).at(0); }, () => [850, 50], 100, () => { }),
    new DiceObject(() => { return gameLobby.enemyGrid.at(0).at(1); }, () => [1050, 50], 100, () => { }),
    new DiceObject(() => { return gameLobby.enemyGrid.at(0).at(2); }, () => [1250, 50], 100, () => { }),

    new DiceObject(() => { return gameLobby.enemyGrid.at(1).at(0); }, () => [850, 180], 100, () => { }),
    new DiceObject(() => { return gameLobby.enemyGrid.at(1).at(1); }, () => [1050, 180], 100, () => { }),
    new DiceObject(() => { return gameLobby.enemyGrid.at(1).at(2); }, () => [1250, 180], 100, () => { }),

    new DiceObject(() => { return gameLobby.enemyGrid.at(2).at(0); }, () => [850, 310], 100, () => { }),
    new DiceObject(() => { return gameLobby.enemyGrid.at(2).at(1); }, () => [1050, 310], 100, () => { }),
    new DiceObject(() => { return gameLobby.enemyGrid.at(2).at(2); }, () => [1250, 310], 100, () => { }),

    new TextObject(() => { return gameLobby.getPlayerScore(); }, () => [1550, 800], [300, 100]),
    new TextObject(() => { return gameLobby.getEnemyScore(); }, () => [1550, 300], [300, 100])
], {}, () => {
    //console.log("drawing type shit");
    if (gameLobby.gameOver) {
        ctx.fillStyle = "rgba(20,20,20,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}, () => {
    //console.log("updating type shit");
    //randomizeDice();
    if (!gameLobby.isCurrentTurn) {
        makeRobotMoveUpdate();
    }

    if (!initialized) {
        initialize();
        initialized = true;
    }


});

// Initialize scene data
singleplayerGameScene.data = {
    drawing: false,
};

function update() {
    gameLobby.randomizeDice();
}

function initialize() {
    gameLobby.setEqualToGameManager();
    gameLobby.isPlayerOne = true;
    gameLobby.isCurrentTurn = true;
}




function makeRobotMoveUpdate() {
    if (gameLobby.gameOver) { return; }
    if (waiter < waitTime) {
        waiter++;
        return;
    } else {
        // let isPlaced = false;
        // while(!isPlaced){
        //     let col = getRandomInt(0,2);
        //     for(let row = 0; row <= 2; row++){
        //         if(enemyGrid[row][col] == 6894){
        //             console.log("placing at: [" + col + "]");
        //             isPlaced = true;
        //             enemyPlaceDice(col);
        //             row = 5;
        //         }
        //     }
        // }
        gameLobby.enemyPlaceDice(getBestMove(gameLobby.enemyGrid, gameLobby.playerGrid, gameLobby.enemyCurrentDice));
        //console.log("the AI plays nothing because hes retarded");
        waiter = 0;
        gameLobby.randomizeEnemyDice();
        gameLobby.startTurn();
        return;
    }
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

