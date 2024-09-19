const { ipcRenderer } = require('electron');
const jsQR = require('jsqr');
const screenshot = require('screenshot-desktop');

const captureButton = document.getElementById('capture-button');
const selectionArea = document.getElementById('selectionArea');
const selection = document.getElementById('selection');

let isCapturaOkStart = false;
let isCapturing = false;
let startX, startY;

document.addEventListener('mousedown', (e) => {
    isCapturing = true;
    startX = e.screenX;
    startY = e.screenY;
   
    selection.style.position = 'absolute';
    selection.style.left = `${startX}px`;
    selection.style.top = `${startY}px`;
    setTimeout(() => {
        selection.style.display = 'block'; 
    }, 80);
    
});

document.addEventListener('mousemove', (e) => {
    if (isCapturing) {
        endX = e.offsetX;
        endY = e.offsetY;

        const width = endX - startX;
        const height = endY - startY;

        selection.style.width = `${Math.abs(width)}px`;
        selection.style.height = `${Math.abs(height)}px`;
        selection.style.left = `${width < 0 ? endX : startX}px`;
        selection.style.top = `${height < 0 ? endY : startY}px`;


        const x1 = Math.min(startX, endX);
        const y1 = Math.min(startY, endY);
        const x2 = Math.max(startX, endX);
        const y2 = Math.max(startY, endY);
        //selection.style.clipPath = `rect(${x1}px, ${y1}px, ${x2}px, ${y2}px)`;

    }
});
ipcRenderer.on('key-pressed-true', (event, imageData) => {
    selectionArea.style.display = 'block';
});
ipcRenderer.on('key-pressed-false', (event, imageData) => {
    selectionArea.style.display = 'none';
});
document.addEventListener('mouseup', (e) => {
    selection.style.display = 'none';
    if (isCapturing) {
        isCapturing = false;
        const endX = e.screenX;
        const endY = e.screenY;

        const captureArea = {
            x: Math.min(startX, endX),
            y: Math.min(startY, endY),
            width: Math.abs(endX - startX),
            height: Math.abs(endY - startY)
        };
        captureScreen(captureArea);
        //ipcRenderer.send('capture-screen', captureArea);
    }
});

async function captureScreen(captureArea) {
    try {

        const imgPath = await screenshot({ format: 'png' });

        const img = new Image();
        img.onload = () => {
            //ipcRenderer.send('log-sys', imgPath);
            const canvas = document.createElement('canvas');
            canvas.width = captureArea.width;
            canvas.height = captureArea.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, captureArea.x, captureArea.y, captureArea.width, captureArea.height, 0, 0, captureArea.width, captureArea.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            ipcRenderer.send('log-sys', captureArea);
            if (code) {
                console.log('QR Code detected:', code.data);
                const divoutput = document.getElementById('divoutput');
                divoutput.style.display = 'block';
                divoutput.innerText=code.data;
                setTimeout(() => {
                    divoutput.style.display = 'none';
                }, 4000);
                ipcRenderer.send('open-url', code.data);
            } else {
                console.log('No QR Code found');
            }
        };
        img.src = URL.createObjectURL(
            new Blob([imgPath.buffer], { type: 'image/png' } /* (1) */)
        );
    } catch (error) {
        console.error('Error capturing screen:', error);
    }
}