import * as THREE from 'three'

export class Paddle {
    constructor(options, scene, posX) {
        this.options = options;
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(this.options.paddleSize.x, this.options.paddleSize.y, options.depth),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        )
        this.mesh.position.x = posX
        this.mesh.position.z = -options.depth / 2
        scene.add(this.mesh)
        this.velocity = 0.0
    }

    get realPosition() {
        return this.mesh.position.clone()
    }

    get position() {
        return this.mesh.position.y / (this.options.mapSize.y / 2 - this.options.paddleSize.y / 2)
    }

    set position(y) {
        this.mesh.position.y = Math.max(-1, Math.min(y, 1)) * (this.options.mapSize.y / 2 - this.options.paddleSize.y / 2)
    }

    get velocity() {
        return this._velocity
    } 

    set velocity(v) {
        this._velocity = v
    }
}
