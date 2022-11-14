
/**
 * If the configPath argument is null, then the default config is loaded, otherwise the config at the
 * specified path is loaded.
 * </code>
 * @param [configPath=null] - The path to the config file. If null, it will use the default config
 * file.
 * @returns The data variable is being returned.
 */
function loadConfig(configPath = null) {

  let data

  let defaultConfig = () => JSON.parse(fs.readFileSync('./config/default.json'));

  (configPath === null) ? data = defaultConfig() : data = JSON.parse(fs.readFileSync(configPath));

  return data
}

/**
 * It displays a toast message with a red background and white text.
 * @param message - The message you want to display.
 */
function alertError(message) {

  Toastify.toast({

    text: message,
    duration: 5000,
    close: false,
    style: {
      background: 'red',
      color: 'white',
      textAlign: 'center',
    },

  });

}

/**
 * It takes a command as an argument and executes it in the command prompt.
 * @param cmd - The command to run
 */
function readCli(cmd) {

  Spawn.spawn("cmd.exe", ["/c", cmd], { shell: true, stdio: "inherit" });

  Spawn.onStdOut()

  Spawn.onStdErr()

  Spawn.onExit()

  window.addEventListener("message", (event) => {

    console.log(event.data)

    if (event.data === "Exit") {

      document.getElementById("install").disabled = false;

			document.getElementById("generateQr").disabled = false;

			document.getElementById("copyCmd").disabled = false;

			document.getElementById("progressbar").classList.add("invisible");

    }
    else {
      consoleLog("code", event.data)
    }

  })

}

/**
 * It takes two arguments, the first is the id of the div you want to append the data to, the second is
 * the data you want to append.
 *
 * The function then creates a variable called code and assigns it the value of the div you want to
 * append the data to.
 *
 * The function then creates a variable called cData and assigns it the value of the data you want to
 * append.
 *
 * The function then creates a variable called unwanted_chars_regex and assigns it the value of a
 * regular expression that matches any character that is not a letter, number, comma, colon,
 * semi-colon, hyphen, period, question mark, or exclamation point.
 *
 * The function then creates a variable called clean_string and assigns it the value of the cData
 * variable with all of the unwanted characters removed.
 *
 * The function then checks to see if the clean_string variable is
 * @param id - The id of the div you want to output to
 * @param data - The data to be logged to the console.
 */
function consoleLog(id,data) {

  let code = document.getElementById(id);

  let cData = data.toString();

  const unwanted_chars_regex = /[^a-zA-Z0-9,:;\-.?! ]/g;

  const clean_string = cData.replace(unwanted_chars_regex, "");

  if (clean_string !== "-" && clean_string !== "   -" && clean_string !== "") {
    code.innerHTML += `<p id="data" class="flex">${clean_string}</p>`;
  }

  //Scroll output div when new content is added dynamically

  code.scrollTop = code.scrollHeight;
}

/**
 * If any checkboxes are checked, enable the buttons. If no checkboxes are checked, disable the buttons
 */
function chkChecked() {
  const checked = [...document.querySelectorAll(".install:checked")].map(
    (e) => e.value
  );

  if (checked.length > 0) {
    document.getElementById("install").disabled = false;

    document.getElementById("generateQr").disabled = false;

    document.getElementById("copyCmd").disabled = false;
  } else {
    document.getElementById("install").disabled = true;

    document.getElementById("generateQr").disabled = true;

    document.getElementById("copyCmd").disabled = true;

    document.getElementById("canvas").classList.add("hidden");

    document.getElementById("qrcode").classList.remove("hidden");

    document.getElementById("copyCmd").classList.remove("hidden");
  }
}

/**
 * It takes the value of the input, and compares it to the text of each list item. If the text of the
 * list item contains the value of the input, it displays the list item. If not, it hides it.
 */
function filterList() {
  let valueInput = document
    .querySelector("#myInput")
    .value.toLowerCase()
    .trim();

  for (let i = 0; i < itensList.length; i++) {
    let item = itensList[i];

    let value = item.innerText.toLowerCase().trim();

    item.style.display =
      value.search(new RegExp(valueInput.replace(/\s+/, "|"))) != -1
        ? ""
        : "none";
  }
}

/**
 * It takes the id of a canvas element, the id of a qrcode element, and a command, and then it hides
 * the qrcode element and shows the canvas element, and then it generates a QR code on the canvas
 * element using the command.
 * @param id - The id of the canvas element
 * @param qrcode - The id of the canvas element
 * @param cmd - The command to be executed
 */
