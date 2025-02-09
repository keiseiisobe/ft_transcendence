class Score {
    /** 得点 */
    value = 0;
}

export class Scores {
    context;
    /** スコア */
    leftScore;
    rightScore;
  
    constructor(context) {
      this.context = context;
      this.leftScore = new Score();
      this.rightScore = new Score();
    }
  
    /** 描画する */
    draw() {
        this.context.fillStyle = "white";
        this.context.font = "80px Inter";
        this.context.fillText(this.leftScore.value.toString(), 350, 70);
        this.context.fillText(this.rightScore.value.toString(), 500, 70);
    }
  }