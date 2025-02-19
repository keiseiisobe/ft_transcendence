import * as THREE from 'three'

export class Camera {
    constructor(options) {
        this.options = options
        this.camera = new THREE.PerspectiveCamera(
            options.cameraFOV,
            options.canvas.scrollWidth / options.canvas.scrollHeight,
            0.01, 1000
        );
        this.camera.position.set(0, 0, options.cameraDistance);
    }

    get threeCam() {
        return this.camera
    }

    get position() {
        return new THREE.Vector2(
            this.camera.position.x / (this.options.mapSize.x / 2),
            this.camera.position.y / (this.options.mapSize.y / 2)
        )
    }

    set position(vec) {
        this.camera.position.x = vec.x * (this.options.mapSize.x / 2)
        this.camera.position.y = vec.y * (this.options.mapSize.y / 2)
        this.camera.lookAt(0, 0, 0)
    }

    get aspect() {
        return this.camera.aspect
    }

    set aspect(a) {
        this.camera.aspect = a
    }

    updateProjectionMatrix() {
        this.camera.updateProjectionMatrix()
    }
}
