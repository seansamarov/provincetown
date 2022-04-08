/**
 * A small experiment in recreating a scene from a photo - see static/originalphoto.jpg
 * Still a lot of work to do
 */


import './index.css'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import * as THREE from 'three'
import gsap from 'gsap'
// import * as lil from 'lil-gui'
/**
 * NOTES
 * 
 * 1 unit in this scene is 1 meter
 */

/**
 * Init
 */
const properties = {
    BACKGROUND_COLOR: 0x9fbcda,
    BACKGROUND_COLOR_DARK: 0x477eb8
}
// Scene
const scene = new THREE.Scene();

// Fog
const fog = new THREE.Fog(properties.BACKGROUND_COLOR, -30, 180);
// const fog = new THREE.FogExp2(properties.BACKGROUND_COLOR, 0.0115);
// console.log(fog)
scene.fog = fog;

// const gui = new lil.GUI();
// gui.addColor(properties, "BACKGROUND_COLOR");
// gui.add(scene.fog, "density");

// Camera
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(30, 4, 90);
scene.add(camera);

// Camera looking constraints
let CAMERA_LOOK_CONSTRAINTS;
let CAMERA_LOOK_FACTOR = { x: 0, y: 0 };

window.addEventListener("mousemove", (e) => {
    CAMERA_LOOK_FACTOR.x = - (e.offsetY / window.innerHeight - 0.5) * 2;
    CAMERA_LOOK_FACTOR.y = - (e.offsetX / window.innerWidth - 0.5) * 2;
})
// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById("canvas")
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(properties.BACKGROUND_COLOR);

const init = () => {
    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix();
    // Update constraints on load/window resize so that the user can see the same effective range
    CAMERA_LOOK_CONSTRAINTS = {
        x: Math.PI / 16 / camera.aspect,
        y: Math.PI / 4 / camera.aspect
    }
    // Update renderer
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}
init();
window.addEventListener('resize', init);

// Loaders
const ttfLoader = new TTFLoader();
const fontLoader = new FontLoader();
const fbxLoader = new FBXLoader();
const textureLoader = new THREE.TextureLoader();

/**
 * Lighting
 */

// Basic lights

const sun = (() => {
    const light = new THREE.DirectionalLight(0xffffff, 0.2);
    light.castShadow = true
    light.shadow.mapSize.width = 1024
    light.shadow.mapSize.height = 1024
    light.shadow.camera.near = 0.1
    light.shadow.camera.far = 283 
    light.shadow.camera.top = 20
    light.shadow.camera.right = 140
    light.shadow.camera.bottom = -20
    light.shadow.camera.left = -140
    light.position.set(100, 20, 100);
    return light;
})();
const buildingLamp = new THREE.SpotLight(0xff6633, 0.5, 20, 90, 45, 0.1);
buildingLamp.position.set(50, 3, 95);
buildingLamp.target.position.set(50, 1, 85);

// Pier Lamps
// TODO Randomize light temperature
const pierLights = new THREE.Group();
const lampGeometry = new THREE.SphereGeometry(0.5, 8, 8);
const lampMaterial = new THREE.MeshStandardMaterial({ color: 0xccb100, emissive: 0xfff8cc });
const lampPostGeometry = new THREE.CylinderBufferGeometry(0.2, 0.2, 6, 12, 1, false);
const lampPostMaterial = new THREE.MeshStandardMaterial({ color: 0x060606 });

const // Lamp positioning defaults
    x = -81,
    y = 9,
    z = 100;
for (let i = 0; i < 20; i++) {
    // Generate and place lamps
    const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
    lamp.position.set(x, y, (z - 10 * i));
    lamp.castShadow = true

    const light = new THREE.PointLight(lampMaterial.color, 1, 5, 0.2);
    light.position.copy(lamp.position);

    const lampPost = new THREE.Mesh(lampPostGeometry, lampPostMaterial);
    lampPost.position.copy(lamp.position);
    lampPost.position.y -= 3.5;
    lampPost.castShadow = true
    lamp.castShadow = true

    pierLights.add(lamp, light, lampPost);
}

scene.add(
    sun,
    // buildingLamp,
    // buildingLamp.target,
    pierLights,
    // new THREE.CameraHelper(sun.shadow.camera),
    // new THREE.HemisphereLight(properties.BACKGROUND_COLOR, properties.BACKGROUND_COLOR_DARK, 0.)
    new THREE.AmbientLight(0xffffff, 0.3)
)

/**
 * Scene Objects 
 * TODO
 * Implement loading manager
 */

// Text
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
        text.position.z = 40;
        text.castShadow = true;
        geometry.center();
        scene.add(text);

        // // Fade out on interaction
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

