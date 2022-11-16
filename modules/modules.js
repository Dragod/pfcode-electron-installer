function loadConfig(configPath = null) {

    let data = null;

    let defaultConfig = () => JSON.parse(fs.readFileSync(path.join('./config/default.json'), 'utf8'));

    (configPath === null) ? data = defaultConfig() : data = JSON.parse(fs.readFileSync(configPath));

    return data
}

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

function consoleLog(id,data) {

    let code = document.querySelector(id);

    const unwanted_chars_regex = /[^a-zA-Z0-9,:;\-.?! ]/g;

    const clean_string = data.toString().replace(unwanted_chars_regex, "");

    if (clean_string !== "-" && clean_string !== "   -" && clean_string !== "") {

        code.innerHTML += `<p id="data" class="flex">${clean_string}</p>`;

    }

    //Scroll output div when new content is added dynamically

    code.scrollTop = code.scrollHeight;

}

function readCli(cmd, shellType= 'cmd.exe') {

    Spawn.spawn(shellType, ["/c", cmd], { shell: true, stdio: "inherit" });

    Spawn.onStdOut()

    Spawn.onStdErr()

    Spawn.onExit()

    window.addEventListener("message", (event) => {

        if (event.data === "Exit") {

            install.disabled = false;

            generateQr.disabled = false;

            copyCmd.disabled = false;

            progressbar.classList.add("invisible");

        }
        else {

            console.log(event.data)

            consoleLog("#code", event.data)

        }

    })

}

function chkChecked(checked) {

    const chk = toInstall(checked);

    if (chk.length > 0) {

        install.disabled = false;

        generateQr.disabled = false;

        copyCmd.disabled = false;

        toggle.disabled = false;

    }
    else {

        install.disabled = true;

        generateQr.disabled = true;

        copyCmd.disabled = true;

        toggle.disabled = true;

        canvas.classList.add("hidden");

        qrc.classList.remove("hidden");

        copyCmd.classList.remove("hidden");

    }

}

function filterList(appList,input) {

    let inputValue = input.value.toLowerCase().trim();

    for (let i = 0; i < appList.length; i++) {

        let item = appList[i];

        let value = item.innerText.toLowerCase().trim();

        item.style.display = value.search(new RegExp(inputValue.replace(/\s+/, "|"))) != -1? "": "none";

    }

}

function qrcode(id, qrcode, cmd) {

    const canvas = document.querySelector(id)

    canvas.classList.remove("hidden")

    document.querySelector(qrcode).classList.add("hidden");

    QrCode.generate(canvas, cmd);

}

