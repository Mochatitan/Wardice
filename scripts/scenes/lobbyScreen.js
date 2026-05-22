import { Scene, Object, ImageObject, ButtonObject, TextObject } from "../scene";
import { ctx, canvas } from '../main.js';
import { SceneManager, GameManager } from "../main.js";
import { MainScene } from "./mainScreen.js";
import { k_socket } from "../socket.js";
import { multiplayerGameScene } from "./multiplayerGameScene.js";

export const LobbyScene = new Scene([
    new Object(() => [120, 780], function () {
        const [x, y] = this.position()
        ctx.fillStyle = "orange";
        ctx.fillRect(x, y, this.data.loadingProgress, 120);
    }),
    new TextObject(() => { return ("code: " + GameManager.roomCode); }, () => [1000, 500], [300, 100])
]);

k_socket.on("game-start", (gameData) => {
    console.log("lobby started!");
    console.log(gameData.name);
    if (GameManager.name == gameData.name) {
        console.log("IM PLAYER ONE");
        GameManager.playerOne = true;
    }
    GameManager.firstDice = gameData.firstDice;
    SceneManager.currentScene = multiplayerGameScene;
});

// k_socket.on("suckies-join", (lobbyData) => {
//     console.log("im joining the lobby! can you say lobby in spanish?");
//     console.log(lobbyData.code);

//     let lobby = new Lobby(lobbyData.code, lobbyData.password);
//     //convert player list into a player list
//     lobby.players = lobbyData.players.map(p => new Player(p.name, p.id, p.index));
//     lobby.printPlayers();

//     SceneManager.currentScene = LobbyScene;
// });