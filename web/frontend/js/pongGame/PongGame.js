import { Vector2 } from "three";
import PongMap from "./PongMap"

export default class PongGame {
    constructor(canvas) {
        this.pongMap = new PongMap(canvas);
        this.pongMap.onUpdate(this.#onUpdate.bind(this));
        this.pongMap.onCollision(this.#onCollision.bind(this));
        this.idle()
        this.side = null
        this.lastAIUpdate = performance.now() - 1000;
	this.p1_ideal_y = 0;
	this.p2_ideal_y = 0;
    }

    idle() {
        this.pongMap.scores.visible = false;
        this.pongMap.middleText.visible = false;
        this.pongMap.ball.position = new Vector2(0, 0);
        this.pongMap.ball.velocity = new Vector2(0, 0);
        this.gameState = 0 // iddle
    }

    start_round(match) {
        this.pongMap.scores.scoreLeft = match.p1_score
        this.pongMap.scores.scoreRight = match.p2_score
        this.pongMap.middleText.text = "\n\n\nPress a space";
        this.pongMap.middleText.visible = true;
        this.pongMap.scores.visible = true

        this.p1_type = match.p1_type;
        this.p2_type = match.p2_type;
        
        if (this.p1_type === 2) { /* AI */
            // create socket connection with the backed
        }
        
        if (this.p2_type === 2) { /* AI */
            // create socket connection with the backed
        }

        const listener = (e) => {
            if (e.keyCode == 32) {
                this.pongMap.middleText.visible = false;
                if ((match.p1_score === 0 && match.p2_score === 0) || this.side == null)
                    this.side = Math.random() < 0.5 ? -1 : 1
                this.pongMap.ball.velocity = new Vector2(this.side, (Math.random() - 0.5)).normalize().multiplyScalar(2)
                this.gameState = 1 /*running*/
            } else {
                window.addEventListener("keydown", listener, { once: true })
            }
        }
        window.addEventListener("keydown", listener, { once: true })
    }

    onRoundEnd(f) {
        this._onRoundEnd = f;
    }

    clean() {
        this.pongMap.cleanUpScene();
    }

    // private:
    #onUpdate(pressedKeys, _) {
        if (this.gameState === 0 /*iddle*/) {
            return
        }

        this.pongMap.paddleR.velocity = 0;
        this.pongMap.paddleL.velocity = 0;
        if (this.gameState === 1 /*running*/) {
            const currentTime = performance.now();
            if (this.p1_type === 2) { /* AI */
                if (currentTime - this.lastAIUpdate >= 1000)
		    this.p1_ideal_y = this.#AIPredict("left");
                // update paddle velocity
		if (this.pongMap.paddleL.mesh.position.y + this.pongMap.options.paddleSize.y / 2 < this.p1_ideal_y)
		    this.pongMap.paddleL.velocity += 1;
		else if (this.pongMap.paddleL.mesh.position.y - this.pongMap.options.paddleSize.y / 2 > this.p1_ideal_y)
		    this.pongMap.paddleL.velocity -= 1;
            } else {
                if (pressedKeys[69]) this.pongMap.paddleL.velocity += 1;
                if (pressedKeys[68]) this.pongMap.paddleL.velocity -= 1;
            }
            
            if (this.p2_type === 2) { /* AI */
                if (currentTime - this.lastAIUpdate >= 1000)
		    this.p2_ideal_y = this.#AIPredict("right");
                // update paddle velocity
		if (this.pongMap.paddleR.mesh.position.y + this.pongMap.options.paddleSize.y / 2 < this.p2_ideal_y)
		    this.pongMap.paddleR.velocity += 1;
		else if (this.pongMap.paddleR.mesh.position.y - this.pongMap.options.paddleSize.y / 2 > this.p2_ideal_y)
		    this.pongMap.paddleR.velocity -= 1;
            } else {
                if (pressedKeys[73]) this.pongMap.paddleR.velocity += 1;
                if (pressedKeys[75]) this.pongMap.paddleR.velocity -= 1;
            }
            if (currentTime - this.lastAIUpdate >= 1000) {
                this.lastAIUpdate = currentTime;
            }
        }

        if (this.gameState === 2 || this.gameState === 3 /*resetting*/ && (
            (this.pongMap.ball.velocity.x < 0 && this.pongMap.ball.position.x < 0) ||
            (this.pongMap.ball.velocity.x > 0 && this.pongMap.ball.position.x > 0) ||
            (this.pongMap.ball.velocity.y < 0 && this.pongMap.ball.position.y < 0) ||
            (this.pongMap.ball.velocity.y > 0 && this.pongMap.ball.position.y > 0)))
        {
            const stateSave = this.gameState // idle will reset to 0
            this.idle()
            if (this._onRoundEnd) {
                if (stateSave === 2) { // left won
                    this._onRoundEnd({winner: 1})
                }
                else if ((stateSave === 3)) { // right won
                    this._onRoundEnd({winner: 2})
                }
            }
        }
    }

    #onCollision(normal, didHitWall) {
        if (didHitWall && normal.x < 0) {
            this.pongMap.scores.scoreLeft += 1;
            this.pongMap.ball.velocity = new Vector2(this.pongMap.ball.realPosition.x, this.pongMap.ball.realPosition.y).multiplyScalar(-10)
            this.gameState = 2 // resetting left win
            this.side = -1 // next side is right
            return;
        }
        if (didHitWall && normal.x > 0) {
            this.pongMap.scores.scoreRight += 1;
            this.pongMap.ball.velocity = new Vector2(this.pongMap.ball.realPosition.x, this.pongMap.ball.realPosition.y).multiplyScalar(-10)
            this.gameState = 3 // resetting right win
            this.side = 1 // next side is left
            return;
        }
        var d = this.pongMap.ball.velocity.clone().normalize();
        var r = d.clone().sub(normal.clone().multiplyScalar(d.clone().dot(normal.clone()) * 2));
        this.pongMap.ball.velocity = r.multiplyScalar(2.4);
    }

    #AIPredict(side) {
        const aiData = this.pongMap.getAIinputData(side);
	if (side === "right") {
	    if (aiData.ballDx < 0)
		return 0;
	    let ballX = aiData.ballX;
	    let ballY = aiData.ballY;
	    let ballDy = aiData.ballDy;
	    for (;ballX < aiData.paddleX;ballX += aiData.ballDx) {
		ballY += ballDy;
		const mapTop = this.pongMap.options.mapSize.y / 2;
		const mapButtom = -this.pongMap.options.mapSize.y / 2;
		if (ballY + this.pongMap.options.ballSize >= mapTop ||
		    ballY - this.pongMap.options.ballSize <= mapButtom)
		    ballDy *= -1;
	    }
	    return ballY;
	}
	else if (side === "left") {
	    if (aiData.ballDx > 0)
		return 0;
	    let ballX = aiData.ballX;
	    let ballY = aiData.ballY;
	    let ballDy = aiData.ballDy;
	    for (;ballX > aiData.paddleX;ballX += aiData.ballDx) {
		ballY += ballDy;
		const mapTop = this.pongMap.options.mapSize.y / 2;
		const mapButtom = -this.pongMap.options.mapSize.y / 2;
		if (ballY + this.pongMap.options.ballSize >= mapTop ||
		    ballY - this.pongMap.options.ballSize <= mapButtom)
		    ballDy *= -1;
	    }
	    return ballY;
	}
	return 0;
    }
}
