import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

export class TextObj {
    constructor(options, fontSize, scene, fontPath, text, pos) {
        this.options = options
        this.fontSize = fontSize
        this.scene = scene
        this.text = text
        this.position = pos
        this.visible = true
        const fontLoader = new FontLoader()
        fontLoader.load(fontPath, (font) => {
            this.font = font
            this.#updateMesh()
        })
    }

    get position() {
        return this._position ? this._position : new THREE.Vector2(0, 0)
    }

    set position(vec) {
        this._position = vec
        if (this.mesh)
            this.#updateMesh()
    }

    get visible() {
        return this._visible
    }

    set visible(v) {
        this._visible = v
        if (this.mesh)
            this.#updateMesh()
    }

    get text() {
        return this.textStr ? this.textStr : ""
    } 

    set text(s) {
        this.textStr = s
        if (this.mesh)
            this.#updateMesh()
    }

// private:
    #updateMesh() {
        const geo = new TextGeometry(this.text, {
            font: this.font,
            size: this.fontSize,
            depth: this.options.textDepth
        }) 
        geo.computeBoundingBox()
        const mat = new THREE.MeshStandardMaterial({color: 0xffffff})
        if (this.mesh)
            this.scene.remove(this.mesh)
        this.mesh = new THREE.Mesh(geo, [mat, mat])
        this.mesh.visible = this.visible
        this.mesh.position.x = this.position.x * (this.options.mapSize.x / 2 - geo.boundingBox.max.x / 2) - geo.boundingBox.max.x / 2
        this.mesh.position.y = this.position.y * (this.options.mapSize.y / 2 - geo.boundingBox.max.y / 2) - geo.boundingBox.max.y / 2
        this.scene.add(this.mesh)
    }
}