// Terrain
fbxLoader.load(
    "/provincetown.fbx",
    (fbx) => {
        const terrain = fbx.children[2];
        const dock = fbx.children[1];

        const terrainTextures = {
            map: textureLoader.load("/textures/Sand_004_COLOR.png.1080.png"),
            displacement: textureLoader.load("/textures/Sand_004_Height.png.1080.png"),
            normal: textureLoader.load("/textures/Sand_004_Normal.png.1080.png"),
            ao: textureLoader.load("/textures/Sand_004_OCC.png.1080.png"),
            roughness: textureLoader.load("/textures/Sand_004_OCC.png.1080.png"),
        }
        for (const type in terrainTextures) {
            const tx = terrainTextures[type];
            tx.wrapS = THREE.RepeatWrapping
            tx.wrapT = THREE.RepeatWrapping
            tx.repeat.x = 8
            tx.repeat.y = 8
            tx.magFilter = THREE.LinearFilter
            tx.magFilter = THREE.LinearFilter
            // textures[type].needsUpdate = true
        }
        terrain.material = new THREE.MeshPhongMaterial(
        {
            // color: 0xffe3ae,
            flatShading: false,
            map: terrainTextures.map,
            // roughnessMap: terrainTextures.roughness,
            aoMap: terrainTextures.ao,
            aoMapIntensity: 1.1,
            displacementMap: terrainTextures.displacement,
            bumpMap: terrainTextures.normal,
            normalMap: terrainTextures.normal,
            normalScale: new THREE.Vector2(-1, -1),
        })
        terrain.receiveShadow = true

        dock.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material = new THREE.MeshStandardMaterial({ 
                    color: 0x271a0c, 
                    flatShading: false,
                    metalness: 0,
                    roughness: 1,
                    emissive: 0x080502,
                    emissiveIntensity: 0.2
                })
                child.position.y -= Math.random() * 0.25
            }
        })
        scene.add(fbx);
    }
);

// Water
// TODO The reflector is probably insanely inefficient. Make this high-quality in Blender or something and bake it.
const waterGeometry = new THREE.CircleBufferGeometry(213, 12);
const waterMaterial = new THREE.MeshStandardMaterial({
    color: "lightblue", 
    transparent: true, 
    opacity: 0.9,
    roughness: 0.6
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.receiveShadow = true;
water.position.copy(camera.position);
water.position.y = 1;
water.rotation.x = Math.PI / -2;

const waterReflector = new Reflector( waterGeometry, {
    clipBias: 0.003, 
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xffffff
})
waterReflector.position.copy(water.position);
waterReflector.position.y = 0.5;
waterReflector.rotation.x = Math.PI / -2;
scene.add(water);



const car = new THREE.Group();
const headlight = new THREE.SpotLight(0xffffff, 1, 5, 45, 25, 0);
headlight.castShadow = true;
headlight.shadow.camera.far = 215;
headlight.shadow.camera.fov = THREE.MathUtils.radToDeg(headlight.angle);
const splh = new THREE.SpotLightHelper(headlight);
const sendCar = () => {
    scene.add(headlight.target, headlight, splh);
    headlight.position.set(-90, 10, -100);
    headlight.target.position.set(-90, 10, 100);
    // scene.add(car, new THREE.SpotLightHelper(car.children[0]));
    // const directionMultiplier = (Math.random() > 0.5) ? 1 : -1;


    // Randomly send a car between ever 0 and 60 seconds
    // const timeToNextCar = Math.random() * 60 * 1000;
    // console.log(`Sending a car, the next one goes in approximately ${Math.round(timeToNextCar / 1000)} seconds`);
    // Send Car
    gsap.to(headlight.position, {
        duration: 10,
        z: 100,
        ease: "linear",
        onComplete: () => {
            scene.remove(headlight.target, headlight, splh);
        }
    })
    setTimeout(sendCar, 10000);  
}
// sendCar(); // TODO Call on load

// Fog limit test, should be barely visible
// const fogTest = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: "red" }))
// fogTest.position.set(-90, 4, -50);
// scene.add(fogTest);


// const controls = new OrbitControls(camera, canvas);
// Tick
const tick = () => 
{
    // controls.update()
    // Tween camera
    gsap.to(camera.rotation, {
            duration: 2.5,
            ease: "power1.easeIn",
            y: CAMERA_LOOK_FACTOR.y * CAMERA_LOOK_CONSTRAINTS.y,
            x: CAMERA_LOOK_FACTOR.x * CAMERA_LOOK_CONSTRAINTS.x
    })
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
}
tick();