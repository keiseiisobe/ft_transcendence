"use strict";
import { View } from "./view.js";
import { Ball } from "../game/ball.js";
import { Paddle } from "../game/paddle.js";

export class GameView extends View {
  /** ボール */
  #ball;
  /** パドル */
  #leftPaddle;
  #rightPaddle;

  constructor(context) {
    super(context);

    // ボールを生成する
    this.#ball = new Ball(
      context, 
      this.context.canvas.width/2 -10, 
      this.context.canvas.height/2 -10, 
      3, -3, 20);
      // パドルを生成する
      this.#leftPaddle = new Paddle(context, 40, this.context.canvas.height/2 -50, 20, 100, 5);
      this.#rightPaddle = new Paddle(context, this.context.canvas.width -60, this.context.canvas.height/2 -50, 20, 100, 5);
      // this.#rightPaddle = new Paddle(context, this.context.canvas.width -60, 70, 20, 100, 5); //y=100の時にバグる
  }

  /** 更新する */
  update() {
    // ボールと壁の衝突を確認する
    this.#checkCollisionBallAndWall();
    // ボールとパドルの衝突を確認する
    this.#checkCollisionBallAndPaddle();
    // パドルと壁の衝突を確認する
    this.#checkCollisionPaddleAndWall();

    // ボールを移動する
    this.#ball.move();
    // パドルを移動する
    this.#leftPaddle.move();
    this.#rightPaddle.move();
  }

  /** 描画する */
  draw() {
    // ボールを描画する
    this.#ball.draw();

    // パドルを描画する
    this.#leftPaddle.draw();
    this.#rightPaddle.draw();
  }

  /** ボールと壁の衝突を確認する */
  #checkCollisionBallAndWall() {
    const canvasWidth = this.context.canvas.width;
    const canvasHeight = this.context.canvas.height;
    const ballX = this.#ball.x;
    const ballY = this.#ball.y;
    // const ballDx = this.#ball.dx;
    // const ballDy = this.#ball.dy;
    const ballSideLen = this.#ball.sideLength;

    if(ballY + ballSideLen >= canvasHeight || ballY < 0) {
      this.#ball.dy = -this.#ball.dy; //壁に当たった時の挙動
  } else if(ballX + ballSideLen >= canvasWidth) { //右player側の壁に当たった時
      // alert("PLAYER1 WIN!");
      // this.#ball = { x: canvasWidth/2, y: canvasHeight/2, dx: 5, dy: -5, sideLength: 20 };
      // document.location.reload();
      this.#ball.dx = -this.#ball.dx;
  } else if (ballX < 0) { //左player側の壁に当たった時
      // alert("PLAYER2 WIN!");
      // this.#ball = { x: canvasWidth/2, y: canvasHeight/2, dx: 5, dy: -5, sideLength: 20 };
      // document.location.reload();
      this.#ball.dx = -this.#ball.dx;
  }
  }
  
  /** ボールとパドルの衝突を確認する */
  #checkCollisionBallAndPaddle() {
    const ballX = this.#ball.x;
    const ballY = this.#ball.y;
    // const ballDx = this.#ball.dx;
    // const ballDy = this.#ball.dy;
    const ballSideLen = this.#ball.sideLength;
    const LpaddleX = this.#leftPaddle.x;
    const LpaddleY = this.#leftPaddle.y;
    const RpaddleX = this.#rightPaddle.x;
    const RpaddleY = this.#rightPaddle.y;
    const paddleWidth = this.#leftPaddle.width;
    const paddleHeight = this.#leftPaddle.height;

    // ボールとパドルが衝突したらボールの向きを反転する
    // 左パドルに当たった時
    if (LpaddleY <= ballY && 
      ballY <= LpaddleY + paddleHeight && 
      ballX <= LpaddleX + paddleWidth) {
      this.#ball.dx = -this.#ball.dx;
    }

    // 右パドルに当たった時
    if (RpaddleY <= ballY && 
      ballY <= RpaddleY + paddleHeight && 
      ballX + ballSideLen >= RpaddleX) {
      this.#ball.dx = -this.#ball.dx;
    }
  }

  /** プレイヤーのキーアクションを実行する */
  executePlayerAction(key) {
    if (key["w"]) {
      this.#leftPaddle.dy = -this.#leftPaddle.speed;
    } else if (key["s"]) {
      this.#leftPaddle.dy = this.#leftPaddle.speed;
    } else {
      this.#leftPaddle.dy = 0;
    }

    if (key["ArrowUp"] || key["Up"]) {
      this.#rightPaddle.dy = -this.#rightPaddle.speed;
    } else if (key["ArrowDown"] || key["Down"]) {
      this.#rightPaddle.dy = this.#rightPaddle.speed;
    } else {
      this.#rightPaddle.dy = 0;
    }
  }

  /** パドルと壁の衝突を確認する */
  #checkCollisionPaddleAndWall() {
    const LpaddleY = this.#leftPaddle.y;
    const LpaddleDy = this.#leftPaddle.dy;
    const paddleHeight = this.#leftPaddle.height;
    const RpaddleY = this.#rightPaddle.y;
    const RpaddleDy = this.#rightPaddle.dy;

    // 左パドルが上に衝突したらパドルの上に固定する
    if (LpaddleY + LpaddleDy < 0) {
      this.#leftPaddle.dy = 0;
      this.#leftPaddle.y = 0;
      return;
    }

    // 左パドルが下に衝突したらパドルを下に固定する
    if (this.context.canvas.height - paddleHeight < LpaddleY + LpaddleDy) {
      this.#leftPaddle.dy = 0;
      this.#leftPaddle.y = this.context.canvas.height - paddleHeight;
      return;
    }

    // 右パドルが上に衝突したらパドルの上に固定する
    if (RpaddleY + RpaddleDy < 0) {
      this.#rightPaddle.dy = 0;
      this.#rightPaddle.y = 0;
      return;
    }

    // 右パドルが下に衝突したらパドルを下に固定する
    if (this.context.canvas.height - paddleHeight < RpaddleY + RpaddleDy) {
      this.#rightPaddle.dy = 0;
      this.#rightPaddle.y = this.context.canvas.height - paddleHeight;
      return;
    }
  }
}