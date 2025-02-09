import * as THREE from 'three'

export class PongMap
{
    constructor(options = {}) {
        const defaults = {
            dom: document.querySelector("body"),
            aspectRatio: 900 / 582,
            depth: 0.2,
            paddleLengh: 0.16,
            ballSize: 0.2,
            camMoveMult: 0.2
        };
        options = { ...defaults, ...options };

        this.htmlDom = options.dom
        this.aspectRatio = options.aspectRatio;
        this.depth = options.depth
        this.paddleLengh = options.paddleLengh
        this.ballSize = options.ballSize
        this.camMoveMult = options.camMoveMult
        
        this.planeW = 9.00
        this.planeH = this.planeW / this.aspectRatio 

        this.renderer = new THREE.WebGLRenderer({antialias: true})
        this.renderer.setPixelRatio(window.devicePixelRatio)
        this.htmlDom.appendChild(this.renderer.domElement)

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xff0000)

        this.camera = new THREE.PerspectiveCamera(75, 1, 0.01, 1000);
        this.camera.position.z = 4.5;

        window.onresize = this.#updateSize.bind(this)
        this.#updateSize()

        this.#addObjects()

        this.pressedKeys = {};
        window.onkeyup = (e) => { this.pressedKeys[e.keyCode] = false; }
        window.onkeydown = (e) => { this.pressedKeys[e.keyCode] = true; }

        this.renderer.setAnimationLoop(this.#animate.bind(this));
    }

    #updateSize() {
        const width = this.htmlDom.getBoundingClientRect().width;
        const height = window.innerHeight - this.renderer.domElement.getBoundingClientRect().top;

        this.renderer.setSize(width, height);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }

    #animate() {
        if (this.onUpdate_) {
            this.onUpdate_(this.pressedKeys)
        }
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

        const wallL = new THREE.Mesh(boxGeo, blocksMat)
        wallL.matrixAutoUpdate = false
        wallL.position.set(-(this.planeW / 2) - 1, 0, -this.depth / 2)
        wallL.scale.set(2, this.planeH, this.depth)
        wallL.updateMatrix()
        this.scene.add(wallL)

        const wallR = wallL.clone()
        wallR.position.set((this.planeW / 2) + 1, 0, -this.depth / 2)
        wallR.updateMatrix()
        this.scene.add(wallR)

        const wallU = new THREE.Mesh(boxGeo, blocksMat)
        wallU.matrixAutoUpdate = false
        wallU.position.set(0, (this.planeH / 2) + 1, -this.depth / 2)
        wallU.scale.set(2 + this.planeW + 2, 2, this.depth)
        wallU.updateMatrix()
        this.scene.add(wallU)

        const wallD = wallU.clone()
        wallD.position.set(0, -(this.planeH / 2) - 1, -this.depth / 2)
        wallD.updateMatrix()
        this.scene.add(wallD)

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

    setBallPos(x, y) {
        this.ball.position.set(x, y, this.ball.position.z)
        this.camera.position.set(-x / (this.planeW / 2) * this.camMoveMult, -y / (this.planeH / 2) * this.camMoveMult, this.camera.position.z)
        this.camera.lookAt(0, 0, 0)
    }

    get ballPos() {
        return this.ball.position
    }

    onUpdate(f) {
        this.onUpdate_ = f
    }
}
