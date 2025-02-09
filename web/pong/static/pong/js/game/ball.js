export class Ball {
    context;
    /** x座標 */
    x;
    /** y座標 */
    y;
    /** x軸の移動速度 */
    dx;
    /** y軸の移動速度 */
    dy;
    /** 一辺の長さ */
    sideLength;
  
    constructor(context, x, y, dx, dy,sideLength) {
      this.context = context;
      this.x = x;
      this.y = y;
      this.dx = dx;
      this.dy = dy;
      this.sideLength = sideLength;
    }
  
    /** 移動する */
    move() {
        // ボールの座標を更新する
        this.x += this.dx;
        this.y += this.dy;
    }
  
    /** 描画する */
    draw() {
        this.context.beginPath();
        this.context.fillStyle = '#D9D9D9';
        this.context.fillRect(this.x, this.y, this.sideLength, this.sideLength);
        this.context.closePath();
    }
  }