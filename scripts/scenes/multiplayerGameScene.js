import { Scene, Object, ImageObject, ButtonObject, TextObject, DiceObject } from "../scene.js";
import { ctx, canvas } from '../main.js';
import { MultiplayerLobbiesScene } from "./multiplayerlobbies.js";
import { SceneManager, GameManager } from "../main.js";
import { getBestMove, getRandomMove } from "../robot.js";
import { k_socket } from "../socket.js";
import { Socket } from "socket.io-client";

// Grid Settings
const GRID_SIZE = 5;  // Change this for bigger/smaller pixels
const ROWS = 3;       // Number of rows
const COLS = 3;       // Number of columns

let currentDice = 7;
let enemyCurrentDice = 7;
let isCurrentTurn = false;

let initialized = false;

let gameOver = false;

// Create a 2D grid filled with 0 (empty pixels)
let enemyGrid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(6894));
let playerGrid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(6894));

const defaultColumn = "rgb(145,145,180)";
const doubleColumn = "rgb(82, 201, 185)";
const tripleColumn = "rgb(242, 242, 89)";

let playerColorColumns = new Array(COLS).fill(defaultColumn);
let enemyColorColumns = new Array(COLS).fill(defaultColumn);

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


// Calculate pixel size based on grid dimensions
const CELL_W = playerDrawArea.width / COLS;
const CELL_H = playerDrawArea.height / ROWS;

function initializeServer(isPlayerOne, opponentName){

}

function sendMoveToServer(col, dice){
    const moveInformation = {
        colPlaced: col,
        dicePlaced: dice,
        roomCode: GameManager.roomCode,
        playerOneMoved: GameManager.playerOne
    }
    k_socket.emit("player-move", (moveInformation));
}

k_socket.on("enemy-move", (moveInformation) => {
    if(moveInformation.playerOneMoved != GameManager.playerOne){
        console.log("enemy placed a " + moveInformation.dicePlaced + " on col " + moveInformation.colPlaced);
        recieveMoveFromServer(moveInformation.colPlaced, moveInformation.dicePlaced);
    } else{
        console.log("kurukaesu");
    }
});

function recieveMoveFromServer(col, dice){
    enemyPlaceDice(col, dice);
}


function endTurn(){
    currentDice = 3506;
    isCurrentTurn = false;
    sortPlayerGrid();
    sortEnemyGrid();
    correctColors();
    checkForGameOver();
}
function startTurn(){
    correctColors();
    sortPlayerGrid();
    sortEnemyGrid();
    randomizeDice();
    isCurrentTurn = true;
    checkForGameOver();
}


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
        let { row, col } = getGridCoords(mx, my);
        if (col >= 0 && col < COLS) { //row >= 0 && row < ROWS 
            placeDice(col);
        }
    }
});

