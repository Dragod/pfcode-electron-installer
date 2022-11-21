const generateQr = document.querySelector("#generateQr")

function generateQrCode(appData,canvasId, shellType) {

    const data = appData;

    console.log(data);

    const cmd = cmdToRun(data, shellType);

    console.log(cmd);

    qrcode(canvasId, cmd)


}

window.addEventListener("message", (event) => {

    if (event.source === window) {

        //console.log("from preload:", event.data);

        generateQrCode(event.data, "#canvas", "cmd");

    }

});