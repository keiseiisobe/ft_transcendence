import * as THREE from 'three'

export class PongMap
{
    constructor(canvas, options = {}) {
        const defaults = {
            aspectRatio: 900 / 582,
            depth: 0.2,
            paddleLengh: 0.16,
            ballSize: 0.2,
            camMoveMult: 0.2
        };
        options = { ...defaults, ...options };

        this.canvas = canvas
        this.aspectRatio = options.aspectRatio;
        this.depth = options.depth
        this.paddleLengh = options.paddleLengh
        this.ballSize = options.ballSize
        this.camMoveMult = options.camMoveMult
        
        this.planeW = 9.00
        this.planeH = this.planeW / this.aspectRatio 

        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xff0000)

        this.camera = new THREE.PerspectiveCamera(90, 1, 0.01, 1000);
        this.camera.position.z = 4;

        this.ballVelocity = new THREE.Vector2(0, 0)

        this.clock = new THREE.Clock()
        
        this.hasCollision = false
        this.collisions = {
            "v_wall_u": false,
            "v_wall_d": false,
            "h_wall_r": false,
            "h_wall_l": false,
            "paddle_l": false,
            "paddle_r": false,
            "right_wall": false,
            "left_wall": false
        }

        window.onresize = this.#updateSize.bind(this)
        this.#updateSize()

        this.#addObjects()

        this.pressedKeys = {};
        window.onkeyup = (e) => { this.pressedKeys[e.keyCode] = false; }
        window.onkeydown = (e) => { this.pressedKeys[e.keyCode] = true; }

        this.renderer.setAnimationLoop(this.#animate.bind(this));
    }

    #updateSize() {
        const width = this.canvas.scrollWidth;
        const height = this.canvas.scrollHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    #animate() {
        var dt = this.clock.getDelta()

        if (this.onUpdate_) {
            this.onUpdate_(this.pressedKeys, dt)
        }

        if (this.hasCollision && this.onCollision_) {
            this.onCollision_(this.collisions)
            this.hasCollision = false
            this.collisions = {
                "v_wall_u": false,
                "v_wall_d": false,
                "h_wall_r": false,
                "h_wall_l": false,
                "paddle_l": false,
                "paddle_r": false,
                "right_wall": false,
                "left_wall": false
            }
        }

        this.#setBallPosScreeSpace(this.ball.position.clone().add(this.ballVelocity.clone().multiplyScalar(dt)))

