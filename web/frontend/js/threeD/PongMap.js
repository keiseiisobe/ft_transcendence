import * as THREE from 'three'
import { Paddle } from './paddle';
import { Ball } from './ball';
import { Camera } from './camera';
import { TextObj } from './text';
import { ScoreText } from './scoreText';

export class PongMap
{
    constructor(canvas, fontPaths) {
        this.options = {
            canvas: canvas,
            mapSize: new THREE.Vector2(9.0, 6.0),
            depth: 0.2,
            distancePaddleFromWall: 0.2,
            cameraFOV: 90,
            cameraDistance: 3.5,
            paddleSize: new THREE.Vector2(0.2, 0.9),
            ballSize: 0.2,
            cameraMoveMult: 0.07,
            textDepth: 0.1,
            scoreSpacing: 0.2
        };

        this.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xffffff)

        this.#addStaticObjects()

        this.camera = new Camera(this.options)
        this.ball = new Ball(this.options, this.scene)
        this.paddleL = new Paddle(this.options, this.scene, -(this.options.mapSize.x / 2 - this.options.distancePaddleFromWall))
        this.paddleR = new Paddle(this.options, this.scene,  (this.options.mapSize.x / 2 - this.options.distancePaddleFromWall))
        this.middleText = new TextObj(
            this.options,
            0.5,
            this.scene,
            fontPaths.helvetica,
            "hello world",
            new THREE.Vector2(0, 0))
        this.scores = new ScoreText(this.options, 0.5, this.scene, fontPaths.pong)

        this.clock = new THREE.Clock()
        
        window.onresize = this.#updateSize.bind(this)
        this.#updateSize()

        this.pressedKeys = {};
        window.onkeyup = (e) => { this.pressedKeys[e.keyCode] = false; }
        window.onkeydown = (e) => { this.pressedKeys[e.keyCode] = true; }

        this.renderer.setAnimationLoop(this.#animate.bind(this));
    }

    onUpdate(f) {
        this.onUpdate_ = f
    }

    onCollision(f) {
        this.onCollision_ = f
    }

// private:
    #addStaticObjects() {
        const planeGeo = new THREE.PlaneGeometry()
        const boxGeo = new THREE.BoxGeometry()

        const planeMat = new THREE.MeshStandardMaterial({color: 0x000000, roughness: 0.2, metalness: 1})
        const blocksMat = new THREE.MeshStandardMaterial({ color: 0xffffff })
        this.scoreMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff })

        const plane = new THREE.Mesh(planeGeo, planeMat)
        plane.matrixAutoUpdate = false
        plane.position.set(0, 0, -this.options.depth)
        plane.scale.set(this.options.mapSize.x, this.options.mapSize.y, 1)
        plane.updateMatrix()
        this.scene.add(plane)

        const wallL = new THREE.Mesh(boxGeo, blocksMat)
        wallL.matrixAutoUpdate = false
        wallL.position.set(-(this.options.mapSize.x / 2) - 1, 0, -this.options.depth / 2)
        wallL.scale.set(2, 2 + this.options.mapSize.y + 2, this.options.depth)
        wallL.updateMatrix()
        this.scene.add(wallL)

        const wallR = wallL.clone()
        wallR.position.set((this.options.mapSize.x / 2) + 1, 0, -this.options.depth / 2)
        wallR.updateMatrix()
        this.scene.add(wallR)

        const wallU = new THREE.Mesh(boxGeo, blocksMat)
        wallU.matrixAutoUpdate = false
        wallU.position.set(0, (this.options.mapSize.y / 2) + 1, -this.options.depth / 2)
        wallU.scale.set(2 + this.options.mapSize.x + 2, 2, this.options.depth)
        wallU.updateMatrix()
        this.scene.add(wallU)

        const wallD = wallU.clone()
        wallD.position.set(0, -(this.options.mapSize.y / 2) - 1, -this.options.depth / 2)
        wallD.updateMatrix()
        this.scene.add(wallD)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        directionalLight.position.set(0, 0, 1)
        this.scene.add(directionalLight)

        const pointLight = new THREE.PointLight(0xffffff, 1, 0, 0)
        pointLight.position.set(0, 0, this.options.depth - 2)
        this.scene.add(pointLight)

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
        this.scene.add(ambientLight)
    }
    
    #updateSize() {
        const width = this.options.canvas.scrollWidth;
        const height = this.options.canvas.scrollHeight;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    #animate() {
        var dt = this.clock.getDelta()

        if (this.onUpdate_) {
            this.onUpdate_(this.pressedKeys, dt)
        }
        
        this.paddleL.position += this.paddleL.velocity * dt
        this.paddleR.position += this.paddleR.velocity * dt
        this.ball.realPosition = this.ball.realPosition.add(this.ball.velocity.clone().multiplyScalar(dt))
        
        var didHitWall = false
        var col = this.ball.testCollisionPaddle(this.paddleL)
        if (col.x == 0 && col.y == 0)
            col = this.ball.testCollisionPaddle(this.paddleR)
        if (col.x == 0 && col.y == 0) {
            col = this.ball.testCollisionWalls()
            if (Math.abs(col.x) > 0 || Math.abs(col.y) > 0)
                didHitWall = true
        }
        if (Math.abs(col.x) > 0) {
            this.ball.realPosition = new THREE.Vector2(
                this.ball.realPosition.x + col.x,
                this.ball.realPosition.y + (this.ball.velocity.y / this.ball.velocity.x) * col.x
            )
        }
        else if (Math.abs(col.y) > 0) {
            this.ball.realPosition = new THREE.Vector2(
                this.ball.realPosition.x + (this.ball.velocity.x / this.ball.velocity.y) * col.y,
                this.ball.realPosition.y + col.y
            )
        }
        this.camera.position = this.ball.position.multiplyScalar(-this.options.cameraMoveMult)

        if (this.onCollision_ && (Math.abs(col.x) > 0 || Math.abs(col.y) > 0))
            this.onCollision_(col.normalize(), didHitWall)

        this.renderer.render(this.scene, this.camera.threeCam);
    } 
}
