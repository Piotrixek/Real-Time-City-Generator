import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { config } from './config.js';
import { ui } from './ui.js';

let scene, camera, renderer, controls, groundPlane;
let ambientLight, directionalLight;
let animationFrameId = null; 

let cityGroup = new THREE.Group();        
let streetGroup = new THREE.Group();      
let parkGroup = new THREE.Group();        
let streetLightGroup = new THREE.Group(); 

const streetLightPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.8, metalness: 0.5 });
const streetLightFixtureMaterial = new THREE.MeshStandardMaterial({
    color: config.streetLightColor,
    emissive: config.streetLightColor, 
    emissiveIntensity: 0 
});
const poleGeometry = new THREE.CylinderGeometry(config.streetLightPoleRadius, config.streetLightPoleRadius * 1.2, config.streetLightHeight, 8);
const fixtureGeometry = new THREE.SphereGeometry(config.streetLightFixtureSize, 8, 8);
const skyColor = new THREE.Color();
const fogColor = new THREE.Color();
const sunColor = new THREE.Color();
const ambientColor = new THREE.Color(); 

function init() {
    if (renderer) {
        console.warn("Three.js environment already initialized.");
        return;
    }

    const width = config.initialWidth3D;
    const height = config.initialHeight3D;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(config.cameraFov, width / height, config.cameraNear, config.cameraFar);
    camera.position.set(config.cameraInitialPosX, config.cameraInitialPosY, config.cameraInitialPosZ);
    camera.lookAt(0, 0, 0); 

    renderer = new THREE.WebGLRenderer({ antialias: true }); 
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    renderer.toneMapping = THREE.ACESFilmicToneMapping; 
    renderer.toneMappingExposure = 0.8; 
    ui.canvasContainer3D.appendChild(renderer.domElement); 

    ambientLight = new THREE.AmbientLight(0xffffff, config.ambientIntensityDay); 
    scene.add(ambientLight);
    directionalLight = new THREE.DirectionalLight(config.directionalColorDay, config.directionalIntensityDay); 
    directionalLight.castShadow = true;
    directionalLight.position.set(100, 200, 150); 
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    const shadowCamSize = Math.max(config.worldWidth3D, config.worldDepth3D) * 0.6; 
    directionalLight.shadow.camera.near = 10;
    directionalLight.shadow.camera.far = config.cameraInitialPosY * 2.5; 
    directionalLight.shadow.camera.left = -shadowCamSize;
    directionalLight.shadow.camera.right = shadowCamSize;
    directionalLight.shadow.camera.top = shadowCamSize;
    directionalLight.shadow.camera.bottom = -shadowCamSize;
    directionalLight.shadow.bias = -0.001; 
    scene.add(directionalLight);
    scene.add(directionalLight.target); 
    directionalLight.target.position.set(0, 0, 0); 

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0, 0); 
    controls.update();

    const groundSize = Math.max(config.worldWidth3D, config.worldDepth3D) * 1.5; 
    const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: config.groundColor, side: THREE.DoubleSide });
    groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
    groundPlane.rotation.x = -Math.PI / 2; 
    groundPlane.position.y = -0.2; 
    groundPlane.receiveShadow = true; 
    scene.add(groundPlane);

    scene.add(cityGroup);
    scene.add(streetGroup);
    scene.add(parkGroup);
    scene.add(streetLightGroup);

    console.log("Three.js environment initialized.");
}

function startAnimation() {
    if (animationFrameId) return; 
    function animate() {
        animationFrameId = requestAnimationFrame(animate); 
        controls.update(); 
        renderer.render(scene, camera); 
    }
    animate(); 
    console.log("3D Animation loop started.");
}

function stopAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); 
        animationFrameId = null;
        console.log("3D Animation loop stopped.");
    }
}

function cleanup() {
    if (!renderer) return; 
    stopAnimation(); 

    clearCityMeshes();
    clearStreetMeshes();
    clearParkMeshes();
    clearStreetLightMeshes();

    renderer.dispose();
    if (renderer.domElement.parentNode === ui.canvasContainer3D) {
        ui.canvasContainer3D.removeChild(renderer.domElement);
    }

    renderer = null; scene = null; camera = null; controls = null;
    groundPlane = null; ambientLight = null; directionalLight = null;
    cityGroup = new THREE.Group(); streetGroup = new THREE.Group();
    parkGroup = new THREE.Group(); streetLightGroup = new THREE.Group();

    console.log("Three.js environment cleaned up.");
}