function appList(id, data, className) {

    data.forEach(app => {

        id.innerHTML += `<label class="${className} py-2 text-gray-800" for="${app.id}">
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

}

/**
 * It takes a CSS selector as input, and returns an array of all the values of the elements that match
 * the selector
 * @param input - The CSS selector for the input elements.
 * @returns An array of all the values of the elements that match the input.
 */
function toInstall(input) { return [...document.querySelectorAll(input)].map((e) => e.value); }

/**
 * It takes an array of strings and a string and returns a string.
 * @param data - An array of strings that are the names of the apps you want to install.
 * @param shellType - The type of shell you want to use.
 * @returns a string that is a command to run in the shell.
 */
function cmdToRun(data, shellType) {

    const winget =`winget install -e -h --accept-source-agreements --accept-package-agreements --id`

    let concat;

    if (shellType === "cmd") {

        concat = " &&";
    }
    else if (shellType === "powershell") {

        concat = ";";
    }
    else {

        throw new Error("Shell type not supported");

    }

    return `${winget} ${data.map((app) => app).join(`${concat} ${winget}=`)}`

}

/**
 * It takes two arguments, one is an array of strings and the other is a string. It then returns a
 * string.
 * @param checked - an array of the software to install
 * @param shellType - bash or zsh
 */
function installSoftware(checked, shellType) {

    install.onclick = async function () {

        code.classList.remove("code-bg");

        progressbar.classList.remove("invisible");

        code.innerHTML = "";

        code.classList.add("code-run");

        const data = toInstall(checked);

        const cmd = cmdToRun(data, shellType);

        console.log(cmd);

        install.disabled = true;

        generateQr.disabled = true;

        copyCmd.disabled = true;

        canvas.classList.add("hidden");

        qrc.classList.remove("hidden");

        copyCmd.classList.remove("hidden");

        progressbar.innerHTML = progressbarHtml;

        readCli(cmd);

    };

}

/**
 * It takes the checked array, and passes it to the toInstall function, which returns a string of the
 * checked array, then it passes that string to the cmdToRun function, which returns a string of the
 * command to run, then it passes that string to the qrcode function, which generates a QR code.
 * @param checked - an array of the checked checkboxes
 * @param canvasId - the id of the canvas element in the html
 * @param qrId - the id of the div where the qr code will be generated
 * @param shellType - the type of shell you want to use, cmd or powershell
 */
function generateQrCode(checked,canvasId,qrId, shellType) {

    generateQr.onclick = function () {

        const data = toInstall(checked);

        const cmd = cmdToRun(data, shellType);

        console.log(cmd);

        (checked.length <= 25) ?
        qrcode(canvasId, qrId, cmd) :
        alert('Data is too big to generate a QR Code, please select 25 or less apps.')

    };

}

/**
 * It takes two arguments, the first is an array of checked checkboxes, the second is the shell type.
 * It then returns a string of the command to run
 * @param checked - an array of the checked checkboxes
 * @param shellType - The type of shell you want to use, cmd or powershell
 */
function copyCommand(checked, shellType) {

    copyCmd.onclick = () => {

        const data = toInstall(checked);

        const cmd = cmdToRun(data, shellType);

        console.log(cmd);

        Copy.clipboard(
            cmd,
            {
                debug: true,
                message: "Press #{key} to copy",
            }
        );

    };

}

/**
 * @param id - the id of the button
 * @param installCount - The total number of apps that are available to install.
 * @param appCount - This is the number of apps that are available.
 */
function installButton(id,installCount,appCount) {

    if (installCount.length !== undefined){

        id.innerHTML = `Install ${installCount.length}/${appCount} apps`;

    }
    else {

        id.innerHTML = `Install ${installCount}/${appCount} apps`;

    }

}

/**
 * The function listens for a change in the checkbox, then it checks if the checkbox is checked or not,
 * if it is checked it pushes the value of the checkbox into an array, then it checks if the array is
 * empty or not, if it is empty it disables the uncheckAll button, if the array is not empty it enables
 * the uncheckAll button, then it checks if the length of the array is equal to the length of the
 * checkboxes, if it is equal it disables the checkAll button, if it is not equal it enables the
 * checkAll button, then it calls the installButton function.
 * @param checkboxes - the checkboxes that are being checked/unchecked
 */
function listenForChange(checkboxes) {

    checkboxes.forEach((checkbox) => {

        checkbox.addEventListener("change", () => {

            uncheckAll.disabled = false;

            checkAll.disabled = false;

            chkChecked('.install:checked');


            let checked = [];

            checkboxes.forEach((checkbox) => {

            if (checkbox.checked) {

                checked.push(checkbox.value);

            }

            });

            console.log(checked);

            if(checked.length === 0){

                uncheckAll.disabled = true;

                checkAll.disabled = false;

                toggle.disabled = true;

            }
            if(checkboxes.length === checked.length){

                uncheckAll.disabled = false;

                checkAll.disabled = true;

                toggle.disabled = true;

            }

            installButton(isntallBtn, checked, appCount);

        });
});

}

function checkUncheck(check, checkUncheck, checkboxes) {

    if (check === true) {

        checkUncheck.onclick = () => {

            checkboxes.forEach((checkbox) => {

                checkbox.checked = true;

                chkChecked('.install:checked');

                console.log(appCount);

                installButton(isntallBtn, appCount, appCount);

                checkAll.disabled = true;

                uncheckAll.disabled = false;

                toggle.disabled = true;

            });

        }

    }
    else {

        checkUncheck.onclick = () => {

            checkboxes.forEach((checkbox) => {

                checkbox.checked = false;

                chkChecked('.install:checked');

                installButton(isntallBtn, 0, appCount);

                checkAll.disabled = false;

                uncheckAll.disabled = true;

                toggle.disabled = true;

            });

        }

    }

}

function showHide(installing,appCount){

    if (installing.length > 0) {

        install.disabled = false;

        generateQr.disabled = false;

        copyCmd.disabled = false;

        uncheckAll.disabled = false;

        checkAll.disabled = false;

        toggle.disabled = false;

    }
    else {

        install.disabled = true;

        generateQr.disabled = true;

        copyCmd.disabled = true;

        uncheckAll.disabled = true;

        checkAll.disabled = false;

        toggle.disabled = true;

    }

    if(installing.length === appCount) {

        checkAll.disabled = true;

        uncheckAll.disabled = false;

        toggle.disabled = true;

    }
}

function clearConsole() {

    clear.onclick = function () {

        code.innerHTML = "";

        code.classList.add("code-bg");

        code.classList.remove("code-run");

    };

}

