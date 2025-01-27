import { View } from "./view.js";

export class GameView extends View {
  constructor(context) {
    super(context);
  }

  /** 更新する */
  update() {}

  /** 描画する */
  draw() {
    // 仮のパドルを描画する
    this.context.beginPath();
    this.context.beginPath();
    this.context.fillStyle = '#D9D9D9';
    // this.context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    // this.context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    this.context.fillRect(40, this.context.canvas.height /2 -50, 20, 100);
    this.context.fillRect(this.context.canvas.width -60, this.context.canvas.height /2 -50, 20, 100);
    this.context.closePath();
    this.context.closePath();
  }
}