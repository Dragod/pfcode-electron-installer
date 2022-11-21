const generateQr = document.querySelector("#generateQr")

function generateQrCode(appData,canvasId, shellType) {

    const data = appData;

    console.log(data);

    const cmd = cmdToRun(data, shellType);

    console.log(cmd);

    (data.length <= 25) ?
    qrcode(canvasId, cmd) :
    alert('Data is too big to generate a QR Code, please select 25 or less apps.')

}

window.addEventListener("message", (event) => {

    if (event.source === window) {

        //console.log("from preload:", event.data);

        generateQrCode(event.data, "#canvas", "cmd");

    }

});