        this.renderer.render(this.scene, this.camera);
    } 

    #addObjects() {
        const planeGeo = new THREE.PlaneGeometry()
        const boxGeo = new THREE.BoxGeometry()

        const planeMat = new THREE.MeshStandardMaterial({color: 0x0, roughness: 0.2, metalness: 1})
        const blocksMat = new THREE.MeshStandardMaterial({ color: 0xffffff })

        const plane = new THREE.Mesh(planeGeo, planeMat)
        plane.matrixAutoUpdate = false
        plane.position.set(0, 0, -this.depth)
        plane.scale.set(this.planeW, this.planeH, 1)
        plane.updateMatrix()
        this.scene.add(plane)

        this.wallL = new THREE.Mesh(boxGeo, blocksMat)
        this.wallL.matrixAutoUpdate = false
        this.wallL.position.set(-(this.planeW / 2) - 1, 0, -this.depth / 2)
        this.wallL.scale.set(2, 2 + this.planeH + 2, this.depth)
        this.wallL.updateMatrix()
        this.scene.add(this.wallL)

        this.wallR = this.wallL.clone()
        this.wallR.position.set((this.planeW / 2) + 1, 0, -this.depth / 2)
        this.wallR.updateMatrix()
        this.scene.add(this.wallR)

        this.wallU = new THREE.Mesh(boxGeo, blocksMat)
        this.wallU.matrixAutoUpdate = false
        this.wallU.position.set(0, (this.planeH / 2) + 1, -this.depth / 2)
        this.wallU.scale.set(2 + this.planeW + 2, 2, this.depth)
        this.wallU.updateMatrix()
        this.scene.add(this.wallU)

        this.wallD = this.wallU.clone()
        this.wallD.position.set(0, -(this.planeH / 2) - 1, -this.depth / 2)
        this.wallD.updateMatrix()
        this.scene.add(this.wallD)

        this.ball = new THREE.Mesh(boxGeo, blocksMat)
        this.ball.position.set(0, 0, -this.depth + this.ballSize / 2)
        this.ball.scale.set(this.ballSize, this.ballSize, this.ballSize)
        this.scene.add(this.ball)

        this.paddleR = new THREE.Mesh(boxGeo, blocksMat)
        this.paddleR.position.set(this.planeW / 2 - 0.3, 0, -this.depth + this.ballSize / 2)
        this.paddleR.scale.set(0.2, this.planeH * this.paddleLengh, this.ballSize)
        this.scene.add(this.paddleR)

        this.paddleL = new THREE.Mesh(boxGeo, blocksMat)
        this.paddleL.position.set(-this.planeW / 2 + 0.3, 0, -this.depth + this.ballSize / 2)
        this.paddleL.scale.set(0.2, this.planeH * this.paddleLengh, this.ballSize)
        this.scene.add(this.paddleL)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(this.camera.position.x, this.camera.position.y, this.camera.position.z)
        this.scene.add(directionalLight)

        const poinLight = new THREE.PointLight(0xffffff, 1, 0, 0)
        poinLight.position.set(0, 0, this.depth - 2)
        this.scene.add(poinLight)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        this.scene.add(ambientLight)
    }
    
    #setBallPosScreeSpace(vec) {
        const ballNewPos = {
            x: vec.x - this.ball.scale.x / 2,
            y: vec.y - this.ball.scale.y / 2,
            w: this.ball.scale.x,
            h: this.ball.scale.y
        } 
        const checkedObj = [ this.wallL,  this.wallR, this.wallU,  this.wallD, this.paddleL, this.paddleR, ] 
        for (const i in checkedObj)
        {
            const collision = this.#testBallCollision(ballNewPos, checkedObj[i])
            if (collision.x < 0 || collision.y < 0) {
                switch (Number(i)) {
                    case 0:
                        this.collisions["left_wall"] = true
                        break;
                    case 1:
                        this.collisions["right_wall"] = true
                        break;
                    case 4:
                        this.collisions["paddle_l"] = true
                        break;
                    case 5:
                        this.collisions["paddle_r"] = true
                        break;
                    default:
                        break;
                }

                if (collision.x < 0 && (collision.y >= 0 || collision.x >= collision.y)) {
                    if (this.ballVelocity.x > 0) {
                        vec.x += collision.x
                        this.collisions["h_wall_r"] = true
                    }
                    else {
                        vec.x -= collision.x
                        this.collisions["h_wall_l"] = true
                    }
                    if (this.ballVelocity.y > 0)
                        vec.y -= Math.abs(this.ballVelocity.clone().normalize().y / this.ballVelocity.clone().normalize().x * collision.x)
                    else
                        vec.y += Math.abs(this.ballVelocity.clone().normalize().y / this.ballVelocity.clone().normalize().x * collision.x)
                }

                else if (collision.y < 0 && (collision.x >= 0 || collision.y >= collision.x)) {
                    if (this.ballVelocity.x > 0)
                        vec.x -= Math.abs(this.ballVelocity.clone().normalize().x / this.ballVelocity.clone().normalize().y * collision.y)
                    else
                        vec.x += Math.abs(this.ballVelocity.clone().normalize().x / this.ballVelocity.clone().normalize().y * collision.y)

                    if (this.ballVelocity.y > 0) {
                        vec.y += collision.y
                        this.collisions["v_wall_u"] = true
                    }
                    else {
                        vec.y -= collision.y
                        this.collisions["v_wall_d"] = true
                    }
                }
                this.hasCollision = true
                break;
            }
        }

        this.ball.position.set(
                Math.max(-(this.planeW / 2) + this.ballSize / 2, Math.min(vec.x, (this.planeW / 2) - this.ballSize / 2)),
                Math.max(-(this.planeH / 2) + this.ballSize / 2, Math.min(vec.y, (this.planeH / 2) - this.ballSize / 2)),
                this.ball.position.z
        )
        
        this.camera.position.set(
            -vec.x / (this.planeW / 2) * this.camMoveMult,
            -vec.y / (this.planeH / 2) * this.camMoveMult,
            this.camera.position.z
        )
        this.camera.lookAt(0, 0, 0)
    }

    setBallPos(x, y) {
        this.#setBallPosScreeSpace(new THREE.Vector2(
            x * (this.planeW / 2 - this.ballSize / 2),
            y * (this.planeH / 2 - this.ballSize / 2)
        ))
    }

    setBallVelocity(x, y) {
        this.ballVelocity.set(x, y)
    }

    get ballPos() {
        return {
            x: this.ball.position.x / (this.planeW / 2 - this.ballSize / 2),
            y: this.ball.position.y / (this.planeH / 2 - this.ballSize / 2)
        }
    }

    onUpdate(f) {
        this.onUpdate_ = f
    }

    #testBallCollision(ball, paddle_) {
        
        var paddle = {
            x: paddle_.position.x - paddle_.scale.x / 2,
            y: paddle_.position.y - paddle_.scale.y / 2,
            w: paddle_.scale.x,
            h: paddle_.scale.y
        } 
        var collision = new THREE.Vector2(0, 0)
        if(ball.x < paddle.x+paddle.w && ball.x+ball.w > paddle.x && ball.y < paddle.y+paddle.h && ball.y+ball.h > paddle.y) {
            if(this.ballVelocity.x > 0 && ball.x < paddle.x + paddle.w)
                collision.x = paddle.x - (ball.x + ball.w)
            if(this.ballVelocity.x < 0 && ball.x + ball.w > paddle.x)
                collision.x = ball.x - (paddle.x + paddle.w)
            if(this.ballVelocity.y > 0 && ball.y < paddle.y + paddle.h)
                collision.y = paddle.y - (ball.y + ball.h)
            if(this.ballVelocity.y < 0 && ball.y + ball.h > paddle.y)
                collision.y = ball.y - (paddle.y + paddle.h)
        }
        return collision
    }

    get ballVelo() {
        return {
            x: this.ballVelocity.x,
            y: this.ballVelocity.y
        }
    }

    onCollision(f) {
        this.onCollision_ = f
    }

    get leftPaddlePos() {
        return this.paddleL.position.y / (this.planeH / 2 - this.paddleL.scale.y / 2)
    }

    set leftPaddlePos(y) {
        this.paddleL.position.y = Math.max(-1, Math.min(y, 1)) * (this.planeH / 2 - this.paddleL.scale.y / 2)
    }
    
    get rightPaddlePos() {
        return this.paddleR.position.y / (this.planeH / 2 - this.paddleR.scale.y / 2)
    }

    set rightPaddlePos(y) {
        this.paddleR.position.y = Math.max(-1, Math.min(y, 1)) * (this.planeH / 2 - this.paddleR.scale.y / 2)
    }
}
