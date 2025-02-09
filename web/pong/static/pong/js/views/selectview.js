"use strict";
import { View } from "./view.js";

export class SelectView extends View {
  constructor(context) {
    super(context);
  }

  /** 描画する */
  draw() {
    // 結果を描画する
    this.context.textAlign = "center";
    this.context.textBaseline = "middle";
    this.context.fillStyle = "#D9D9D9";
    this.context.font = "60px Inter";
    this.context.fillText(
        "with computer",
        this.context.canvas.width / 2,
        180
    );

    this.context.fillText(
        "with peer",
        this.context.canvas.width / 2,
        300
    );

    this.context.fillText(
        "tournament",
        this.context.canvas.width / 2,
        420
      );
  }
}