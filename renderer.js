const apps = document.querySelector("#apps");

const filter = document.querySelector("#filterInput");

const loadConfigBtn = document.querySelector("#loadConfig");

const install = document.querySelector("#install");

const progressbar = document.querySelector("#progressbar");

const code = document.querySelector("#code");

const generateQr = document.querySelector("#generateQr")

const copyCmd = document.querySelector("#copyCmd")

const isntallBtn = document.querySelector(".install-btn span");

const checkAll = document.querySelector("#checkAll");

const uncheckAll = document.querySelector("#uncheckAll");

const preset = document.querySelector("#preset");

const clear = document.querySelector("#clearOutput");

let toggle = document.querySelector('#toggle');

const toggleIcon = document.querySelector('#toggle-icon')

const wingetApi = document.querySelector("#wingetApi");

const github = document.querySelector("#github");

const sortAz = document.querySelector("#sortAZ");

const sortZa = document.querySelector("#sortZA");

const sortId = document.querySelector("#noSort");

// Default sort button active class

sortId.classList.add("bg-blue-800");

let installing,
    appCount,
    applicationList,
    checkboxes,
    matches,
    jsonPath,
    data;

sortId.classList.add("active");

async function loadFromConfig(configData, load = true) {

  if (configData === false) {

    console.log("configData is false");

    return;

  }

  // Do not override preset if it's empty

  (configData.preset !== undefined) ?  (load === true) ? preset.innerHTML = configData.preset : preset.innerHTML = "Default" : null;

  // Handle data coming from sorting functions

  data = (configData.winget) ? configData.winget : configData

  appCount = data.length;

  installing = data.filter((app) => app.install === true);

  appList(apps, data, "program")

  applicationList = document.querySelectorAll(".program");

  checkboxes = document.querySelectorAll('input[type="checkbox"]');

  filter.addEventListener("keyup", (e) => {

    e.preventDefault();

    filterList(applicationList,filter);

  });

  //matches = document.querySelectorAll('input[type="checkbox"]:not(:checked)')

  showHide(installing, appCount);

  installSoftware(".install:checked", "cmd");

  copyCommand(".install:checked", "cmd");

  installButton(isntallBtn, installing, appCount);

  listenForChange(checkboxes);

  checkUncheck(true, checkAll, checkboxes);

  checkUncheck(false, uncheckAll, checkboxes);

  clearConsole();

}

loadFromConfig(loadConfig(), false);

sortAZ(sortAz,apps, data, "program", false);

sortZA(sortZa,apps, data, "program", false);

noSort(sortId,apps, data, "program", false);


// Display apps from config file

loadConfigBtn.addEventListener("click", async () => {

  loadFromConfig(await window.config.json(), true);

  sortAZ(sortAz,apps, data, "program", true);

  sortZA(sortZa,apps, data, "program", true);

  noSort(sortId,apps, data, "program", true);

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
