import { Scene, Object, ImageObject, ButtonObject, TextObject, InputObject } from "../scene";
import { ctx, canvas, GameManager } from '../main.js';
import { io } from "socket.io-client";
import { SceneManager } from "../main.js";
import { Lobby } from "../Lobby.js";
import { Player } from "../Player.js";
import { k_socket } from "../socket.js";
import { LobbyScene } from "./lobbyScreen.js";


const codebox = new InputObject(() => [((canvas.width / 2) - 150) - 110, (325)], () => [150, 100], "g", false, 4);
const namebox = new InputObject(() => [((canvas.width / 2) - 150) - 200, (125)], () => [690, 100], "John", true, 15);
export const MultiplayerLobbiesScene = new Scene([new Object(() => [10, 10],
    function () {
        const [x, y] = this.position()
        ctx.fillStyle = "yellow";
        ctx.fillRect(x, y, canvas.width, canvas.height);
    },
    function () {
    }
),
new ButtonObject(() => [((canvas.width / 2) - 150) + 110, 300], () => [300, 150], function () {
    const [x, y] = this.position()
    const [w, h] = this.dimensions()
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, w, h);
    ctx.font = "80px Candela";
    ctx.fillStyle = "blue";
    ctx.textAlign = "center";
    ctx.fillText("Join", x + 150, 338);
}, function () {
    // typingCode = true;
    // console.log(typingCode);
    k_socket.emit("join-lobby", codebox.getInput(), namebox.getInput());
    //k_socket.emit("test", "if you can read this, the test worked  ");
}),

    codebox, namebox,

new ButtonObject(() => [((canvas.width / 2) - 200), 500], () => [400, 150], function () {
    const [x, y] = this.position()
    const [w, h] = this.dimensions()
    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, w, h);
}, function () {
    //k_socket.emit("test", "if you can read this, the test worked  ");
    console.log("creating lobby");
    k_socket.emit("create-lobby", namebox.getInput());

}),

]);

k_socket.on("suckies-join", (lobbyData) => {
    console.log("im joining the lobby! can you say lobby in spanish?");
    console.log(lobbyData.code);

    let lobby = new Lobby(lobbyData.code, lobbyData.password);
    //convert player list into a player list
    lobby.players = lobbyData.players.map(p => new Player(p.name, p.id, p.index));
    lobby.printPlayers();

    GameManager.index = lobbyData.index;
    GameManager.roomCode = lobbyData.code;
    GameManager.name = namebox.getInput();

    SceneManager.currentScene = LobbyScene;
});

k_socket.on('test-room', (msg) => {
    console.log("SECOND TEST: " + msg);
});