function clearCityMeshes() { clearGroupChildren(cityGroup, "buildings"); }
function clearStreetMeshes() { clearGroupChildren(streetGroup, "streets"); }
function clearParkMeshes() { clearGroupChildren(parkGroup, "parks"); }
function clearStreetLightMeshes() { clearGroupChildren(streetLightGroup, "streetlights"); }

function clearGroupChildren(group, groupName = "group") {
     let count = 0;
     while (group.children.length > 0) {
         const object = group.children[0];
         group.remove(object); 

         if (object.geometry) object.geometry.dispose();
         if (object.material) {
             if (object.material.map instanceof THREE.Texture) {
                 object.material.map.dispose();
             }
             if (Array.isArray(object.material)) {
                 object.material.forEach(material => material.dispose());
             } else {
                 object.material.dispose();
             }
         }
         if (object instanceof THREE.Group) {
            clearGroupChildren(object, "child group");
         }

         count++;
     }
     if (count > 0) {
     }
}

function updateRendererSize(width, height) {
    if (!renderer) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix(); 
     console.log(`Updated renderer size to ${width}x${height}`);
}

function updateLighting(timeOfDay) {
    if (!scene || !ambientLight || !directionalLight) return;

    const dayFactor = Math.max(0, Math.cos((timeOfDay - 0.5) * Math.PI * 2));
    const nightFactor = 1.0 - dayFactor; 

    const nightSky = new THREE.Color(config.skyColorNight);
    const daySky = new THREE.Color(config.skyColorDay);
    const currentSky = new THREE.Color().lerpColors(nightSky, daySky, dayFactor);

    const nightFog = new THREE.Color(config.fogColorNight);
    const dayFog = new THREE.Color(config.fogColorDay);
    const currentFog = new THREE.Color().lerpColors(nightFog, dayFog, dayFactor);

    scene.background = currentSky; 
    if (scene.fog) {
        scene.fog.color = currentFog;
    }



    ambientLight.intensity = THREE.MathUtils.lerp(config.ambientIntensityNight, config.ambientIntensityDay, dayFactor);

    directionalLight.intensity = THREE.MathUtils.lerp(config.directionalIntensityNight, config.directionalIntensityDay, dayFactor);
    directionalLight.color.lerpColors(new THREE.Color(config.directionalColorNight), new THREE.Color(config.directionalColorDay), dayFactor);

    const sunAngle = timeOfDay * Math.PI * 2 + config.sunAngleOffset;
    const sunY = Math.sin(sunAngle) * config.sunDistance * 0.5 + config.sunDistance * 0.1;
    directionalLight.position.set(
        Math.cos(sunAngle) * config.sunDistance,
        Math.max(10, sunY), 
        Math.sin(sunAngle) * config.sunDistance
    );
    directionalLight.target.position.set(0, 0, 0); 

    const targetEmissiveIntensity = THREE.MathUtils.lerp(0, config.streetLightEmissiveIntensityNight, Math.max(0, (nightFactor - 0.15) / 0.85));
    streetLightGroup.traverse((child) => {
        if (child.isMesh && child.userData.isLightFixture) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
                 child.material.emissiveIntensity = targetEmissiveIntensity;
            }
        }
    });
}

function createStreetLight(x, y, z) {
    const group = new THREE.Group();

    const pole = new THREE.Mesh(poleGeometry, streetLightPoleMaterial);
    pole.position.y = config.streetLightHeight / 2;
    pole.castShadow = true;
    group.add(pole);

    const fixture = new THREE.Mesh(fixtureGeometry, streetLightFixtureMaterial.clone()); 
    fixture.position.y = config.streetLightHeight;
    fixture.userData.isLightFixture = true; 
    group.add(fixture);

    group.position.set(x, y, z);
    return group;
}


export const threeEnv = {
    init,
    cleanup,
    startAnimation,
    stopAnimation,
    clearCityMeshes,
    clearStreetMeshes,
    clearParkMeshes,
    clearStreetLightMeshes,
    updateRendererSize,
    updateLighting, 
    createStreetLight, 
    get scene() { return scene; },
    get camera() { return camera; },
    get renderer() { return renderer; },
    get controls() { return controls; },
    get cityGroup() { return cityGroup; },
    get streetGroup() { return streetGroup; },
    get parkGroup() { return parkGroup; },
    get streetLightGroup() { return streetLightGroup; }
};
