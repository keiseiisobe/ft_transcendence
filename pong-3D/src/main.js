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

const pongMap = new PongMap(document.getElementById("canvas"))

pongMap.middleText.text = "\n\n\nPress space to start"

var gameSate = 0
var side = Math.random() < 0.5 ? -1 : 1

pongMap.onUpdate((pressedKeys, _) => {

    if (gameSate === 0 && pressedKeys[32])
    {
        pongMap.ball.velocity = new Vector2(side, (Math.random() - 0.5)).normalize().multiplyScalar(2)
        pongMap.middleText.visible = false
        gameSate = 1
    }

    if (gameSate === 2 && (
        (pongMap.ball.velocity.x < 0 && pongMap.ball.position.x < 0) ||
        (pongMap.ball.velocity.x > 0 && pongMap.ball.position.x > 0) ||
        (pongMap.ball.velocity.y < 0 && pongMap.ball.position.y < 0) ||
        (pongMap.ball.velocity.y > 0 && pongMap.ball.position.y > 0)
    )) {
        pongMap.ball.position = new Vector2(0, 0)
        pongMap.ball.velocity = new Vector2(0, 0)
        pongMap.middleText.text = "\n\n\nPress space"
        pongMap.middleText.visible = true
        gameSate = 0
    }

    pongMap.paddleR.velocity = 0
    pongMap.paddleL.velocity = 0
    if (pressedKeys[69]) pongMap.paddleL.velocity += 1
    if (pressedKeys[68]) pongMap.paddleL.velocity -= 1
    if (pressedKeys[73]) pongMap.paddleR.velocity += 1
    if (pressedKeys[75]) pongMap.paddleR.velocity -= 1
});

pongMap.onCollision((normal, didHitWall) => {
    if (didHitWall && normal.x < 0) {
        pongMap.scores.scoreLeft += 1
        pongMap.ball.velocity = new Vector2(pongMap.ball.realPosition.x, pongMap.ball.realPosition.y).multiplyScalar(-10)
        side = -1
        gameSate = 2
        return
    }
    if (didHitWall && normal.x > 0) {
        pongMap.scores.scoreRight += 1
        pongMap.ball.velocity = new Vector2(pongMap.ball.realPosition.x, pongMap.ball.realPosition.y).multiplyScalar(-10)
        side = 1
        gameSate = 2
        return
    }
    var d = pongMap.ball.velocity.clone().normalize()
    var r = d.clone().sub(normal.clone().multiplyScalar(d.clone().dot(normal.clone()) * 2))
    pongMap.ball.velocity = r.multiplyScalar(2.4)
})
