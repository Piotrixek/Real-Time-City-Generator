
export const config = {
    initialMode: '3d',
    initialTimeOfDay: 0.5,
    initialWidth2D: 800, initialHeight2D: 400,
    initialWidth3D: 800, initialHeight3D: 600,
    minCanvasWidth: 150, minCanvasHeight: 100,

    buildingMinWidth2D: 25, buildingMaxWidth2D: 80,
    buildingMinHeightRatio2D: 0.1, buildingMaxHeightRatio2D: 0.75,
    buildingGap2D: 8, buildingProbability2D: 0.85, roadHeight2D: 60,
    windowSize2D: 5, windowSpacing2D: 5, windowColorOn2D: '#FFFFCC',
    windowColorOff2D: '#667799', windowProbability2D: 0.6,
    skyColorTop2D: "#87CEEB", skyColorBottom2D: "#E0F6FF",
    roadColor2D: '#444', roadLineColor2D: '#FFD700',

    gridRows: 20, gridCols: 20, blockSize: 50, streetWidth: 25,
    buildingBaseMinHeight3D: 10, buildingBaseMaxHeight3D: 180,
    tallBuildingProbability: 0.06, tallBuildingMinHeightMultiplier: 2.5, tallBuildingMaxHeightMultiplier: 4.5,
    buildingColorMinHue: 0, buildingColorMaxHue: 0, buildingColorMinSaturation: 0, buildingColorMaxSaturation: 5,
    buildingColorMinLightness: 75, buildingColorMaxLightness: 95,
    addWindows3D: true, window3DWidth: 3, window3DHeight: 4, window3DDepth: 0.5,
    window3DSpacingX: 5, window3DSpacingY: 6, window3DColorOn: 0xFFFF99, window3DColorOff: 0x405070,
    window3DOnProbability: 0.4, windowOffsetFromEdge: 3,
    streetColor: 0x505050, streetLevelOffset: 0.05,
    parkProbability: 0.10, parkColor: 0x559955, parkLevelOffset: 0.1,
    cameraFov: 60, cameraNear: 1, cameraFar: 5000,
    ambientLightIntensity: 0.6, directionalLightIntensity: 1.2,
    groundColor: 0x998877,
    sunAngleOffset: -Math.PI / 2, sunDistance: 1000,
    skyColorDay: 0x87CEEB, skyColorNight: 0x101820,
    fogColorDay: 0xADD8E6, fogColorNight: 0x101820,
    ambientIntensityDay: 0.6, ambientIntensityNight: 0.1,
    directionalIntensityDay: 1.2, directionalIntensityNight: 0.05,
    directionalColorDay: 0xFFFFFF, directionalColorNight: 0x8899AA,
    windowLightIntensityDay: 0.1, windowLightIntensityNight: 1.5,
    addStreetLights: true,
    streetLightColor: 0xFFFFAA, 
    streetLightEmissiveIntensityNight: 1.5, 
    streetLightHeight: 15,
    streetLightSpacing: 100,
    streetLightPoleRadius: 0.5,
    streetLightFixtureSize: 1.5,
};

config.worldWidth3D = config.gridCols * (config.blockSize + config.streetWidth);
config.worldDepth3D = config.gridRows * (config.blockSize + config.streetWidth);
config.cameraInitialPosX = 0;
config.cameraInitialPosY = Math.max(config.worldWidth3D, config.worldDepth3D) * 0.7;
config.cameraInitialPosZ = config.worldDepth3D * 0.8;

