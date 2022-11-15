const apps = document.getElementById("apps");

const filter = document.getElementById("myInput");

const loadConfigBtn = document.getElementById("loadConfig");

const install = document.getElementById("install");

const progressbar = document.getElementById("progressbar");

const progressbarHtml = `
<div class="w-full pt-4">
    <span class="text-white text-sm">Installing software, please wait...</span>
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

const clear = document.getElementById("clearOutput");

let toggle = document.querySelector('#toggle');

const undo = document.getElementById("undoOnly");

const wingetApi = document.getElementById("wingetApi");

const github = document.getElementById("github");

qrc.innerHTML = qrcodeSvg;

let installing, appCount, itemsList, checkboxes, matches, category, jsonData

function loadFromConfig(configData, load=true) {

  (load === true) ? preset.innerHTML = configData.preset : preset.innerHTML = "Default";

  apps.innerHTML = "";

  appCount = configData.winget.length;

  installing = configData.winget.filter((app) => app.install === true);

  appList(apps, configData.winget)

  showHide(installing, appCount);

  installSoftware(".install:checked");

  generateQrCode(".install:checked", "canvas", "qrcode");

  copyCommand(".install:checked");

  installButton(isntallBtn, installing, appCount);

  listenForChange(checkboxes);

  checkUncheck(true, checkAll, checkboxes);

  checkUncheck(false, uncheckAll, checkboxes);

  clearConsole();

}

let data = loadConfig()

loadFromConfig(data, false);

// Display apps from config file

loadConfigBtn.addEventListener("click", async () => {

  const configData = await window.config.json();

  loadFromConfig(configData, true);

});

wingetApi.addEventListener("click", () => {

  link.wingetRun();

});

github.addEventListener("click", () => {

  link.github();

});

document.addEventListener('keydown',async (event) => {

  const keyName = event.key;

  if (keyName === 'Control') {

    return;

  }

  if (event.ctrlKey && event.key === 'o') {

      const configData = await window.config.json();

      loadFromConfig(configData, true);

  }

  if (event.ctrlKey && event.key === 'l') {

    link.wingetRun();

}

}, false);

toggle.addEventListener('click', function(e) {

  e.preventDefault();

  if (toggle.classList.contains('on')) {

      toggle.classList.remove('on');

      toggle.classList.add('off');

      checkAll.classList.remove("hidden");

      uncheckAll.classList.remove("hidden");

      document.getElementById('toggle-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-toggle-off mr-2" viewBox="0 0 16 16">
      <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z"/><span class="inline-flex self-center text-xs">Only checked</span>
    </svg>`

      checkboxes.forEach((checkbox) => {

        if(checkbox.checked === true) {

          checkbox.disabled = false;

        }

        if(checkbox.checked === false) {

          checkbox.parentElement.classList.remove("hidden");

        }

      });

  } else if(toggle.classList.contains('off')) {

      toggle.classList.remove('off');

      toggle.classList.add('on');

      checkAll.classList.add("hidden");

      uncheckAll.classList.add("hidden");

      document.getElementById('toggle-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-toggle-on mr-2" viewBox="0 0 16 16">
      <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
    </svg><span class="inline-flex self-center text-xs">Only checked</span>
    `

      checkboxes.forEach((checkbox) => {

        if(checkbox.checked === true) {

          checkbox.disabled = true;

        }

        if(checkbox.checked === false) {

          checkbox.parentElement.classList.add("hidden");

      }

      });

  }

});