function loadConfig(configPath = null) {

    let data

    let defaultConfig = () => JSON.parse(fs.readFileSync('./config/default.json'));

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

function readCli(cmd) {

    Spawn.spawn("cmd.exe", ["/c", cmd], { shell: true, stdio: "inherit" });

    Spawn.onStdOut()

    Spawn.onStdErr()

    Spawn.onExit()

    window.addEventListener("message", (event) => {

        console.log(event.data)

        if (event.data === "Exit") {

            install.disabled = false;

            generateQr.disabled = false;

            copyCmd.disabled = false;

            progressbar.classList.add("invisible");

        }
        else {

            consoleLog("code", event.data)

        }

    })

}

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

function filterList() {

    let valueInput = document
        .querySelector("#myInput")
        .value.toLowerCase()
        .trim();

    for (let i = 0; i < itemsList.length; i++) {

        let item = itemsList[i];

        let value = item.innerText.toLowerCase().trim();

        item.style.display =
            value.search(new RegExp(valueInput.replace(/\s+/, "|"))) != -1
            ? ""
            : "none";
    }

}

function qrcode(id, qrcode, cmd) {

    let canvas = document.getElementById(id);

    let qr = document.getElementById(qrcode);

    canvas.classList.remove("hidden");

    qr.classList.add("hidden");

    QrCode.generate(canvas, cmd);

}

function appList(id, data) {

    data.forEach(app => {

        id.innerHTML += ` <label class="program mb-2 pb-2 text-gray-800" for="${app.id}">
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

    itemsList = document.querySelectorAll("label.program");

    filter.addEventListener("keyup", filterList);

    checkboxes = document.querySelectorAll('input[type="checkbox"]');

    matches = document.querySelectorAll('input[type="checkbox"]:not(:checked)')

}

function toInstall(input) { return [...document.querySelectorAll(input)].map((e) => e.value); }

function cmdToRun(data) {

    return `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${data
            .map((software) => software)
            .join(`; winget install -e -h --id=`)}`.replace(/;/g, " &&");

}

function installSoftware(checked) {

    install.onclick = async function () {

        progressbar.classList.remove("invisible");

        code.innerHTML = "";

        code.classList.add("code-run");

        const data = toInstall(checked);

        const cmd = cmdToRun(data);

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

function generateQrCode(checked,canvasId,qrId) {

    generateQr.onclick = function () {

        const data = toInstall(checked);

        const cmd = cmdToRun(data);

        console.log(cmd);

        (checked.length <= 25) ?
        qrcode(canvasId, qrId, cmd) :
        alert('Data is too big to generate a QR Code, please select 25 or less apps.')

    };

}

function copyCommand(checked) {

    copyCmd.onclick = () => {

        const data = toInstall(checked);

        const cmd = cmdToRun(data);

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

function installButton(id,installCount,appCount) {

    if (installCount.length !== undefined){

        id.innerHTML = `Install ${installCount.length}/${appCount} apps`;

    }
    else {

        id.innerHTML = `Install ${installCount}/${appCount} apps`;

    }

}

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

        code.classList.remove("code-run");

    };

}

// function toggleOnlyChecked() {

//     console.log("here");

//     toggle.addEventListener('click', function(e) {

//         e.preventDefault();

//         if (toggle.classList.contains('on')) {

//             toggle.classList.remove('on');

//             toggle.classList.add('off');

//             document.getElementById('toggle-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-toggle-off mr-2" viewBox="0 0 16 16">
//             <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z"/><span class="inline-flex self-center">Only checked</span>
//             </svg>`

//             checkboxes.forEach((checkbox) => {


//                 if(checkbox.checked === false) {

//                 checkbox.parentElement.classList.remove("hidden");

//                 }

//             });

//         } else if(toggle.classList.contains('off')) {

//             toggle.classList.remove('off');
//             toggle.classList.add('on');

//             document.getElementById('toggle-icon').innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" class="bi bi-toggle-on mr-2" viewBox="0 0 16 16">
//             <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
//             </svg><span class="inline-flex self-center">Only checked</span>
//             `

//             checkboxes.forEach((checkbox) => {

//                 if(checkbox.checked === false) {

//                 checkbox.parentElement.classList.add("hidden");

//                 }

//             });

//         }

//     });

// }

// function removeChecked(checkboxes) {


//     checkboxes.forEach((checkbox) => {

//         checkbox.addEventListener("change", () => {

//             if(checkbox.checked === true) {

//                 checkbox.parentElement.classList.add("hidden");

//             };

//         });

//     });

// }

