import './index.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import * as THREE from 'three'

import gsap from 'gsap'

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
const fog = new THREE.Fog(BACKGROUND, 1, 120);
// const fog = new THREE.FogExp2(BACKGROUND, 0.015);
scene.fog = fog;

/**
 * Camera
 */

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1, 
    1000
);
camera.position.set(50, 2, 90);
scene.add(camera);

// Camera looking constraints and easing.
// Aspect multiplier makes it so that you can effectively see the same frustum regardless of screen size
let LOOK_CONSTRAINTS = {
    x: Math.PI / 8 / camera.aspect,
    y: Math.PI / 2 / camera.aspect
}
const LOOK_FACTOR = { x: 0, y: 0 }
window.addEventListener("mousemove", (e) => {
    LOOK_FACTOR.x = - (e.offsetY / window.innerHeight - 0.5) * 2;
    LOOK_FACTOR.y = - (e.offsetX / window.innerWidth - 0.5) * 2;
})

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas")
});
renderer.setClearColor(0x9fbcda);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))





// Lighting
scene.add(
    new THREE.DirectionalLight("white", 0.2),
    new THREE.AmbientLight(BACKGROUND, 0.4)
)
const sendCar = () => {
    // Create "car" with lights that travel through the fog
    // Make the car travel along the pier
    // Make the car make car noises that directionally follow the car

    // Randomly send a car between ever 0 and 30 seconds
    const timeToNextCar = Math.random() * 60 * 1000;
    console.log(`Sending a car, the next one goes in approximately ${Math.round(timeToNextCar / 1000)} seconds`)
    setTimeout(sendCar, timeToNextCar);  
}
sendCar();


/**
 * Loaders
 */
const ttfLoader = new TTFLoader();
const fontLoader = new FontLoader();
const textureLoader = new THREE.TextureLoader();
const fbxLoader = new FBXLoader();

// TODO Implement loading manager
// Loading text
let text;
ttfLoader.load(
    "/fonts/Raleway/Raleway-Bold.ttf",
    (font) => {
        const geometry = new TextGeometry(
            "Provincetown",
            {
                font: fontLoader.parse(font),
                size: 4,
                height: 0.5,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 5
            }
        )
        const material = new THREE.MeshStandardMaterial(
            { 
                color: 0x444444, 
                transparent: true
            }
        );
        text = new THREE.Mesh(geometry, material);
        text.position.x = camera.position.x;
        text.position.y = 10;
        text.position.z = 10;
        geometry.center();
        scene.add(text);

        // Fade out on interaction
        // window.addEventListener("mousemove", () => 
        // {
        //     setTimeout(() =>
        //     {
        //         console.log("fading out text");
        //         gsap.to(text.material, {
        //             duration: 1,
        //             opacity: 0
        //         })
        //     }, 1000)
        // },
        // {
        //     once: true // Run this event once only
        // })
    },
    () => {console.log("loading font")},
    (e) => {console.log("error", e)}
)

// Loading terrain
fbxLoader.load(
    "/provincetown.fbx",
    (fbx) => {
        fbx.material = new THREE.MeshStandardMaterial({color: 0xf1b77a})
        scene.add(fbx)
    }
);

// A line of "lamps" going down the pier
const pierLights = new THREE.Group();
const pierLampMaterial = new THREE.MeshStandardMaterial({ color: 0xccb100, emissive: 0xfff8cc });
const pierLampGeometry = new THREE.SphereGeometry(0.5, 8, 8);
for (let i = 0; i < 10; i++) {
    const x = -30;
    const y = 10;
    const z = 100 - i * 20;
    // TODO Randomize light temperature
    const lamp = new THREE.Mesh(pierLampGeometry, pierLampMaterial)
    lamp.position.set(x, y, z);
    const light = new THREE.PointLight(0xfff8cc, 1, 100, 100);
    light.position.set(x + 1, y, z);
    pierLights.add(lamp);
}
scene.add(pierLights);



window.addEventListener('resize', () =>
{
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();

    LOOK_CONSTRAINTS = {
        x: Math.PI / 8 / camera.aspect,
        y: Math.PI / 2 / camera.aspect
    }

    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

// Tick
const tick = () => 
{
    renderer.render(scene, camera);

    // Tween camera
    // gsap.to(
    //     camera.rotation, 
    //     {
    //         duration: 1,
    //         ease: "power4.easeInOut",
    //         y: LOOK_FACTOR.y * LOOK_CONSTRAINTS.y,
    //         x: LOOK_FACTOR.x * LOOK_CONSTRAINTS.x
    //     }
    // )
    window.requestAnimationFrame(tick);
}
tick()