import { Scene, Object, ImageObject, ButtonObject, TextObject, DiceObject } from "./scene.js";
import { ctx, canvas } from './main.js';
import { MultiplayerLobbiesScene } from "./scenes/multiplayerlobbies.js";
import { SceneManager, GameManager } from "./main.js";
import { getBestMove, getRandomMove } from "./robot.js";

export const GRID_SIZE = 5;  // Change this for bigger/smaller pixels
export const ROWS = 3;       // Number of rows
export const COLS = 3;       // Number of columns


const defaultColumn = "rgb(145,145,180)";
const doubleColumn = "rgb(82, 201, 185)";
const tripleColumn = "rgb(242, 242, 89)";

const emptyDicePlaceholder = 6894;

export class Lobby {

    currentDice = 6;
    enemyCurrentDice = 4;
    isCurrentTurn = false;
    gameOver = false;
    isPlayerOne = false;
    lobbyIndex = 66;
    roomCode = "ABCD";

    playerName = "defaultplayer";
    enemyName = "defaultenemy";

    // Create a 2D grid filled with 0 (empty pixels)
    enemyGrid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(emptyDicePlaceholder));
    playerGrid = new Array(ROWS).fill(null).map(() => new Array(COLS).fill(emptyDicePlaceholder));

    playerColorColumns = new Array(COLS).fill(defaultColumn);
    enemyColorColumns = new Array(COLS).fill(defaultColumn);

    constructor() {

    }


    setEqualToGameManager() {
        this.isPlayerOne = GameManager.playerOne;
        this.lobbyIndex = GameManager.roomIndex;
        this.roomCode = GameManager.roomCode;
    }

    /*
     * const GameManager = {
    name: "extravertido",
    playerOne: false,
    roomIndex: 6004,
    roomCode: "AAAA",
    firstDice: 7,
    cheats: false,
}
     */

    placeDice(col) {
        if (!this.isCurrentTurn) {
            console.log("not your turn impacient bitch");
            return;
        }
        let row = 0;
        if (this.playerGrid[0][col] == emptyDicePlaceholder) {
            row = 0;
        } else if (this.playerGrid[1][col] == emptyDicePlaceholder) {
            row = 1;
        } else if (this.playerGrid[2][col] == emptyDicePlaceholder) {
            row = 2;
        } else {
            console.log("spot taken");
        }
        this.playerGrid[row][col] = this.currentDice; // Mark cell as "drawn"
        this.attackEnemyColumn(this.currentDice, col);
        this.endTurn();
    }

    enemyPlaceDice(col) {
        if (this.isCurrentTurn) {
            console("not your turn impacient ENEMY");
            return;
        }
        let row = 2;
        if (this.enemyGrid[2][col] == emptyDicePlaceholder) {
            row = 2;
        } else if (this.enemyGrid[1][col] == emptyDicePlaceholder) {
            row = 1;
        } else if (this.enemyGrid[0][col] == emptyDicePlaceholder) {
            row = 0;
        } else {
            console.log("spot taken");
        }
        this.enemyGrid[row][col] = this.enemyCurrentDice; // Mark cell as "drawn"
        this.attackPlayerColumn(this.enemyCurrentDice, col);
        this.endTurn();
    }

    attackEnemyColumn(number, col) {
        if (this.enemyGrid[0][col] == number) {
            this.enemyGrid[0][col] = emptyDicePlaceholder;
        }
        if (this.enemyGrid[1][col] == number) {
            this.enemyGrid[1][col] = emptyDicePlaceholder;
        }
        if (this.enemyGrid[2][col] == number) {
            this.enemyGrid[2][col] = emptyDicePlaceholder;
        }
        return;
    }

    attackPlayerColumn(number, col) {
        if (this.playerGrid[0][col] == number) {
            this.playerGrid[0][col] = emptyDicePlaceholder;
        }
        if (this.playerGrid[1][col] == number) {
            this.playerGrid[1][col] = emptyDicePlaceholder;
        }
        if (this.playerGrid[2][col] == number) {
            this.playerGrid[2][col] = emptyDicePlaceholder;
        }
        return;
    }

    endTurn() {
        this.currentDice = 3506;
        this.isCurrentTurn = false;
        this.sortPlayerGrid();
        this.sortEnemyGrid();
        this.correctColors();
        this.checkForGameOver();
    }

    startTurn() {
        this.correctColors();
        this.sortPlayerGrid();
        this.sortEnemyGrid();
        this.randomizeDice();
        this.isCurrentTurn = true;
        this.checkForGameOver();
    }

    checkForGameOver() {
        this.checkPlayerForGameOver();
        this.checkEnemyForGameOver();
    }

    checkPlayerForGameOver() {
        let jamesBadia = false;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.playerGrid[row][col] == emptyDicePlaceholder) {
                    jamesBadia = true;
                }
            }
        }
        if (!jamesBadia) {
            console.log("GAME OVER");
            this.gameOver = true;
            return;
        }
    }

    checkEnemyForGameOver() {
        let jamesBadia = false;
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.enemyGrid[row][col] == emptyDicePlaceholder) {
                    jamesBadia = true;
                }
            }
        }
        if (!jamesBadia) {
            console.log("GAME OVER");
            this.gameOver = true;
            return;
        }
    }

    correctColors() {
        this.playerColorColumns[0] = defaultColumn;
        this.playerColorColumns[1] = defaultColumn;
        this.playerColorColumns[2] = defaultColumn;
        for (let col = 0; col < 3; col++) {
            if (this.duplicatesInCol(col) == 2) {
                this.playerColorColumns[col] = doubleColumn;
            } else if (this.duplicatesInCol(col) == 3) {
                this.playerColorColumns[col] = tripleColumn;
            }
        }

        this.enemyColorColumns[0] = defaultColumn;
        this.enemyColorColumns[1] = defaultColumn;
        this.enemyColorColumns[2] = defaultColumn;
        for (let col = 0; col < 3; col++) {
            if (this.duplicatesInEnemyCol(col) == 2) {
                this.enemyColorColumns[col] = doubleColumn;
            } else if (this.duplicatesInEnemyCol(col) == 3) {
                this.enemyColorColumns[col] = tripleColumn;
            }
        }
    }

    getColScore(col) {
        let a = col[0];
        let b = col[1];
        let c = col[2];

        if (a == emptyDicePlaceholder) { a = 0; }
        if (b == emptyDicePlaceholder) { b = 0; }
        if (c == emptyDicePlaceholder) { c = 0; }

        if ((a == b) && (a != 0) && (b != 0)) {
            if (a == c) {
                return 9 * a; //all 3 are the same
            } else {
                return (2 * (a + b)) + c;
            }
        }
        if ((b == c) && (b != 0) && (c != 0)) {
            return (2 * (b + c)) + a;
        }
        if ((a == c) && (a != 0) && (c != 0)) {
            return (2 * (a + c)) + b;
        }
        return a + b + c;

    }

    duplicatesInCol(col) {
        const onlyPlacedDice = this.getPlayerColumn(col).filter(dice => dice <= 6);
        return this.countDuplicates(onlyPlacedDice);
    }

    duplicatesInEnemyCol(col) {
        const onlyPlacedDice = this.getEnemyColumn(col).filter(dice => dice <= 6);
        return this.countDuplicates(onlyPlacedDice);
    }

    getPlayerColumn(col) {
        return this.playerGrid.map(row => row[col]);
    }

    getEnemyColumn(col) {
        return this.enemyGrid.map(row => row[col]);
    }

    countDuplicates(nums) {
        //if theres all 3 dice
        const uniqueCount = new Set(nums).size;

        // If uniqueCount is 1, all 3 are the same (2 duplicates)
        // If uniqueCount is 2, two are the same (1 duplicate)
        // If uniqueCount is 3, none are the same (0 duplicates)
        return nums.length - uniqueCount + 1;
    }

    getPlayerColScore(col) {
        return this.getColScore(this.getPlayerColumn(col));
    }

    getEnemyColScore(col) {
        return this.getColScore(this.getEnemyColumn(col));
    }

    getPlayerScore() {
        return this.getPlayerColScore(0) + this.getPlayerColScore(1) + this.getPlayerColScore(2);
    }

    getEnemyScore() {
        return this.getEnemyColScore(0) + this.getEnemyColScore(1) + this.getEnemyColScore(2);
    }

    sortEnemyGrid() {
        for (let col = 0; col <= 2; col++) {
            if (this.enemyGrid[2][col] == emptyDicePlaceholder && this.enemyGrid[1][col] != emptyDicePlaceholder) {
                this.enemyGrid[2][col] = this.enemyGrid[1][col];
                this.enemyGrid[1][col] = emptyDicePlaceholder;
            }
            if (this.enemyGrid[1][col] == emptyDicePlaceholder && this.enemyGrid[0][col] != emptyDicePlaceholder) {
                this.enemyGrid[1][col] = this.enemyGrid[0][col];
                this.enemyGrid[0][col] = emptyDicePlaceholder;
            }
        }
    }

    sortPlayerGrid() {
        for (let col = 0; col <= 2; col++) {
            if (this.playerGrid[0][col] == emptyDicePlaceholder && this.playerGrid[1][col] != emptyDicePlaceholder) {
                this.playerGrid[0][col] = this.playerGrid[1][col];
                this.playerGrid[1][col] = emptyDicePlaceholder;
            }
            if (this.playerGrid[1][col] == emptyDicePlaceholder && this.playerGrid[2][col] != emptyDicePlaceholder) {
                this.playerGrid[1][col] = this.playerGrid[2][col];
                this.playerGrid[2][col] = emptyDicePlaceholder;
            }
        }
    }

    randomizeDice() {
        this.currentDice = getRandomDice();
    }

    randomizeEnemyDice() {
        this.enemyCurrentDice = getRandomDice();
    }

}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomDice() {
    return getRandomInt(1, 6);
}