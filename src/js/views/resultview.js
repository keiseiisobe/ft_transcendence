"use strict";
import { View } from "./view.js";

export class ResultView extends View {
  constructor(context) {
    super(context);
  }

  /** 描画する */
  draw(resultMessage) {
    // 結果を描画する
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "red";
    this.context.font = "80px Inter";
    this.context.fillText(
      resultMessage,
      this.context.canvas.width / 2,
      170
    );

    this.context.fillStyle = "#D9D9D9";
    this.context.font = "24px Inter";
    this.context.fillText(
      "Back to Title",
      this.context.canvas.width / 2,
      this.context.canvas.height -100
    );
  }
}