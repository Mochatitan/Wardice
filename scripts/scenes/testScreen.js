import { Scene, Object, ImageObject, ButtonObject, TextObject } from "../scene";
import { ctx, canvas } from '../main.js';
import { MultiplayerLobbiesScene } from "./multiplayerlobbies.js";
import { SceneManager } from "../main.js";
import { singleplayerGameScene } from "./singleplayerGameScene.js";
import { k_socket } from "../socket.js";
import { DiceObject } from "../scene";

export const TestScene = new Scene([
    new ImageObject(() => [20, 20], "test.png"),
    new ImageObject(() => [1200, 200], "/dice/One.png"),
    new DiceObject(() => { return 1; }, () => [850, 620], 100, () => { }),
]);