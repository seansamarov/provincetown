import './index.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'three'
/**
 * NOTES
 * 
 * 1 unit in this scene is 1 meter
 */


/**
 * Init
 */
const BACKGROUND = 0x9fbcda;
// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.Fog(BACKGROUND, 1, 200);
scene.fog = fog;

// Camera
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight, 
    0.1, 
    300
);
camera.position.set(50, 2, 90);
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas")
});
renderer.setClearColor(0x9fbcda);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

const textureLoader = new THREE.TextureLoader();

// Controls
// const controls = new OrbitControls(camera, canvas);

window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

// Tick
const tick = () => {
    // controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick()

// Lighting
scene.add(
    new THREE.DirectionalLight("white", 0.2),
    new THREE.AmbientLight(BACKGROUND, 0.4)
)

// Ground
const terrainMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1b77a,
    normalMap: textureLoader.load("/textures/sand_normal.png")
})

const terrain = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(400, 200, 1, 1),
    terrainMaterial
)
terrain.rotation.x = Math.PI / -2;
scene.add(terrain)

const player = new THREE.Mesh(
    new THREE.BoxBufferGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "red" })
)
player.position.set(50, 2, 90)
scene.add(player)


// Pier
const pier = new THREE.Mesh(
    new THREE.BoxGeometry(20, 7, 200),
    new THREE.MeshStandardMaterial({ color: "grey" })
)
pier.position.set(-40, 3.5, -50);
scene.add(pier)

// A line of "lamps" going down the pier
const pierLights = new THREE.Group();
const matcap = textureLoader.load("/textures/lamp_matcap.png");

for (let i = 0; i < 6; i++) {
    const x = -30;
    const y = 10;
    const z = -50 + 20 * i;
    const lamp = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 8, 8),
        new THREE.MeshMatcapMaterial({matcap: matcap})
    )
    lamp.position.set(x, y, z);
    const light = new THREE.PointLight("hsl(52, 100%, 90%)", 1, 12, 12);
    light.position.set(x + 1, y, z);
    pierLights.add(lamp, light);
}

scene.add(pierLights);