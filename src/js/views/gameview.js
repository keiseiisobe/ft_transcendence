"use strict";
import { View } from "./view.js";
import { Ball } from "../game/ball.js";

export class GameView extends View {
  /** ボール */
  #ball;


  constructor(context) {
    super(context);

    // ボールを生成する
    this.#ball = new Ball(
      context, 
      this.context.canvas.width/2 -10, 
      this.context.canvas.height/2 -10, 
      3, -3, 20);
  }

  /** ボールと壁の衝突を確認する */
  #checkCollisionBallAndWall() {
    const canvasWidth = this.context.canvas.width;
    const canvasHeight = this.context.canvas.height;
    // const ballX = this.#ball.x;
    // const ballY = this.#ball.y;
    // const ballDx = this.#ball.dx;
    // const ballDy = this.#ball.dy;
    const ballSideLen = this.#ball.sideLength;

    if(this.#ball.y + ballSideLen >= canvasHeight || this.#ball.y < 0) {
      this.#ball.dy = -this.#ball.dy; //壁に当たった時の挙動
  } else if(this.#ball.x + ballSideLen >= canvasWidth) { //右player側の壁に当たった時
      // alert("PLAYER1 WIN!");
      // this.#ball = { x: canvasWidth/2, y: canvasHeight/2, dx: 5, dy: -5, sideLength: 20 };
      // document.location.reload();
      this.#ball.dx = -this.#ball.dx;
  } else if (this.#ball.x < 0) { //左player側の壁に当たった時
      // alert("PLAYER2 WIN!");
      // this.#ball = { x: canvasWidth/2, y: canvasHeight/2, dx: 5, dy: -5, sideLength: 20 };
      // document.location.reload();
      this.#ball.dx = -this.#ball.dx;
  }
  }

  /** 更新する */
  update() {
    // ボールと壁の衝突を確認する
    this.#checkCollisionBallAndWall();
    // ボールを移動する
    this.#ball.move();
  }

  /** 描画する */
  draw() {
    // // 仮のパドルを描画する
    // this.context.beginPath();
    // this.context.beginPath();
    // this.context.fillStyle = '#D9D9D9';
    // // this.context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    // // this.context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    // this.context.fillRect(40, this.context.canvas.height /2 -50, 20, 100);
    // this.context.fillRect(this.context.canvas.width -60, this.context.canvas.height /2 -50, 20, 100);
    // this.context.closePath();
    // this.context.closePath();

    // ボールを描画する
    this.#ball.draw();
  }
  
}