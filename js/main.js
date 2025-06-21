
import { config } from './config.js';        
import { ui } from './ui.js';                
import { threeEnv } from './threeSetup.js';  
import { generate2DCity } from './city2D.js'; 
import { generate3DCity, updateWindowLights } from './city3D.js'; 

let currentMode = null; 
let isResizing = false; 
let startX, startY, startWidth, startHeight; 
let current3DWidth = config.initialWidth3D; 
let current3DHeight = config.initialHeight3D;


function updateDynamicElements(timeOfDay) {
    if (currentMode === '3d') {
        threeEnv.updateLighting(timeOfDay);
        updateWindowLights(timeOfDay);
    }
    ui.updateTimeDisplay(timeOfDay);
}

function switchMode(newMode) {
    if (newMode === currentMode) return;
    console.log(`Switching mode from ${currentMode} to ${newMode}`);

    if (currentMode === '3d') {
        threeEnv.stopAnimation(); 
    } else if (currentMode === '2d') {
    }

    currentMode = newMode;
    ui.updateModeVisibility(currentMode);

    if (currentMode === '2d') {
        generate2DCity(ui.canvas2D, ui.ctx2D, ui.canvas2D.width, ui.canvas2D.height);
    } else { 
        if (!threeEnv.renderer) {
             threeEnv.init();
             threeEnv.updateRendererSize(current3DWidth, current3DHeight);
        }
        generate3DCity();
        updateDynamicElements(ui.getTimeOfDay());
        threeEnv.startAnimation();
    }
}


function handleMouseMove(e) {
    if (!isResizing || currentMode !== '2d') return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newWidth = Math.max(config.minCanvasWidth, startWidth + dx);
    const newHeight = Math.max(config.minCanvasHeight, startHeight + dy);

    generate2DCity(ui.canvas2D, ui.ctx2D, newWidth, newHeight);
}

function handleMouseUp() {
    if (isResizing) {
        isResizing = false; 
        ui.setResizeCursor(false); 
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }
}


ui.modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => switchMode(e.target.value));
});

ui.generateButton.addEventListener('click', () => {
    console.log("Generate button clicked");
    if (currentMode === '2d') {
        generate2DCity(ui.canvas2D, ui.ctx2D, ui.canvas2D.width, ui.canvas2D.height);
    } else { 
        generate3DCity();
        updateDynamicElements(ui.getTimeOfDay());
        if (threeEnv.renderer) { threeEnv.startAnimation(); }
    }
});

ui.timeSlider.addEventListener('input', () => {
    updateDynamicElements(ui.getTimeOfDay());
});

ui.resizeHandle.addEventListener('mousedown', (e) => {
    if (currentMode !== '2d') return;
    isResizing = true; 
    startX = e.clientX;
    startY = e.clientY;
    startWidth = ui.canvas2D.width;
    startHeight = ui.canvas2D.height;
    ui.setResizeCursor(true); 
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
});

window.addEventListener('resize', () => {
    if (currentMode === '3d' && threeEnv.renderer) {
        current3DWidth = ui.canvasContainer3D.clientWidth;
        current3DHeight = ui.canvasContainer3D.clientHeight;
        threeEnv.updateRendererSize(current3DWidth, current3DHeight);
        console.log("Window resized - Updated 3D renderer size.");
    }
});


function initialize() {
    console.log("Initializing application...");
    ui.setMode(config.initialMode);
    ui.setTimeSliderValue(config.initialTimeOfDay);
    ui.canvas2D.width = config.initialWidth2D;
    ui.canvas2D.height = config.initialHeight2D;
    ui.canvasContainer3D.style.width = `${config.initialWidth3D}px`;
    ui.canvasContainer3D.style.height = `${config.initialHeight3D}px`;
    current3DWidth = config.initialWidth3D; 
    current3DHeight = config.initialHeight3D;

    switchMode(config.initialMode);
    console.log("Initialization complete.");
}

initialize();
