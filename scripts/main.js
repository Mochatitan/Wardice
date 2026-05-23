import { Scene, Object, ImageObject, ButtonObject } from './scene.js'
import { MultiplayerLobbiesScene } from './scenes/multiplayerlobbies.js';
import { MainScene } from './scenes/mainScreen.js';
import { singleplayerGameScene } from './scenes/singleplayerGameScene.js'
import { k_socket } from './socket.js';

/** @type {HTMLCanvasElement} */

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

// Constants
const EXPECTED_HEIGHT = 1040;

// Variables
const SceneManager = {
    currentScene: null
}

const GameManager = {
    name: "extravertido",
    playerOne: false,
    roomIndex: 6004,
    roomCode: "AAAA",
    firstDice: 7,
    cheats: false,
}





// Main Code
function initialize() {
    onresize = resize;
    resize();
    // SceneManager.currentScene = MultiplayerLobbiesScene;
    // SceneManager.currentScene = singleplayerGameScene;
    SceneManager.currentScene = MainScene;

    requestAnimationFrame(loop);
}

function update(elapsed) {
    SceneManager.currentScene?.update(elapsed);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    SceneManager.currentScene?.draw();
}

let lastRender = 0;
function loop(dt) {
    const elapsed = dt - lastRender;

    update(elapsed);
    draw();

    lastRender = dt;
    requestAnimationFrame(loop);
}

canvas.addEventListener("click", function (e) {
    const scale = EXPECTED_HEIGHT / innerHeight;
    const [mx, my] = [e.clientX * scale, e.clientY * scale];

    SceneManager.currentScene?.handleClick(mx, my);

});






function resize() {
    const ar = innerWidth / innerHeight;
    canvas.width = EXPECTED_HEIGHT * ar;
    canvas.height = EXPECTED_HEIGHT;
}

initialize();

export { ctx, canvas, SceneManager, GameManager }