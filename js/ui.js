
export const ui = {
    canvas2D: document.getElementById('cityCanvas2D'),
    ctx2D: document.getElementById('cityCanvas2D').getContext('2d'),
    generateButton: document.getElementById('generateButton'),
    resizeHandle: document.getElementById('resizeHandle'),
    canvasContainer2D: document.getElementById('canvasContainer2D'),
    canvasContainer3D: document.getElementById('canvasContainer3D'),
    renderArea: document.getElementById('renderArea'),
    resizeInstructions: document.getElementById('resizeInstructions'),
    modeRadios: document.querySelectorAll('input[name="renderMode"]'),
    timeSlider: document.getElementById('timeOfDay'),
    timeValueDisplay: document.getElementById('timeValue'),


    getCurrentMode: () => {
        const checkedRadio = document.querySelector('input[name="renderMode"]:checked');
        return checkedRadio ? checkedRadio.value : '2d'; 
    },

    setMode: (mode) => {
        const radioToSelect = document.querySelector(`input[name="renderMode"][value="${mode}"]`);
        if (radioToSelect) {
            radioToSelect.checked = true;
        }
    },

    updateModeVisibility: (mode) => {
        const is2D = mode === '2d';
        ui.canvasContainer2D.style.display = is2D ? 'block' : 'none';
        ui.resizeHandle.style.display = is2D ? 'block' : 'none';
        ui.resizeInstructions.style.display = is2D ? 'block' : 'none';

        ui.canvasContainer3D.style.display = is2D ? 'none' : 'block';
        const timeSliderElement = ui.timeSlider.closest('.control-element'); 
        if (timeSliderElement) {
             timeSliderElement.style.display = is2D ? 'none' : 'flex';
        }
    },

    setResizeCursor: (isResizing) => {
         ui.canvasContainer2D.style.cursor = isResizing ? 'nwse-resize' : 'default';
         document.body.style.userSelect = isResizing ? 'none' : '';
    },

    getTimeOfDay: () => {
        return parseFloat(ui.timeSlider.value);
    },

    updateTimeDisplay: (timeOfDay) => {
        const totalMinutes = Math.floor(timeOfDay * 24 * 60);
        const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
        const minutes = String(totalMinutes % 60).padStart(2, '0');
        ui.timeValueDisplay.textContent = `${hours}:${minutes}`;
    },

    setTimeSliderValue: (value) => {
        ui.timeSlider.value = value;
        ui.updateTimeDisplay(value); 
    }
};
