const { contextBridge, ipcRenderer } = require("electron");

const fs = require("fs");

const copy = require("copy-to-clipboard");

let spawn = require("child_process").spawn,child;

const Toastify = require('toastify-js');

const qrCode = require("qrcode");

contextBridge.exposeInMainWorld("QrCode", {

	generate: (id,cmd) => { qrCode.toCanvas(id, cmd, function (error) {

		if (error) console.error(error);

			console.log('QrCode created!');

		})
	},

});

contextBridge.exposeInMainWorld('fs', {

	readFileSync: (path) => fs.readFileSync(path, 'utf-8'),
	writeFileSync: (path, data) => fs.writeFileSync(path, data)

})

contextBridge.exposeInMainWorld('Spawn', {

	spawn: (path,cmd) => {child = spawn(path, [cmd]);},

	onStdOut: () => {

		child.stdout.on("data",  function (data) {

			window.postMessage(data.toString(), "*");
			//return data.toString()

		});

	},

	onStdErr: () => {

		child.stderr.on("data", function (data) {

			window.postMessage(data.toString(), "*");
			//return data.toString()

		});

	},

	onExit: () => {

		child.on("exit", function () {

			window.postMessage("Exit", "*");
			//return "Exit"

		});

	},

	onClose: () => {

		child.on("close", function (code) {

			window.postMessage("child process exited with code " + code, "*");

		});

	},

})

contextBridge.exposeInMainWorld('Copy', {

	clipboard: (data) => copy(data)

})

contextBridge.exposeInMainWorld('Toastify', {

	toast: (options) => Toastify(options).showToast(),

});

contextBridge.exposeInMainWorld("config", {

	json: async () => ipcRenderer.invoke("dialog:openFile").then(result => {

		if(result === undefined) { throw new Error("No file selected"); }

		return result;

	})

});