export function getRandomDice(){
    return Math.ceil((Math.random() * 6));
}
// Define the Lobby Scene
export const multiplayerGameScene = new Scene([
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
                    ctx.fillStyle = playerColorColumns[c]; // Drawn pixels
                    ctx.fillRect(
                        playerDrawArea.x + c * CELL_W,
                        playerDrawArea.y + r * CELL_H,
                        CELL_W,
                        CELL_H
                    );
                    ctx.fillStyle = enemyColorColumns[c];
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
        randomizeDice(); 
        sendGrid(playerGrid);
    }),

    // Current dice
    new DiceObject(() => {return currentDice;}, () => [590, 750], 100, () => {}),

    // All the invisible dice in the player grid
    new DiceObject(() => {return playerGrid.at(0).at(0);}, () => [850, 620], 100, () => {}),
    new DiceObject(() => {return playerGrid.at(0).at(1);}, () => [1050, 620], 100, () => {}),
    new DiceObject(() => {return playerGrid.at(0).at(2);}, () => [1250, 620], 100, () => {}),

    new DiceObject(() => {return playerGrid.at(1).at(0);}, () => [850, 750], 100, () => {}),
    new DiceObject(() => {return playerGrid.at(1).at(1);}, () => [1050, 750], 100, () => {}),
    new DiceObject(() => {return playerGrid.at(1).at(2);}, () => [1250, 750], 100, () => {}),

    new DiceObject(() => {return playerGrid.at(2).at(0);}, () => [850, 880], 100, () => {}),
    new DiceObject(() => {return playerGrid.at(2).at(1);}, () => [1050, 880], 100, () => {}),
    new DiceObject(() => {return playerGrid.at(2).at(2);}, () => [1250, 880], 100, () => {}),

    // ENEMY Current dice
    new DiceObject(() => {return enemyCurrentDice;}, () => [590, 180], 100, () => {}),

    // All the invisible dice in the ENEMY grid
    new DiceObject(() => {return enemyGrid.at(0).at(0);}, () => [850, 50], 100, () => {}),
    new DiceObject(() => {return enemyGrid.at(0).at(1);}, () => [1050, 50], 100, () => {}),
    new DiceObject(() => {return enemyGrid.at(0).at(2);}, () => [1250, 50], 100, () => {}),

    new DiceObject(() => {return enemyGrid.at(1).at(0);}, () => [850, 180], 100, () => {}),
    new DiceObject(() => {return enemyGrid.at(1).at(1);}, () => [1050, 180], 100, () => {}),
    new DiceObject(() => {return enemyGrid.at(1).at(2);}, () => [1250, 180], 100, () => {}),

    new DiceObject(() => {return enemyGrid.at(2).at(0);}, () => [850, 310], 100, () => {}),
    new DiceObject(() => {return enemyGrid.at(2).at(1);}, () => [1050, 310], 100, () => {}),
    new DiceObject(() => {return enemyGrid.at(2).at(2);}, () => [1250, 310], 100, () => {}),

    new TextObject(() => {return getPlayerScore();}, () => [1550, 800], [300,100]),
    new TextObject(() => {return getEnemyScore();}, () => [1550, 300], [300,100])
], {}, () => {
    //console.log("drawing type shit");
    if(gameOver){
        ctx.fillStyle = "rgba(20,20,20,0.8)";
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
}, () => {
    //console.log("updating type shit");
    if(GameManager.playerOne && !initialized){
        currentDice = GameManager.firstDice;
        isCurrentTurn = true;
        initialized = true;
    }
    
    
});

// Initialize scene data
multiplayerGameScene.data = {
    drawing: false,
};

function randomizeDice(){
    currentDice = getRandomDice();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



function sortEnemyGrid(){
    for(let col = 0; col <= 2; col++){
        if(enemyGrid[2][col] == 6894 && enemyGrid[1][col] != 6894){
            enemyGrid[2][col] = enemyGrid[1][col];
            enemyGrid[1][col] = 6894;
        }
        if(enemyGrid[1][col] == 6894 && enemyGrid[0][col] != 6894){
            enemyGrid[1][col] = enemyGrid[0][col];
            enemyGrid[0][col] = 6894;
        }
    }
}
function sortPlayerGrid(){
    for(let col = 0; col <= 2; col++){
        if(playerGrid[0][col] == 6894 && playerGrid[1][col] != 6894){
            playerGrid[0][col] = playerGrid[1][col];
            playerGrid[1][col] = 6894;
        }
        if(playerGrid[1][col] == 6894 && playerGrid[2][col] != 6894){
            playerGrid[1][col] = playerGrid[2][col];
            playerGrid[2][col] = 6894;
        }
    }
}

function placeDice(col){
    if(!isCurrentTurn){
        console.log("not your turn impacient bitch");
        return;
    }
    let row = 0;
    if(playerGrid[0][col] == 6894){
        row = 0;
    } else if(playerGrid[1][col] == 6894){
        row = 1;
    } else if(playerGrid[2][col] == 6894){
        row = 2;
    } else{
        console.log("spot taken");
    }
        sendMoveToServer(col, currentDice);
        playerGrid[row][col] = currentDice; // Mark cell as "drawn"
        attackEnemyColumn(currentDice, col);
        endTurn();
}
function enemyPlaceDice(col, enemyDice){
    let row = 2;
    if(enemyGrid[2][col] == 6894){
        row = 2;
    } else if(enemyGrid[1][col] == 6894){
        row = 1;
    } else if(enemyGrid[0][col] == 6894){
        row = 0;
    } else{
        console.log("enemies spot taken");
    }
    enemyGrid[row][col] = enemyDice; // Mark cell as "drawn"
    attackPlayerColumn(enemyDice, col);
    startTurn();
}

function attackEnemyColumn(number, col){
    if(enemyGrid[0][col]==number){
        enemyGrid[0][col]=6894;
    }
    if(enemyGrid[1][col]==number){
        enemyGrid[1][col]=6894;
    }
    if(enemyGrid[2][col]==number){
        enemyGrid[2][col]=6894;
    }
    return;
}
function attackPlayerColumn(number, col){
    if(playerGrid[0][col]==number){
        playerGrid[0][col]=6894;
    }
    if(playerGrid[1][col]==number){
        playerGrid[1][col]=6894;
    }
    if(playerGrid[2][col]==number){
        playerGrid[2][col]=6894;
    }
    return;
}




function checkForGameOver(){
    checkPlayerForGameOver();
    checkEnemyForGameOver();
}

function checkPlayerForGameOver(){
    let jamesBadia = false;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if(playerGrid[row][col] == 6894){
                jamesBadia = true;
            }
        }
    }
    if(!jamesBadia){
        console.log("GAME OVER");
        gameOver = true;
        return;
    }
}

