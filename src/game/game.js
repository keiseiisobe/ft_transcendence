let canvas = document.getElementById("pong-game");
let ctx = canvas.getContext("2d");

let ball = { x: canvas.width/2, y: canvas.height/2, dx: 5, dy: -5, sideLength: 20 };
let leftPaddle = { x: 40, y: canvas.height/2 -50, width: 20, height: 100 }; //50, 150, 10, 100
let rightPaddle = { x: canvas.width -60, y: canvas.height/2 -50, width: 20, height: 100 }; //740, 150, 10, 100

let wPressed = false;
let sPressed = false;
let upPressed = false;
let downPressed = false;

let intervalId; 

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === "w") {
        wPressed = true;
    }
    else if (e.key === "s") {
        sPressed = true;
    }
    else if (e.key === "ArrowUp") {
        upPressed = true;
    }
    else if (e.key === "ArrowDown") {
        downPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "w") {
        wPressed = false;
    }
    else if (e.key === "s") {
        sPressed = false;
    }
    else if (e.key === "ArrowUp") {
        upPressed = false;
    }
    else if (e.key === "ArrowDown") {
        downPressed = false;
    }
}

function drawBackground() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawBall() {
    ctx.fillStyle = '#D9D9D9';
    ctx.beginPath();
    // ctx.arc(ball.x, ball.y, ball.sideLength, 0, Math.PI*2); //円の時
    // ctx.fill();
    ctx.fillRect(ball.x -10, ball.y -10, 20, 20);
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.fillStyle = '#D9D9D9';
    ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
    ctx.closePath();
}

function draw() {
    intervalId = setInterval(draw, 10); //画面を動かす
    ball.x += ball.dx * 0.01;
    ball.y += ball.dy * 0.01; //ballの動き

    if(ball.y + ball.sideLength >= canvas.height || ball.y < 0) {
        ball.dy = -ball.dy; //壁に当たった時の挙動
    } else if(ball.x + ball.sideLength >= canvas.width) { //右player側の壁に当たった時
        alert("PLAYER1 WIN!");
        ball = { x: canvas.width/2, y: canvas.height/2, dx: 5, dy: -5, sideLength: 20 };
        document.location.reload();
    } else if (ball.x < 0) { //左player側の壁に当たった時
        alert("PLAYER2 WIN!");
        ball = { x: canvas.width/2, y: canvas.height/2, dx: 5, dy: -5, sideLength: 20 };
        document.location.reload();
    }

    // 左パドルに当たった時
    if (leftPaddle.y <= ball.y && 
        ball.y <= leftPaddle.y + leftPaddle.height && 
        ball.x <= leftPaddle.x + leftPaddle.width) {
        ball.dx = -ball.dx;
    }

    // 右パドルに当たった時
    if (rightPaddle.y <= ball.y && 
        ball.y <= rightPaddle.y + rightPaddle.height && 
        ball.x + ball.sideLength >= rightPaddle.x) {
        ball.dx = -ball.dx;
    }

    // 左パドルを動かす
    if(wPressed && leftPaddle.y > 0) { 
        leftPaddle.y -= 0.2;
    } else if(sPressed && leftPaddle.y < canvas.height - leftPaddle.height) {
        leftPaddle.y += 0.2;
    }
    // 右パドルを動かす
    if(upPressed && rightPaddle.y > 0) {
        rightPaddle.y -= 0.2;
    } else if(downPressed && rightPaddle.y < canvas.height - rightPaddle.height) {
        rightPaddle.y += 0.2;
    }

    // 画面をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ゲーム要素を描画
    drawBackground();
    drawBall();
    drawPaddle();
}
