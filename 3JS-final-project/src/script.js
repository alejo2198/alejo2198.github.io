import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { GLTFLoader, RGBELoader,GroundedSkybox  } from 'three/examples/jsm/Addons.js' 
/**
 * Loader 
 */
const gltfLoader = new GLTFLoader()
const rgbeLoader = new RGBELoader()
/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//HDR
const environmentMap = rgbeLoader.load('/environmentMaps/forest/2k.hdr', ()=> {
    environmentMap.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = environmentMap
    scene.background = environmentMap
    const skybox = new GroundedSkybox(environmentMap,15,70)
    skybox.position.y = 15
    scene.add(skybox)
})

let mixer = null;
gltfLoader.load(
    'models/labrador_dog/scene.gltf',
    (gltf) => {
        console.log(gltf)
        mixer = new THREE.AnimationMixer(gltf.scene)
        const action = mixer.clipAction(gltf.animations[0])
        action.play()
        gltf.scene.scale.set(4,4,4)

        gui.add(gltf.scene.position, 'x').min(-10).max(10).step(0.001).name("dog horizontal position")
        gui.add(gltf.scene.position, 'y').min(-10).max(10).step(0.001).name("dog vertical position")
        gui.add(gltf.scene.position, 'z').min(-10).max(10).step(0.001).name("dog closeness position")

        scene.add(gltf.scene)
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 10, 25)
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.y = 3.5
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

let previousTime = 0;
const tick = () =>
{
    // Time
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    //Mixer
    if(mixer !== null){
        mixer.update(deltaTime)
    }
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()