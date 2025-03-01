import { Vector2 } from "three"
import { TextObj } from "./text"

export class ScoreText {
    constructor(options, fontSize, scene, fontPath) {
        this.options = options
        this.leftMesh = new TextObj(options, fontSize, scene, fontPath, "0", new Vector2(-options.scoreSpacing / 2, 0.9))
        this.rightMesh = new TextObj(options, fontSize, scene, fontPath, "0", new Vector2(options.scoreSpacing / 2, 0.9))
    }

    get scoreLeft() {
        return this._scoreLeft ? this._scoreLeft : 0
    }

    set scoreLeft(s) {
        this._scoreLeft = Number(s) % 10
        this.leftMesh.text = String(this._scoreLeft)
    }

    get scoreRight() {
        return this._scoreRight ? this._scoreRight : 0
    }

    set scoreRight(s) {
        this._scoreRight = Number(s) % 10
        this.rightMesh.text = String(this._scoreRight)
    }

    get visible() {
        return this.leftMesh.visible
    }

    set visible(v) {
        this.leftMesh.visible = v
        this.rightMesh.visible = v
    }
}
