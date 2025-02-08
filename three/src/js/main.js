import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)

const scene = new THREE.Scene()
scene.background = new THREE.Color().setHex(0xff0000) 

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.01, 1000)
camera.position.z = 4.1

function updateSize() {
    threeCanvas.width = window.innerWidth
    threeCanvas.height = window.innerWidth * 9 / 16
    if (threeCanvas.height > window.innerHeight) {
        threeCanvas.height = window.innerHeight
        threeCanvas.width = window.innerHeight * 16 / 9
    }
    renderer.setSize(threeCanvas.width, threeCanvas.height)
}
window.onresize = updateSize
updateSize()

const planeGeo = new THREE.PlaneGeometry(9.00, 5.82)
const wallRLGeo = new THREE.BoxGeometry(2, 5.82, 0.2)
const wallUDGeo = new THREE.BoxGeometry(13, 2, 0.2)
const ballGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2)
const paddleGeo = new THREE.BoxGeometry(0.2, 1, 0.2)

const planeMat = new THREE.MeshStandardMaterial({color: 0x0, roughness: 0.2, metalness: 1})
const blocksMat = new THREE.MeshStandardMaterial({ color: 0xffffff })

const plane = new THREE.Mesh(planeGeo, planeMat)
plane.matrixAutoUpdate = false
plane.position.z = -0.1
plane.updateMatrix()
scene.add(plane)

const wallL = new THREE.Mesh(wallRLGeo, blocksMat)
wallL.matrixAutoUpdate = false
wallL.position.x = -5.5
wallL.updateMatrix()
scene.add(wallL)

const wallR = new THREE.Mesh(wallRLGeo, blocksMat)
wallR.matrixAutoUpdate = false
wallR.position.x = 5.5
wallR.updateMatrix()
scene.add(wallR)

const wallU = new THREE.Mesh(wallUDGeo, blocksMat)
wallU.matrixAutoUpdate = false
wallU.position.y = 3.91
wallU.updateMatrix()
scene.add(wallU)

const wallD = new THREE.Mesh(wallUDGeo, blocksMat)
wallD.matrixAutoUpdate = false
wallD.position.y = -3.91
wallD.updateMatrix()
scene.add(wallD)

const ball = new THREE.Mesh(ballGeo, blocksMat)
scene.add(ball)

const paddleR = new THREE.Mesh(paddleGeo, blocksMat)
paddleR.position.x = 4.02
paddleR.position.y = 0
paddleR.position.z = 0
scene.add(paddleR)

const paddleL = new THREE.Mesh(paddleGeo, blocksMat)
paddleL.position.x = -4.02
paddleL.position.y = 0
paddleL.position.z = 0
scene.add(paddleL)

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.x = 0
directionalLight.position.y = 0
directionalLight.position.z = 4.2
scene.add(directionalLight)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2)
scene.add(ambientLight)



var pressedKeys = {};
window.onkeyup = function(e) { pressedKeys[e.keyCode] = false; }
window.onkeydown = function(e) { pressedKeys[e.keyCode] = true; }

function setBallPos(x, y)
{
    ball.position.x = x
    camera.position.x = (-x / (9 / 2)) * 0.2
    ball.position.y = y
    camera.position.y = (-y / (5.82 / 2)) * 0.2
    camera.lookAt(0, 0, 0)
}


function animate() {
    const speed = 0.1
    if (pressedKeys[38]) {
        setBallPos(ball.position.x, ball.position.y + speed)
    }
    if (pressedKeys[40]) {
        setBallPos(ball.position.x, ball.position.y - speed)
    }
    if (pressedKeys[37]) {
        setBallPos(ball.position.x - speed, ball.position.y)
    } 
    if (pressedKeys[39]) {
        setBallPos(ball.position.x + speed, ball.position.y)
    }
    renderer.clear()
    renderer.render(scene, camera)
}
renderer.setAnimationLoop(animate)
