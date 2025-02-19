// import { PongGame } from "./pong.js";
// 
// const game = new PongGame("canvas");
// 
// document.addEventListener("keydown", (event) => {
//     game.setKeydownKey(event.key);
//   });
//   
//   document.addEventListener("keyup", (event) => {
//     game.setKeyupKey(event.key);
//   });
  
import { Vector2 } from "three";
import { PongMap } from "./threeD/PongMap.js"

export class PongGame {
    constructor(canvas, fontPaths) {
        this.pongMap = new PongMap(canvas, fontPaths)

        this.pongMap.middleText.text = "\n\n\nPress space to start"

        this.gameSate = 0
        this.side = Math.random() < 0.5 ? -1 : 1

        this.pongMap.onUpdate((pressedKeys, _) => {
            if (this.gameSate === 0 && pressedKeys[32]) {
                this.pongMap.ball.velocity = new Vector2(this.side, (Math.random() - 0.5)).normalize().multiplyScalar(2)
                this.pongMap.middleText.visible = false
                this.gameSate = 1
            }

            if (this.gameSate === 2 && (
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
                if (this.gameSate === 2) {
                    this.pongMap.middleText.text = "\n\n\nPress space"
                    this.pongMap.middleText.visible = true
                    this.gameSate = 0
                }
            }

            if (this.gameSate === 3 && pressedKeys[32]) {
                this.pongMap.scores.scoreLeft = 0
                this.pongMap.scores.scoreRight = 0
                this.pongMap.middleText.text = "\n\n\nPress space"
                this.pongMap.middleText.visible = true
                this.gameSate = 0
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
                this.gameSate = 2
                return
            }
            if (didHitWall && normal.x > 0) {
                this.pongMap.scores.scoreRight += 1
                this.pongMap.ball.velocity = new Vector2(this.pongMap.ball.realPosition.x, this.pongMap.ball.realPosition.y).multiplyScalar(-10)
                this.side = 1
                this.gameSate = 2
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
        this.gameSate = 3
    }
 
    rightWin() {
        this.pongMap.middleText.text = "Player2 won!\n Press space"
        this.pongMap.middleText.visible = true
        this.gameSate = 3
    }
}

