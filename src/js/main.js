import { PongGame } from "./pong.js";

const game = new PongGame("canvas");

document.addEventListener("keydown", (event) => {
    game.setKeydownKey(event.key);
  });
  
  document.addEventListener("keyup", (event) => {
    game.setKeyupKey(event.key);
  });
  