import { ctx, canvas } from './main.js';

const EMPTY = function () { };

class Scene {
    constructor(objects = [], settings = {}, draw = EMPTY, update = EMPTY) {
        this.objects = objects;
        for (let o of this.objects) {
            o.parentScene = this;
        }
        this.onDraw = draw;
        this.onUpdate = update;
        this.settings = settings;
        settings.background = settings.background ?? "white";
        this.data = {};
    }

    draw() {
        ctx.fillStyle = this.settings.background;
        //ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let o of this.objects) {
            o.draw();
        }
        this.onDraw();
    }

    update(elapsed) {
        this.onUpdate(elapsed);
        for (let o of this.objects) {
            o.update(elapsed);
        }
    }

    handleClick(mx, my) {
        for (let o of this.objects) {
            if (o.handleClick) { o.handleClick(mx, my) }
        }
    }

    addObject(object) {
        this.objects.push(object);
    }
}

class Object {
    constructor(pos, draw = EMPTY, update = EMPTY) {
        this.position = pos
        this.onDraw = draw;
        this.onUpdate = update;
        this.data = {};
    }

    draw() {
        this.onDraw();
    }

    update(elapsed) {
        this.onUpdate(elapsed);
    }

}

class ImageObject extends Object {
    constructor(pos, path, update = EMPTY) {
        super(pos, function () {
            const [x, y] = this.position()
            ctx.drawImage(this.image, x, y);
        }, update)
        this.image = new Image();
        this.image.src = "/img/" + path;
    }
}

class DiceObject extends Object {
    constructor(getNumber, pos, size, update = EMPTY,) {
        super(pos, function () {
            if (getNumber() == 6894) { return; }
            if (getNumber() == 3506) {
                const [x, y] = this.position();
                ctx.fillStyle = "gray";
                ctx.fillRect(x, y, size, size);
                ctx.lineWidth = 5;
                ctx.strokeStyle = "black";
                ctx.strokeRect(x, y, size, size);
                return;
            }
            const [x, y] = this.position();
            ctx.fillStyle = "white";
            ctx.fillRect(x, y, size, size);
            ctx.lineWidth = 5;
            ctx.strokeStyle = "black";
            ctx.strokeRect(x, y, size, size);
            ctx.fillStyle = "black";
            ctx.lineWidth = 2;
            let diceradius = size / 2;
            let cx = x + diceradius;
            let cy = y + diceradius; //center x and y
            let mlkjr = diceradius * (4 / 9);
            let mlk = diceradius * (5 / 9);
            this.oneDiceImage = new Image();
            switch (getNumber()) {
                case 1:
                    ctx.beginPath();
                    ctx.arc(cx, cy, diceradius / 4, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/One.png";

                    break;
                case 2:
                    ctx.beginPath();
                    ctx.arc(cx + mlkjr, cy - mlkjr, diceradius / 4, 0, 2 * Math.PI);
                    ctx.arc(cx - mlkjr, cy + mlkjr, diceradius / 4, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/Two.png";
                    break;
                case 3:
                    ctx.beginPath();
                    ctx.arc(cx - mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx, cy, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx + mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/Three.png";
                    break;
                case 4:
                    ctx.beginPath();
                    ctx.arc(cx + mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx + mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(cx - mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx - mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/Four.png";
                    break;
                case 5:
                    ctx.beginPath();
                    ctx.arc(cx + mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx + mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(cx - mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx - mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(cx, cy, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/Five.png";
                    break;
                case 6:
                    ctx.beginPath();
                    ctx.arc(cx + mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx + mlk, cy, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx + mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(cx - mlk, cy + mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx - mlk, cy - mlk, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.arc(cx - mlk, cy, diceradius / 4.5, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/Six.png";

                    break;
                case 6894:
                    this.oneDiceImage.src = "/img/dice/Blank.png";
                    break;

                default:
                    ctx.beginPath();
                    ctx.arc(x + diceradius, y + diceradius, diceradius / 1.2, 0, 2 * Math.PI);
                    ctx.fill();
                    this.oneDiceImage.src = "/img/dice/Unknown.png";
            }

            ctx.drawImage(this.oneDiceImage, x, y, size, size);

        }, update);
    }

    setDice(newValue) {
        this.diceValue = newValue;
        this.draw();
    }
}



class ButtonObject extends Object {
    constructor(pos, dimensions, draw = EMPTY, click = EMPTY, update = EMPTY) {
        super(pos, draw, update)
        this.dimensions = dimensions
        this.onClick = click
    }
    handleClick(mx, my) {
        const [x, y] = this.position()
        const [w, h] = this.dimensions()
        if (mx > x && mx < x + w && my > y && my < y + h) {
            this.click()
        }
    }
    click() {
        this.onClick()
    }
}
class BackgroundObject extends Object {
    constructor(color) {
        super(() => [0, 0], function () {
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }
}

class TextObject extends Object {
    constructor(textFunction, pos, dimensions, textCentering = "center", update = EMPTY) {
        super(pos, function () {
            ctx.font = "80px Candela";
            ctx.textAlign = textCentering;
            const [x, y] = this.position();
            ctx.fillText(textFunction(), x, y);
        }, update);
    }
}

class InputObject extends Object {
    #inputElement;

    constructor(pos, dimensions, text, allowSpaces, maxDigits, update = EMPTY) {
        super(pos, function () {


            ctx.font = "80px Candela";
            ctx.textBaseline = "hanging"
            const [x, y] = this.position();
            const [w, h] = this.dimensions()
            ctx.textAlign = "left";
            ctx.fillStyle = "gray";
            ctx.fillRect(x - 15, y - 5, w + 30, h + 10);
            ctx.fillStyle = "red";
            ctx.fillText(this.text, x, y);
        }, update)
        this.maxDigits = maxDigits;
        this.allowSpaces = allowSpaces;
        this.dimensions = dimensions;
        this.text = text;
        this.selected = false;
    }
    handleClick(mx, my) {
        const [x, y] = this.position();
        const [w, h] = this.dimensions();
        if (mx > x && mx < x + w && my > y && my < y + h) {
            this.selected = true;
            if (!this.#inputElement) {
                this.#inputElement = document.createElement("input");
                this.#inputElement.style = `opacity: 0;
                    left: ${x * (innerWidth / canvas.width)}px;
                    top: ${y * (innerHeight / canvas.height)}px;
                    width: ${w * (innerWidth / canvas.width)}px;
                    height: ${h * (innerHeight / canvas.height)}px;`;
                this.#inputElement.value = this.text;
                const input = (e) => {
                    let value = e.target.value.slice(0, this.maxDigits);
                    if (!this.allowSpaces) {
                        value = value.replace(/\s/g, ""); // Remove spaces
                    }
                    e.target.value = value;
                    this.text = value;
                }
                this.#inputElement.oninput = input;
                this.#inputElement.onkeydown = input;
                this.#inputElement.onblur = (e) => {
                    this.selected = false;
                    this.#inputElement.remove();
                    this.#inputElement = null;
                }
                document.body.append(this.#inputElement);
                this.#inputElement.focus();
            }
        }

    }
    getInput() {
        return this.text;
    }
}

export { Scene, Object, ImageObject, ButtonObject, TextObject, InputObject, DiceObject, BackgroundObject }
