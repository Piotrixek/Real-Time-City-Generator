import * as THREE from 'three';
import { config } from './config.js';
import { threeEnv } from './threeSetup.js'; 

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getBuildingColor() {
    const hue = getRandomInt(config.buildingColorMinHue, config.buildingColorMaxHue);
    const saturation = getRandomInt(config.buildingColorMinSaturation, config.buildingColorMaxSaturation);
    const lightness = getRandomInt(config.buildingColorMinLightness, config.buildingColorMaxLightness);
    return new THREE.Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
}


const winGeom = new THREE.BoxGeometry(config.window3DWidth, config.window3DHeight, config.window3DDepth);
const matOn = new THREE.MeshBasicMaterial({ color: config.window3DColorOn });
const matOff = new THREE.MeshStandardMaterial({ color: config.window3DColorOff, roughness: 0.9 });
const dummyObject = new THREE.Object3D();

function addWindowsToBuilding(buildingMesh, buildingWidth, buildingHeight, buildingDepth) {
    if (!config.addWindows3D) return;

    const {
        window3DWidth: winW, window3DHeight: winH, window3DDepth: winD,
        window3DSpacingX: spaceX, window3DSpacingY: spaceY,
        window3DOnProbability: onProb, windowOffsetFromEdge: edgeOffset
    } = config;

    const onWindowMatrices = [];
    const offWindowMatrices = [];

    const generateFaceWindows = (faceWidth, faceHeight, normalAxis, offset) => {
        const availableWidth = faceWidth - 2 * edgeOffset;
        const availableHeight = faceHeight - 2 * edgeOffset;
        if (availableWidth < winW || availableHeight < winH) return;

        const numCols = Math.floor(availableWidth / spaceX);
        const numRows = Math.floor(availableHeight / spaceY); 
        if (numCols <= 0 || numRows <= 0) return;

        const gridWidth = (numCols -1) * spaceX; 
        const gridHeight = (numRows -1) * spaceY; 
        const startX = -(gridWidth / 2); 
        const startY = -(gridHeight / 2); 

        for (let r = 0; r < numRows; r++) {
            for (let c = 0; c < numCols; c++) {
                const winGridX = startX + c * spaceX;
                const winGridY = startY + r * spaceY; 

                dummyObject.position.set(0,0,0); 
                dummyObject.scale.set(1, 1, 1);
                dummyObject.rotation.set(0, 0, 0);

                if (normalAxis === 'x') { 
                    dummyObject.position.set(offset, winGridY, winGridX);
                } else if (normalAxis === 'z') { 
                    dummyObject.position.set(winGridX, winGridY, offset);
                }
                dummyObject.updateMatrix(); 

                if (Math.random() < onProb) {
                    onWindowMatrices.push(dummyObject.matrix.clone()); 
                } else {
                    offWindowMatrices.push(dummyObject.matrix.clone()); 
                }
            }
        }
    };

    generateFaceWindows(buildingWidth, buildingHeight, 'z', buildingDepth / 2 + winD / 2);
    generateFaceWindows(buildingWidth, buildingHeight, 'z', -buildingDepth / 2 - winD / 2);
    generateFaceWindows(buildingDepth, buildingHeight, 'x', buildingWidth / 2 + winD / 2);
    generateFaceWindows(buildingDepth, buildingHeight, 'x', -buildingWidth / 2 - winD / 2);

    if (onWindowMatrices.length > 0) {
        const onWindowInstance = new THREE.InstancedMesh(winGeom, matOn, onWindowMatrices.length);
        for (let i = 0; i < onWindowMatrices.length; i++) {
            onWindowInstance.setMatrixAt(i, onWindowMatrices[i]);
        }
        onWindowInstance.instanceMatrix.needsUpdate = true; 
        buildingMesh.add(onWindowInstance); 
    }
    if (offWindowMatrices.length > 0) {
        const offWindowInstance = new THREE.InstancedMesh(winGeom, matOff, offWindowMatrices.length);
         for (let i = 0; i < offWindowMatrices.length; i++) {
            offWindowInstance.setMatrixAt(i, offWindowMatrices[i]);
        }
        offWindowInstance.instanceMatrix.needsUpdate = true; 
        buildingMesh.add(offWindowInstance); 
    }
}



