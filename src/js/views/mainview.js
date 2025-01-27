import { View } from "./view.js";

export class MainView extends View {
  constructor(context) {
    super(context);
  }

  /** 描画する */
  draw() {
    // メッセージを描画する
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "#FF0303";
    this.context.font = "20px Inter";
    this.context.fillText(
      "Press Enter",
      this.context.canvas.width / 2,
      this.context.canvas.height - 100
    );

    // 背景を描画する
    // スコア
    this.context.textAlign = "start";
    this.context.fillStyle = "white";
    this.context.font = "80px Inter";
    this.context.fillText("2", 350, 70);
    this.context.fillText("0", 500, 70);

    // ゲーム
    this.context.fillStyle = "#D9D9D9";
    this.context.fillRect(40, 60, 20, 100);
    this.context.fillRect(canvas.width - 60, canvas.height - 160, 20, 100);
    this.context.fillRect(710, 410, 20, 20);
  }
}