function qrcode(id, qrcode, cmd) {

  let canvas = document.getElementById(id);

  let qr = document.getElementById(qrcode);

  canvas.classList.remove("hidden");

  qr.classList.add("hidden");

  QrCode.generate(canvas, cmd);
}

const apps = document.getElementById("apps");

// Dialog to select config file

const btn = document.getElementById("btn");
const filePathElement = document.getElementById("filePath");

document.getElementById("code")

btn.addEventListener("click", async () => {

  const filePath = await window.config.json();

  console.log(filePath);

  //if (!(filePath !== null)) filePathElement.innerText = filePath;

});

let data = loadConfig();

let winget = data.winget;

let appCount = data.winget.length;

let installing = winget.filter((app) => app.install === true);

winget.forEach(app => {

  apps.innerHTML+= ` <label class="program mb-2 pb-2 text-gray-800" for="${app.id}">
  <input
    class="install form-check-label inline-block text-gray-800"
    type="checkbox"
    ${app.install === true ? "checked" : ""}
    name="${app.name}"
    value="${app.id}"
  />
  ${app.name}
  </label>`;

});

document.getElementById("install").onclick = async function () {

  document.getElementById("progressbar").classList.remove("invisible");

  document.getElementById("code").innerHTML = "";

  document.getElementById("code").classList.add("code-run");

  const data = [...document.querySelectorAll(".install:checked")].map(
    (e) => e.value
  );

  const cmdToRun =
    `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${data
      .map((software) => software)
      .join(`; ${data.wingetInstall}`)}`.replace(/;/g, " &&");

  //runCmd(cmdToRun)

  document.getElementById("install").disabled = true;

  document.getElementById("generateQr").disabled = true;

  document.getElementById("copyCmd").disabled = true;

  document.getElementById("canvas").classList.add("hidden");

  document.getElementById("qrcode").classList.remove("hidden");

  document.getElementById("copyCmd").classList.remove("hidden");

  document.getElementById("progressbar").innerHTML = `
  <div class="w-full pt-4">
    <span class="text-white">Installing software, please wait...</span>
    <div class="w-full overflow-hidden">
      <div class="w-1/2 inline-block relative fluentProgressBar-waiting"></div>
    </div>
  </div>`;

  readCli(cmdToRun);
};

let itensList = document.querySelectorAll("label.program");

document.getElementById("myInput").addEventListener("keyup", filterList);

let checkboxes = document.querySelectorAll('input[type="checkbox"]');

const isntallBtn = document.querySelector(".install-btn span");

isntallBtn.innerHTML = `Install ${installing.length}/${appCount} apps`;

checkboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    uncheckAll.disabled = false;

    checkAll.disabled = false;

    chkChecked();

    let checked = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        checked.push(checkbox.value);
      }
    });

    console.log(checked);

    isntallBtn.innerHTML = `Install ${checked.length}/${appCount} apps`;
  });
});

document.getElementById("clearOutput").onclick = function () {
  document.getElementById("code").innerHTML = "";

  document.getElementById("code").classList.remove("code-run");
};


let checkAll = document.getElementById("checkAll");

let uncheckAll = document.getElementById("uncheckAll");

uncheckAll.onclick = function () {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });

  chkChecked();

  isntallBtn.innerHTML = `Install 0/${appCount} apps`;

  uncheckAll.disabled = true;
  checkAll.disabled = false;
};

checkAll.onclick = function () {
  checkboxes.forEach((checkbox) => {
    checkbox.checked = true;
  });

  chkChecked();

  isntallBtn.innerHTML = `Install ${appCount}/${appCount} apps`;

  checkAll.disabled = true;
  uncheckAll.disabled = false;
};

const qrc = document.getElementById("qrcode");

const qrcodeSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>`;

qrc.innerHTML = qrcodeSvg;

document.getElementById("generateQr").onclick = function () {
  const checked = [...document.querySelectorAll(".install:checked")].map(
    (e) => e.value
  );

  const cmdToRun =
    `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${checked
      .map((software) => software)
      .join(`; ${data.wingetInstall}`)}`.replace(/;/g, " &&");

  if (checked.length <= 25) {
    qrcode("canvas", "qrcode", cmdToRun);
  } else {
    alert('Data is too big to generate a QR Code, please select 25 or less apps.')
    //ipcRenderer.send("open-error-dialog");
  }
};

document.getElementById("copyCmd").onclick = function () {
  const checked = [...document.querySelectorAll(".install:checked")].map(
    (e) => e.value
  );

  const cmdToRun =
    `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${checked
      .map((software) => software)
      .join(`; ${data.wingetInstall}`)}`.replace(/;/g, " &&");

  Copy.clipboard(cmdToRun, {
    debug: true,
    message: "Press #{key} to copy",
  });
};






















