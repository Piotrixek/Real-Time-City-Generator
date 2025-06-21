import { config } from './config.js';
import { ui } from './ui.js'; 

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawWindows2D(ctx, x, y, width, height) {
    const numCols = Math.floor(width / (config.windowSize2D + config.windowSpacing2D));
    const numRows = Math.floor(height / (config.windowSize2D + config.windowSpacing2D));
     if (numCols <= 0 || numRows <= 0) return;

    const totalHSpace = numCols * config.windowSize2D + (numCols - 1) * config.windowSpacing2D;
    const totalVSpace = numRows * config.windowSize2D + (numRows - 1) * config.windowSpacing2D;
    const startX = x + (width - totalHSpace) / 2;
    const startY = y + (height - totalVSpace) / 2;

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const windowX = startX + col * (config.windowSize2D + config.windowSpacing2D);
            const windowY = startY + row * (config.windowSize2D + config.windowSpacing2D);
            ctx.fillStyle = Math.random() < config.windowProbability2D ? config.windowColorOn2D : config.windowColorOff2D;
            ctx.fillRect(windowX, windowY, config.windowSize2D, config.windowSize2D);
        }
    }
}

function drawRoof2D(ctx, x, y, width, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    const roofType = Math.random();
    if (roofType < 0.5) {
        ctx.fillRect(x, y, width, 5);
    } else {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width / 2, y - 10);
        ctx.lineTo(x + width, y);
        ctx.closePath();
        ctx.fill();
    }
}

function drawBuilding2D(ctx, x, y, width, height) {
    const r = getRandomInt(50, 180);
    const g = getRandomInt(50, 180);
    const b = getRandomInt(50, 180);
    ctx.fillStyle = `rgb(${r},${g},${b})`;

    ctx.fillRect(x, y, width, height);
    drawWindows2D(ctx, x, y, width, height);
    drawRoof2D(ctx, x, y, width, height);
}

function drawRoad2D(ctx, currentCanvasHeight, currentCanvasWidth) {
    const roadY = currentCanvasHeight - config.roadHeight2D;
    ctx.fillStyle = config.roadColor2D;
    ctx.fillRect(0, roadY, currentCanvasWidth, config.roadHeight2D);
    const dashLength = 20;
    const gapLength = 15;
    const lineY = roadY + config.roadHeight2D / 2;
    ctx.strokeStyle = config.roadLineColor2D;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.setLineDash([dashLength, gapLength]);
    ctx.moveTo(0, lineY);
    ctx.lineTo(currentCanvasWidth, lineY);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawSky2D(ctx, currentCanvasHeight, currentCanvasWidth) {
    const skyGradient = ctx.createLinearGradient(0, 0, 0, currentCanvasHeight - config.roadHeight2D);
    skyGradient.addColorStop(0, config.skyColorTop2D);
    skyGradient.addColorStop(1, config.skyColorBottom2D);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, currentCanvasWidth, currentCanvasHeight - config.roadHeight2D);
}

export function generate2DCity(canvas, ctx, width, height) {
    canvas.width = width;
    canvas.height = height;

    drawSky2D(ctx, height, width);
    drawRoad2D(ctx, height, width);

    const minHeight = height * config.buildingMinHeightRatio2D;
    const maxHeight = height * config.buildingMaxHeightRatio2D;
    let currentX = 0;

    while (currentX < width - config.buildingMinWidth2D) {
        if (Math.random() < config.buildingProbability2D) {
            const buildingWidth = getRandomInt(config.buildingMinWidth2D, config.buildingMaxWidth2D);
            const actualWidth = Math.min(buildingWidth, width - currentX);
             if (actualWidth <= 0) break;

            const buildingHeight = getRandomInt(minHeight, maxHeight);
            const buildingY = height - config.roadHeight2D - buildingHeight;
            drawBuilding2D(ctx, currentX, buildingY, actualWidth, buildingHeight);
            currentX += actualWidth + config.buildingGap2D;
        } else {
            const skipWidth = getRandomInt(config.buildingMinWidth2D / 2, config.buildingMinWidth2D);
            currentX += skipWidth + config.buildingGap2D;
        }
    }
    console.log("Generated 2D City");
}