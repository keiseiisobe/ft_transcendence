export class Paddle {
    context;
    /** x軸 */
    x;
    /** y軸 */
    y;
    /** 幅 */
    width;
    /** 高さ */
    height;
    /** y軸の移動速度 */ //0→移動なし +→上 -→下
    dy = 0;
    /** 移動速度 */
    speed;
  
    constructor(context, x, y, width, height, speed) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.speed = speed;
    }
  
    /** 移動する */
    move() {
        // パドルの座標を更新する
        this.y += this.dy;
	this.dy = 0;
    }
  
    /** 描画する */
    draw() {
        // パドルを描画する
        this.context.beginPath();
        this.context.rect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = "#D9D9D9";
        this.context.fill();
        this.context.closePath();
    }
  }
