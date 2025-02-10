import { PongGame } from "./pong.js";

const game = new PongGame("canvas");

game.aiSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    game.gameView.rightPaddle.dy = data.action * game.gameView.rightPaddle.speed;
};

document.addEventListener("keydown", (event) => {
    game.setKeydownKey(event.key);
  });
  
  document.addEventListener("keyup", (event) => {
    game.setKeyupKey(event.key);
  });
  
