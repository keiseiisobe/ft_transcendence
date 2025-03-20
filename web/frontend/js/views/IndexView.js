import Cookies from "js-cookie"
import ViewBase from "./ViewBase"

import { Vector2 } from "three";
import { PongMap } from "../threeD/PongMap.js"

import helvetiker from "../../font/helvetiker_regular.json?url"
import pong_score from "../../font/pong_score_regular.json?url"

class PongGame {
    constructor(canvas, fontPaths) {
        this.pongMap = new PongMap(canvas, fontPaths)

        this.pongMap.middleText.text = "\n\n\nPress space to start"

        this.gameState = 0
        this.side = Math.random() < 0.5 ? -1 : 1

        this.pongMap.onUpdate((pressedKeys, _) => {
            if (this.gameState === 0 && pressedKeys[32]) {
                this.pongMap.ball.velocity = new Vector2(this.side, (Math.random() - 0.5)).normalize().multiplyScalar(2)
                this.pongMap.middleText.visible = false
                this.gameState = 1
            }

            if (this.gameState === 2 && (
                (this.pongMap.ball.velocity.x < 0 && this.pongMap.ball.position.x < 0) ||
                (this.pongMap.ball.velocity.x > 0 && this.pongMap.ball.position.x > 0) ||
                (this.pongMap.ball.velocity.y < 0 && this.pongMap.ball.position.y < 0) ||
                (this.pongMap.ball.velocity.y > 0 && this.pongMap.ball.position.y > 0)
            )) {
                this.pongMap.ball.position = new Vector2(0, 0)
                this.pongMap.ball.velocity = new Vector2(0, 0)
                if (this._onScoreChange) {
                    this._onScoreChange(this.pongMap.scores.scoreLeft, this.pongMap.scores.scoreRight)
                }
                if (this.gameState === 2) {
                    this.pongMap.middleText.text = "\n\n\nPress space"
                    this.pongMap.middleText.visible = true
                    this.gameState = 0
                }
            }

            if (this.gameState === 3 && pressedKeys[32]) {
                this.pongMap.scores.scoreLeft = 0
                this.pongMap.scores.scoreRight = 0
                this.pongMap.middleText.text = "\n\n\nPress space"
                this.pongMap.middleText.visible = true
                this.gameState = 0
            }

            this.pongMap.paddleR.velocity = 0
            this.pongMap.paddleL.velocity = 0
            if (pressedKeys[69]) this.pongMap.paddleL.velocity += 1
            if (pressedKeys[68]) this.pongMap.paddleL.velocity -= 1
            if (pressedKeys[73]) this.pongMap.paddleR.velocity += 1
            if (pressedKeys[75]) this.pongMap.paddleR.velocity -= 1
        });

        this.pongMap.onCollision((normal, didHitWall) => {
            if (didHitWall && normal.x < 0) {
                this.pongMap.scores.scoreLeft += 1
                this.pongMap.ball.velocity = new Vector2(this.pongMap.ball.realPosition.x, this.pongMap.ball.realPosition.y).multiplyScalar(-10)
                this.side = -1
                this.gameState = 2
                return
            }
            if (didHitWall && normal.x > 0) {
                this.pongMap.scores.scoreRight += 1
                this.pongMap.ball.velocity = new Vector2(this.pongMap.ball.realPosition.x, this.pongMap.ball.realPosition.y).multiplyScalar(-10)
                this.side = 1
                this.gameState = 2
                return
            }
            var d = this.pongMap.ball.velocity.clone().normalize()
            var r = d.clone().sub(normal.clone().multiplyScalar(d.clone().dot(normal.clone()) * 2))
            this.pongMap.ball.velocity = r.multiplyScalar(2.4)
        })
    }

    onScoreChange(f) {
        this._onScoreChange = f
    }

    setScore(l, r) {
        this.pongMap.scores.scoreLeft = l
        this.pongMap.scores.scoreRight = r
    }

    leftWin() {
        this.pongMap.middleText.text = "Player1 won!\n Press space"
        this.pongMap.middleText.visible = true
        this.gameState = 3
    }
 
    rightWin() {
        this.pongMap.middleText.text = "Player2 won!\n Press space"
        this.pongMap.middleText.visible = true
        this.gameState = 3
    }

    clean() {
        this.pongMap.cleanUpScene()
    }
}

export default class extends ViewBase {
    constructor() {
        super("/pong", "/pong/ssr/index")
    }

    async render() {
        var res = await super.render()
        if (res == 0) {
            console.log("Index view rendered")
            if (this.modal)
                return await this.modal.render(false)
            return 0 // did render normaly
        } else {
            return res
        }
    }

    async init() {
        await super.init()
        try {
            this.#pongGame = new PongGame($("#canvas").get(0), {
                helvetica: helvetiker,
                pong: pong_score
            })

            this.#pongGame.onScoreChange((l, r) => {
                if (l >= 3) {
                    this.gameover("peer", l, r, 1);
                    this.#pongGame.leftWin()
                }
                if (r >= 3) {
                    this.gameover("computer", l, r, 0);
                    this.#pongGame.rightWin()
                }
            })
        } catch (error) {
            console.error(error)
        }
        console.log("Index view initialized")
        if (this.modal)
            await this.modal.init()
    }

    clean() {
        super.clean()
        if (this.#pongGame)
            this.#pongGame.clean()
        console.log("Index view cleaned")
    }

    async gameover(opponent, score_user, score_opponent, result) {
        const url = window.location.origin + "/pong/gameover/";
        const formData = new FormData();
        formData.append("opponent", opponent);
        formData.append("score_user", score_user);
        formData.append("score_opponent", score_opponent);
        formData.append("result", result);
        try {
            const promise = await fetch(url, {
                method: "POST",
                headers: { "X-CSRFToken": Cookies.get("csrftoken") },
                body: formData
            })
            if (!promise.ok)
                throw promise
        } catch (error) {
            console.error(error)
        }
}
// private:
    #pongGame
}