function generateBuildingsAndParks() {
    const cityGroup = threeEnv.cityGroup;
    const parkGroup = threeEnv.parkGroup;

    const { gridRows, gridCols, blockSize, streetWidth, parkProbability, parkColor, parkLevelOffset } = config;
    const halfWorldWidth = config.worldWidth3D / 2;
    const halfWorldDepth = config.worldDepth3D / 2;
    const blockAndStreet = blockSize + streetWidth; 

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const blockCenterX = c * blockAndStreet - halfWorldWidth + blockAndStreet / 2;
            const blockCenterZ = r * blockAndStreet - halfWorldDepth + blockAndStreet / 2;

            if (Math.random() < parkProbability) {
                const parkGeometry = new THREE.PlaneGeometry(blockSize, blockSize); 
                const parkMaterial = new THREE.MeshStandardMaterial({
                    color: parkColor, side: THREE.DoubleSide, metalness: 0.0, roughness: 0.9
                 });
                const parkPlane = new THREE.Mesh(parkGeometry, parkMaterial);
                parkPlane.rotation.x = -Math.PI / 2; 
                parkPlane.position.set(blockCenterX, parkLevelOffset, blockCenterZ);
                parkPlane.receiveShadow = true; 
                parkGroup.add(parkPlane); 
                continue; 
            }

            const buildingWidth = blockSize * getRandomInt(75, 90) / 100;
            const buildingDepth = blockSize * getRandomInt(75, 90) / 100;
            let buildingHeight = getRandomInt(config.buildingBaseMinHeight3D, config.buildingBaseMaxHeight3D);
            if (Math.random() < config.tallBuildingProbability) {
                buildingHeight *= getRandomInt(
                    config.tallBuildingMinHeightMultiplier * 100,
                    config.tallBuildingMaxHeightMultiplier * 100
                ) / 100;
            }

            const geometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
            const material = new THREE.MeshStandardMaterial({
                color: getBuildingColor(), 
                metalness: 0.0,
                roughness: 0.85
            });

            const building = new THREE.Mesh(geometry, material);
            building.position.set(blockCenterX, buildingHeight / 2, blockCenterZ);
            building.castShadow = true;
            building.receiveShadow = true;

            addWindowsToBuilding(building, buildingWidth, buildingHeight, buildingDepth);

            cityGroup.add(building);
        }
    }
     console.log(`Generated ${cityGroup.children.length} buildings and ${parkGroup.children.length} parks.`);
}


function generateStreets() {
    const streetGroup = threeEnv.streetGroup;
    const streetLightGroup = threeEnv.streetLightGroup; 
    const { gridRows, gridCols, blockSize, streetWidth, streetColor, streetLevelOffset, addStreetLights, streetLightSpacing } = config;
    const halfWorldWidth = config.worldWidth3D / 2;
    const halfWorldDepth = config.worldDepth3D / 2;
    const blockAndStreet = blockSize + streetWidth;
    const streetMaterial = new THREE.MeshStandardMaterial({ color: streetColor, metalness: 0.2, roughness: 0.8 });
    const streetY = streetLevelOffset; 

    const horizontalStreetLength = config.worldWidth3D + streetWidth; 
    for (let r = 0; r <= gridRows; r++) { 
        const streetCenterZ = r * blockAndStreet - halfWorldDepth - streetWidth / 2;
        const streetGeometry = new THREE.PlaneGeometry(horizontalStreetLength, streetWidth);
        const streetPlane = new THREE.Mesh(streetGeometry, streetMaterial);
        streetPlane.rotation.x = -Math.PI / 2; 
        streetPlane.position.set(0, streetY, streetCenterZ); 
        streetPlane.receiveShadow = true;
        streetGroup.add(streetPlane);

        if (addStreetLights) {
            const numLights = Math.floor(horizontalStreetLength / streetLightSpacing);
            const startX = -horizontalStreetLength / 2 + streetLightSpacing / 2; 
            for (let i = 0; i < numLights; i++) {
                const lightX = startX + i * streetLightSpacing;
                const lightZ = streetCenterZ + (streetWidth / 2 + 5) * (i % 2 === 0 ? 1 : -1);
                const light = threeEnv.createStreetLight(lightX, 0, lightZ); 
                streetLightGroup.add(light);
            }
        }
    }

     const verticalStreetLength = config.worldDepth3D + streetWidth; 
     for (let c = 0; c <= gridCols; c++) { 
         const streetCenterX = c * blockAndStreet - halfWorldWidth - streetWidth / 2;
         const streetGeometry = new THREE.PlaneGeometry(streetWidth, verticalStreetLength);
         const streetPlane = new THREE.Mesh(streetGeometry, streetMaterial);
         streetPlane.rotation.x = -Math.PI / 2; 
         streetPlane.position.set(streetCenterX, streetY, 0); 
         streetPlane.receiveShadow = true;
         streetGroup.add(streetPlane);

         if (addStreetLights && c < gridCols) {
            const numLights = Math.floor(verticalStreetLength / streetLightSpacing);
            const startZ = -verticalStreetLength / 2 + streetLightSpacing / 2;
             for (let i = 0; i < numLights; i++) {
                 const lightZ = startZ + i * streetLightSpacing;
                 const lightX = streetCenterX + (streetWidth / 2 + 5) * (i % 2 === 0 ? 1 : -1);
                 const light = threeEnv.createStreetLight(lightX, 0, lightZ);
                 streetLightGroup.add(light);
             }
         }
     }
     console.log(`Generated ${streetGroup.children.length} street segments and ${streetLightGroup.children.length} streetlights.`);
}

export function updateWindowLights(timeOfDay) {
    if (!config.addWindows3D) return; 

    const dayFactor = Math.max(0, Math.cos((timeOfDay - 0.5) * Math.PI * 2));

    const lightIntensity = THREE.MathUtils.lerp(config.windowLightIntensityNight, config.windowLightIntensityDay, dayFactor);
    const baseColor = new THREE.Color(config.window3DColorOn);

    matOn.color.copy(baseColor).multiplyScalar(lightIntensity);

}


export function generate3DCity() {
    if (!threeEnv.scene) {
        console.error("Three.js environment not initialized before generating 3D city.");
        return;
    }
    console.time("generate3DCity"); 

    threeEnv.clearCityMeshes();
    threeEnv.clearStreetMeshes();
    threeEnv.clearParkMeshes();
    threeEnv.clearStreetLightMeshes();

    generateBuildingsAndParks(); 
    generateStreets();           

    console.timeEnd("generate3DCity"); 
}
