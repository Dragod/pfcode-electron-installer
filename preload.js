const { contextBridge, ipcRenderer, shell } = require("electron");

const fs = require("fs");

const copy = require("copy-to-clipboard");

let spawn = require("child_process").spawn,child;

const Toastify = require('toastify-js');

const path = require("path");

function toInstall(input) { return [...document.querySelectorAll(input)].map((e) => e.value); }

document.addEventListener("DOMContentLoaded", () => {

	document.querySelector("#generateQr").addEventListener("click", () => {

		let programs = toInstall(".install:checked");

		ipcRenderer.send("request-update-label-in-second-window", programs);

	});


}, false);

contextBridge.exposeInMainWorld("qrWindow", {

	open: () => { ipcRenderer.send("open-qr") }

});

contextBridge.exposeInMainWorld("path", {

	join: (filePath) => { return path.join(__dirname, filePath) },

});

contextBridge.exposeInMainWorld("link", {

	wingetRun: () => {

		let url = "https://winget.run/";

		shell.openExternal(url);

	},

	github: () => {

		let url = "https://github.com/Dragod/pfcode-electron-installer"

		shell.openExternal(url);

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

		if(result.winget === undefined) { ipcRenderer.send("config-winget", "Invalid file");}

		else if(result.winget.length === 0) { ipcRenderer.send("config-winget-empty", "Invalid file"); }

		else if(result.preset === "") { ipcRenderer.send("config-preset-empty", "Invalid file"); }

		else if(result.preset === undefined) { ipcRenderer.send("config-preset-undefined", "Invalid file"); }

		else {

			return result;

		}


	})

});
