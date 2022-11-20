const apps = document.querySelector("#apps");

const filter = document.querySelector("#filterInput");

const loadConfigBtn = document.querySelector("#loadConfig");

const install = document.querySelector("#install");

const progressbar = document.querySelector("#progressbar");

const progressbarHtml = `
<div class="w-full pt-4">
    <span class="text-white text-sm">Installing software, please wait...</span>
    <div class="w-full overflow-hidden">
    <div class="w-1/2 inline-block relative fluentProgressBar-waiting"></div>
    </div>
</div>`;

const code = document.querySelector("#code");

const canvas = document.querySelector("#canvas");

const qrc = document.querySelector("#qrcode");

const generateQr = document.querySelector("#generateQr")

const copyCmd = document.querySelector("#copyCmd")

const qrcodeSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>`;

qrc.innerHTML = qrcodeSvg;

const isntallBtn = document.querySelector(".install-btn span");

const checkAll = document.querySelector("#checkAll");

const uncheckAll = document.querySelector("#uncheckAll");

const preset = document.querySelector("#preset");

const clear = document.querySelector("#clearOutput");

let toggle = document.querySelector('#toggle');

const toggleIcon = document.querySelector('#toggle-icon')

const wingetApi = document.querySelector("#wingetApi");

const github = document.querySelector("#github");

let installing, appCount, applicationList, checkboxes, matches, jsonPath;

function loadFromConfig(configData, load=true) {

  (load === true) ? preset.innerHTML = configData.preset : preset.innerHTML = "Default";

  apps.innerHTML = "";

  appCount = configData.winget.length;

  installing = configData.winget.filter((app) => app.install === true);

  appList(apps, configData.winget, "program")

  applicationList = document.querySelectorAll(".program");

  checkboxes = document.querySelectorAll('input[type="checkbox"]');

  filter.addEventListener("keyup", (e) => {

    e.preventDefault();

    filterList(applicationList,filter);

  });

  //matches = document.querySelectorAll('input[type="checkbox"]:not(:checked)')

  showHide(installing, appCount);

  installSoftware(".install:checked", "cmd");

  generateQrCode(".install:checked", "#canvas", "#qrcode", "cmd");

  copyCommand(".install:checked", "cmd");

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

wingetApi.addEventListener("click", () => { link.wingetRun(); });

github.addEventListener("click", () => { link.github(); });

document.addEventListener('keydown',async (event) => {

  const keyName = event.key;

  if (keyName === 'Control') { return; }

  if (event.ctrlKey && event.key === 'o') {

      const configData = await window.config.json();

      loadFromConfig(configData, true);

  }

  if (event.ctrlKey && event.key === 'l') { link.wingetRun(); }

  if (event.ctrlKey && event.key === 'f') {  filter.focus(); }

  if (event.ctrlKey && event.key === 'c') {  checkAll.click(); }

  if (event.ctrlKey && event.key === 'u') {  uncheckAll.click(); }

  if (event.ctrlKey && event.key === 'y') {  toggle.click(); }

  if (event.ctrlKey && event.key === 'i') {  isntallBtn.click(); }

  if (event.ctrlKey && event.key === 'q') {  generateQr.click(); }

  if (event.ctrlKey && event.key === 'g') {  copyCmd.click(); }

}, false);

toggle.addEventListener('click', function(e) {

  e.preventDefault();

  if (toggle.classList.contains('on')) {

    toggle.classList.remove('on');

    toggle.classList.add('off');

    checkAll.classList.remove("hidden");

    uncheckAll.classList.remove("hidden");

    toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-toggle-off mr-2" viewBox="0 0 16 16">
    <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z"/><span class="inline-flex self-center text-xs">Only checked</span>
    </svg>
    `;

    checkboxes.forEach((checkbox) => {

      (checkbox.checked === true) ?
      checkbox.disabled = false :
      checkbox.parentElement.classList.remove("hidden");

    });

  } else if (toggle.classList.contains('off')) {

    toggle.classList.remove('off');

    toggle.classList.add('on');

    checkAll.classList.add("hidden");

    uncheckAll.classList.add("hidden");

    toggleIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" class="bi bi-toggle-on mr-2" viewBox="0 0 16 16">
    <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
    </svg><span class="inline-flex self-center text-xs">Only checked</span>
    `

    checkboxes.forEach((checkbox) => {

      (checkbox.checked === true) ?
      checkbox.disabled = true :
      checkbox.parentElement.classList.add("hidden");

    });

  }

});