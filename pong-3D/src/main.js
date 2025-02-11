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
  
import { PongMap } from "./threeD/PongMap.js"

const pongMap = new PongMap(document.getElementById("canvas"), {})

pongMap.onUpdate((pressedKeys, dt) => {
    const speed = 2
    if (pressedKeys[38]) pongMap.setBallVelocity(pongMap.ballVelo.x, speed)
    if (pressedKeys[40]) pongMap.setBallVelocity(pongMap.ballVelo.x, -speed);
    if (pressedKeys[37]) pongMap.setBallVelocity(-speed, pongMap.ballVelo.y);
    if (pressedKeys[39]) pongMap.setBallVelocity(speed, pongMap.ballVelo.y);
});

pongMap.onCollision((collisions) => {
    console.log(collisions)
    pongMap.setBallVelocity(0, 0)
    pongMap.setBallPos(0, 0)
})
