import { MainView } from "./views/mainview.js";
// import { GameView } from "./views/gameview.js";
// import { ResultView } from "./views/resultview.js";

export class PongGame {
  #canvas;
  #context;
  /** 画面に表示するビューの名前 */
  #viewname = "";
  /** メイン画面 */
  #mainView = null;
  /** ゲーム画面 */
  #gameView = null;
  /** 結果画面 */
  #resultView = null;

  constructor(canvasId) {
    this.#canvas = document.getElementById(canvasId);
    if (this.#canvas === null) {
      throw new Error("canvas要素が取得できません");
    }
    this.#context = this.#canvas.getContext("2d");

    this.#mainView = new MainView(this.#context);
    // this.#gameView = new GameView(this.#context);
    // this.#resultView = new ResultView(this.#context);
    this.#mainView.draw();
  }
}