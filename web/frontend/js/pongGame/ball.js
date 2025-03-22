import * as THREE from 'three'

export class Ball {
    constructor(options, scene) {
        this.options = options
        this.mesh = new THREE.Mesh(
            new THREE.BoxGeometry(options.ballSize, options.ballSize, options.ballSize),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        )
        this.mesh.position.z = -options.depth + options.ballSize / 2
        scene.add(this.mesh)
        this.velocity = new THREE.Vector2(0, 0)
    }

    get realPosition() {
        return this.mesh.position.clone()
    }

    set realPosition(vec) {
        this.mesh.position.x = vec.x
        this.mesh.position.y = vec.y
    }

    get position() {
        return new THREE.Vector2(
            this.mesh.position.x / (this.options.mapSize.x / 2 - this.options.ballSize / 2),
            this.mesh.position.y / (this.options.mapSize.y / 2 - this.options.ballSize / 2),
        )
    }

    set position(vec) {
        this.mesh.position.x = Math.max(-1, Math.min(vec.x, 1)) * (this.options.mapSize.x / 2 - this.options.ballSize / 2)
        this.mesh.position.y = Math.max(-1, Math.min(vec.y, 1)) * (this.options.mapSize.y / 2 - this.options.ballSize / 2)
    }

    get velocity() {
        return this._velocity
    } 

    set velocity(vec) {
        this._velocity = vec
    }

    testCollisionPaddle(paddle) {
        var collision = new THREE.Vector2(0, 0)
        if (this.realPosition.x - this.options.ballSize / 2 < paddle.realPosition.x + this.options.paddleSize.x / 2 &&
            this.realPosition.x + this.options.ballSize / 2 > paddle.realPosition.x - this.options.paddleSize.x / 2 && 
            this.realPosition.y - this.options.ballSize / 2 < paddle.realPosition.y + this.options.paddleSize.y / 2 && 
            this.realPosition.y + this.options.ballSize / 2 > paddle.realPosition.y - this.options.paddleSize.y / 2)
        {
            if (this.velocity.x > 0)
                collision.x = (paddle.realPosition.x - this.options.paddleSize.x / 2) - (this.realPosition.x + this.options.ballSize / 2)
            if(this.velocity.x < 0)
                collision.x = (paddle.realPosition.x + this.options.paddleSize.x / 2) - (this.realPosition.x - this.options.ballSize / 2)
            if (this.velocity.y > 0)
                collision.y = (paddle.realPosition.y - this.options.paddleSize.y / 2) - (this.realPosition.y + this.options.ballSize / 2)
            if (this.velocity.y < 0)
                collision.y = (paddle.realPosition.y + this.options.paddleSize.y / 2) - (this.realPosition.y - this.options.ballSize / 2)
            if ((Math.abs(collision.x) > 0 && Math.abs(collision.x) < Math.abs(collision.y)) || collision.y == 0)
                collision.y = 0
            else
                collision.x = 0
        }
        return collision
    }

    testCollisionWalls() {
        var collision = new THREE.Vector2(0, 0)
        if (this.velocity.x > 0 && this.realPosition.x + this.options.ballSize / 2 > this.options.mapSize.x / 2)
            collision.x = this.options.mapSize.x / 2 - (this.realPosition.x + this.options.ballSize / 2)
        if (this.velocity.x < 0 && this.realPosition.x - this.options.ballSize / 2 < -this.options.mapSize.x / 2)
            collision.x = -this.options.mapSize.x / 2 - (this.realPosition.x - this.options.ballSize / 2)
        if (this.velocity.y > 0 && this.realPosition.y + this.options.ballSize / 2 > this.options.mapSize.y / 2)
            collision.y = this.options.mapSize.y / 2 - (this.realPosition.y + this.options.ballSize / 2)
        if (this.velocity.y < 0 && this.realPosition.y - this.options.ballSize / 2 < -this.options.mapSize.y / 2)
            collision.y = -this.options.mapSize.y / 2 - (this.realPosition.y - this.options.ballSize / 2)
        if ((Math.abs(collision.x) > 0 && Math.abs(collision.x) < Math.abs(collision.y)) || collision.y == 0)
            collision.y = 0
        else
            collision.x = 0
        return collision
    }
}
