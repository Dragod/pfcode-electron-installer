const apps = document.getElementById("apps");

const filter = document.getElementById("myInput");

const loadConfigBtn = document.getElementById("loadConfig");

const install = document.getElementById("install");

const progressbar = document.getElementById("progressbar");

const progressbarHtml = `
<div class="w-full pt-4">
    <span class="text-white">Installing software, please wait...</span>
    <div class="w-full overflow-hidden">
    <div class="w-1/2 inline-block relative fluentProgressBar-waiting"></div>
    </div>
</div>`;

const code = document.getElementById("code");

const canvas = document.getElementById("canvas");

const qrc = document.getElementById("qrcode");

const generateQr = document.getElementById("generateQr")

const copyCmd = document.getElementById("copyCmd")

const qrcodeSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>`;

const isntallBtn = document.querySelector(".install-btn span");

const checkAll = document.getElementById("checkAll");

const uncheckAll = document.getElementById("uncheckAll");

const preset = document.getElementById("preset");

qrc.innerHTML = qrcodeSvg;

let installing, appCount, itemsList, checkboxes

// Display default apps

let data = loadConfig()

preset.innerHTML = `Default`

appCount = data.winget.length;

installing = data.winget.filter((app) => app.install === true);

appList(apps,data.winget, "label.program")

// Display apps from config file

loadConfigBtn.addEventListener("click", async () => {

  const configData = await window.config.json();

  preset.innerHTML = configData.preset;

  apps.innerHTML = "";

  appCount = configData.winget.length;

  installing = configData.winget.filter((app) => app.install === true);

  appList(apps, configData.winget)

  if(installing.length > 0) {

    install.disabled = false;

    generateQr.disabled = false;

    copyCmd.disabled = false;

    uncheckAll.disabled = false;

    checkAll.disabled = false;

  }
  else {

    install.disabled = true;

    generateQr.disabled = true;

    copyCmd.disabled = true;

    uncheckAll.disabled = true;

    checkAll.disabled = false;

  }

  if(installing.length === appCount) {

    checkAll.disabled = true;

    uncheckAll.disabled = false;

  }

  installButton(isntallBtn, installing, appCount);

  listenForChange(checkboxes);

  checkUncheck(true, checkAll, checkboxes);

  checkUncheck(false, uncheckAll, checkboxes);

});

installSoftware(".install:checked");

generateQrCode(".install:checked", "canvas", "qrcode");

copyCommand(".install:checked");

installButton(isntallBtn, installing, appCount);

listenForChange(checkboxes);

checkUncheck(true, checkAll, checkboxes);

checkUncheck(false, uncheckAll, checkboxes);

document.getElementById("clearOutput").onclick = function () {

  code.innerHTML = "";

  code.classList.remove("code-run");

};
