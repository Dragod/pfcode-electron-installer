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

            checkboxes.forEach((checkbox) => (checkbox.disabled = false));

            checkAll.disabled = true;

            uncheckAll.disabled = false;

            toggle.disabled = false;

            //

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

            //

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

function qrcode(id, cmd) {QrCode.generate(document.querySelector(id), cmd);}

function appList(id, data, className) {

    data.forEach(app => {

        id.innerHTML += `<label class="${className} inline-flex unselectable cursor-pointer px-4 py-2" for="${app.name}" title="${app.description}">
        <input
        id="${app.name}"
        class="install form-check-label inline-block text-gray-800 mr-2"
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

        checkboxes.forEach((checkbox) => (checkbox.disabled = true));

        checkAll.disabled = true;

        uncheckAll.disabled = true;

        toggle.disabled = true;

        //

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

        //

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

        copyCmd.classList.remove("hidden");

        //progressbar.innerHTML = progressbarHtml;

        readCli(cmd);

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