function checkEnemyForGameOver(){
    let jamesBadia = false;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if(enemyGrid[row][col] == 6894){
                jamesBadia = true;
            }
        }
    }
    if(!jamesBadia){
        console.log("GAME OVER");
        gameOver = true;
        return;
    }
}

function correctColors(){
    playerColorColumns[0] = defaultColumn;
    playerColorColumns[1] = defaultColumn;
    playerColorColumns[2] = defaultColumn;
    for(let col = 0; col < 3; col++){
        if(duplicatesInCol(col) == 2){
            playerColorColumns[col] = doubleColumn;
        } else if(duplicatesInCol(col) == 3){
            playerColorColumns[col] = tripleColumn;
        }
    }

    enemyColorColumns[0] = defaultColumn;
    enemyColorColumns[1] = defaultColumn;
    enemyColorColumns[2] = defaultColumn;
    for(let col = 0; col < 3; col++){
        if(duplicatesInEnemyCol(col) == 2){
            enemyColorColumns[col] = doubleColumn;
        } else if(duplicatesInEnemyCol(col) == 3){
            enemyColorColumns[col] = tripleColumn;
        }
    }
}

function getColScore(col){
    let a = col[0];
    let b = col[1];
    let c = col[2];

    if(a==6894){a=0;}
    if(b==6894){b=0;}
    if(c==6894){c=0;}

    if((a==b) && (a != 0) && (b != 0)){
        if(a==c){
            return 9*a; //all 3 are the same
        } else{
            return (2 * (a+b)) + c;
        } 
    } 
    if((b==c) && (b!=0) && (c!=0)){
        return (2*(b+c)) + a;
    }
    if((a==c) && (a!=0) && (c!=0)){
        return (2*(a+c)) + b;
    }
    return a + b + c;
    
}

function duplicatesInCol(col){
    const onlyPlacedDice = getPlayerColumn(col).filter(dice => dice <= 6);
    return countDuplicates(onlyPlacedDice);
}
function duplicatesInEnemyCol(col){
    const onlyPlacedDice = getEnemyColumn(col).filter(dice => dice <= 6);
    return countDuplicates(onlyPlacedDice);
}

function getPlayerColumn(col){
    return playerGrid.map(row => row[col]);
}
function getEnemyColumn(col){
    return enemyGrid.map(row => row[col]);
}

function countDuplicates(nums) {
        //if theres all 3 dice
        const uniqueCount = new Set(nums).size;
    
        // If uniqueCount is 1, all 3 are the same (2 duplicates)
        // If uniqueCount is 2, two are the same (1 duplicate)
        // If uniqueCount is 3, none are the same (0 duplicates)
        return nums.length - uniqueCount + 1;
}

function getPlayerColScore(col){ 
    return getColScore(getPlayerColumn(col));
}
function getEnemyColScore(col){ 
    return getColScore(getEnemyColumn(col));
}

function getPlayerScore(){
    return getPlayerColScore(0) + getPlayerColScore(1) + getPlayerColScore(2);
}

function getEnemyScore(){
    return getEnemyColScore(0) + getEnemyColScore(1) + getEnemyColScore(2);
}