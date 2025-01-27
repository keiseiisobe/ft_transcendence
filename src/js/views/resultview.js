import { View } from "./view.js";

export class ResultView extends View {
  constructor(context) {
    super(context);
  }

  /** 描画する */
  draw() {
    // 結果を描画する
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "white";
    this.context.font = "24px sans-serif";
    this.context.fillText(
      "ゲームクリア",
      this.context.canvas.width / 2,
      this.context.canvas.height / 2
    );
  }
}