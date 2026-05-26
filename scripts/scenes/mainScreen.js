import { Scene, Object, ImageObject, ButtonObject, TextObject } from "../scene";
import { ctx, canvas } from '../main.js';
import { MultiplayerLobbiesScene } from "./multiplayerlobbies.js";
import { SceneManager } from "../main.js";
import { singleplayerGameScene } from "./singleplayerGameScene.js";
import { k_socket } from "../socket.js";

export const MainScene = new Scene([new Object(() => [10, 10],
    function () {
        const [x, y] = this.position()
        ctx.fillStyle = "yellow";
        ctx.fillRect(x, y, canvas.width, canvas.height);
    },
    function () { }
),
new ButtonObject(() => [(canvas.width / 2) - 150, canvas.height / 2], () => [300, 100], function () {
    const [x, y] = this.position()
    const [w, h] = this.dimensions()
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, w, h);
    ctx.font = "40px Candela";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("Ping", x+(w/2), y+(h/2));
    /*
                ctx.font = "80px Candela";
            ctx.textAlign = textCentering;
            const [x, y] = this.position();
            ctx.fillText(textFunction, x, y);
            */
}, function () {
    // SceneManager.currentScene = singleplayerGameScene;
    k_socket.emit("ping");
}),
new ButtonObject(() => [(canvas.width / 2) - 200, (canvas.height / 2) + 150], () => [400, 100], function () {
    const [x, y] = this.position()
    const [w, h] = this.dimensions()
    ctx.fillStyle = "blue";
    ctx.fillRect(x, y, w, h);
    ctx.font = "60px Candela";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText("Multiplayer", x+(w/2), y+(h/2)+10);
    /*
                ctx.font = "80px Candela";
            ctx.textAlign = textCentering;
            const [x, y] = this.position();
            ctx.fillText(textFunction, x, y);
            */
}, function () {
    SceneManager.currentScene = MultiplayerLobbiesScene;
}),
new TextObject(()=>{return "WARDICE";}, () => [((canvas.width / 2)), (300)], () => [100, 100]),
]);


k_socket.on("ping", ()=>{
console.log("pong");
});