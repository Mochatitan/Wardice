import { Scene, Object, ImageObject, ButtonObject, BackgroundObject } from "../scene";
import { ctx, canvas } from '../main.js';
import { SceneManager } from "../main.js";
import { MainScene } from "./mainScreen.js";

export const LoadingScene = new Scene([
    new BackgroundObject("lightgray"),
]);