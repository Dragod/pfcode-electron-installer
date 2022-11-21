
const { contextBridge, ipcRenderer } = require("electron");

const qrCode = require("qrcode");

ipcRenderer.on("action-update-label", (event, data) => {

    window.postMessage(data, "*");

})

contextBridge.exposeInMainWorld("QrCode", {

	generate: (id,cmd) => { qrCode.toCanvas(id, cmd, function (error) {

			if(error) { ipcRenderer.send("open-error-dialog", error) }

			console.log('QrCode created');

		})
	},

});
