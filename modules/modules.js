/**
 * If the configPath argument is null, then load the default config file, otherwise load the config
 * file at the path specified by the configPath argument.
 * @param [configPath=null] - The path to the config file. If null, the default config file will be
 * used.
 * @returns The data variable is being returned.
 */
function loadConfig(configPath = null) {

    let data = null;

    let defaultConfig = () => JSON.parse(fs.readFileSync(path.join('./config/default.json'), 'utf8'));

    (configPath === null) ? data = defaultConfig() : data = JSON.parse(fs.readFileSync(configPath));

    return data
}

/**
 * It displays a toast message with a red background and white text.
 * @param message - The message to display in the toast.
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
 * It takes two arguments, the first is the id of the div you want to output to, the second is the data
 * you want to output.
 *
 * The function then checks if the data is valid, and if it is, it outputs it to the div.
 *
 * The function also scrolls the div to the bottom when new content is added.
 * @param id - The id of the div you want to output to.
 * @param data - The data to be logged to the console.
 */
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

/**
 * It takes a command as a string and executes it in the command line
 * @param cmd - The command to be executed
 * @param [shellType=cmd.exe] - The type of shell you want to use.
 */
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

/**
 * If the length of the array returned by the toInstall function is greater than 0, then enable the
 * install, generateQr, copyCmd, and toggle buttons. Otherwise, disable them.
 * @param checked - the checkbox that was clicked
 */
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

/**
 * It takes a list of items and a search input, and hides the items that don't match the search input.
 * @param appList - The list of items to filter.
 * @param input - The input element that the user is typing into.
 */
function filterList(appList,input) {

    let inputValue = input.value.toLowerCase().trim();

    for (let i = 0; i < appList.length; i++) {

        let item = appList[i];

        let value = item.innerText.toLowerCase().trim();

        item.style.display = value.search(new RegExp(inputValue.replace(/\s+/, "|"))) != -1? "": "none";

    }

}

/**
 * It generates a QR code from the command line.
 * @param id - The id of the element you want to generate the QR code in.
 * @param cmd - The command to be executed.
 */
function qrcode(id, cmd) { QrCode.generate(document.querySelector(id), cmd); }

/**
 * The appList function takes in an id, data, and className, and then sets the innerHTML of the id to
 * an empty string, and then calls the appData function with the data, id, and className.
 * @param id - the id of the element you want to append the data to
 * @param data - the data you want to display
 * @param className - the class name of the element you want to create
 */
function appList(id, data, className) {

    id.innerHTML = "";

    appData(data, id, className)

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

/**
 * It checks if the checkboxes are checked or not, and if they are, it disables the check all button
 * and enables the uncheck all button, and if they are not, it enables the check all button and
 * disables the uncheck all button.
 * @param check - boolean
 * @param checkUncheck - the checkbox that will be clicked to check or uncheck all the checkboxes
 * @param checkboxes - the checkboxes to be checked or unchecked
 */
function checkUncheck(check, checkUncheck, checkboxes) {

    if (check === true) {

        checkUncheck.onclick = () => {

            checkboxes.forEach((checkbox) => {

                console.log(checkbox);

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

/**
 * If the length of the array is greater than 0, enable the buttons, else disable them
 * @param installing - the array of apps that are checked
 * @param appCount - The number of apps in the list.
 */
function showHide(installing,appCount) {

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

/**
 * It clears the console when the clear button is clicked
 */
function clearConsole() {

    clear.onclick = function () {

        code.innerHTML = "";

        code.classList.add("code-bg");

        code.classList.remove("code-run");

    };

}

/**
 * It sorts the data based on the type of sort you want.
 * @param data - The data you want to sort.
 * @param type - The type of sorting you want to do.
 * @returns The sorted data.
 */
function sortType(data, type) {

    if (type === "Az") {

        return data.sort((a, b) => (a.name > b.name) ? 1 : -1);

    }
    else if (type === "Za") {

        return data.sort((a, b) => (a.name < b.name) ? 1 : -1);

    }
    else if (type === "none") {

        return data.sort((a, b) => (a.appid > b.appid) ? 1 : -1);

    }
    else {

        return data.sort((a, b) => (a.appid > b.appid) ? 1 : -1);

    }

}

/**
 * It takes an array of objects, loops through them, and creates a label for each object.
 * @param data - The data that you want to loop through.
 * @param id - The id of the element you want to append the data to.
 * @param className - The class name of the label element.
 */
async function appData(data, id, className) {

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
        <span class="ellipsis">${app.name}</span>
        </label>`;

    });

    return await data;

}

/**
 * This function sorts the data alphabetically and then passes it to the appData function.
 * @param id - the id of the element you want to append the data to
 * @param data - the array of objects
 * @param className - the class name of the element you want to append the data to
 */
function sortAZ(id, data, className, load) {

    document.querySelector("#sortAZ").onclick = async () => {

        console.log("sortAZ");

        loadFromConfig(await appData(sortType(data, "Az"),id, className), load)

    };

};

/**
 * When the user clicks the sortZA button, the innerHTML of the id is set to an empty string, and the
 * appData function is called with the sortType function as an argument, which sorts the data
 * alphabetically Z-A by property, and the id and className are also passed as arguments.
 * @param id - the id of the div you want to append the data to
 * @param data - the array of objects
 * @param className - the class name of the element you want to create
 */
function sortZA(id, data, className, load) {

    document.querySelector("#sortZA").onclick = async () => {

        console.log("sortZA");

        // sort array alphabetically Z-A of objects by property

        loadFromConfig(await appData(sortType(data, "Za"),id, className), load)

        //appData(sortType(data, "Za"),id, className);

    };

}


/**
 * "When the user clicks the button, the function will sort the data by the sortType function, and then
 * load the data into the DOM."
 *
 * The function is called in the following way:
 * @param id - the id of the div you want to load the data into
 * @param data - the data to be sorted
 * @param className - the class name of the element you want to sort
 * @param [load=true] - true/false
 */
function noSort(id, data, className, load = true) {

    document.querySelector("#noSort").onclick = async () => {

        console.log("no sort");

        // remove array sort

        loadFromConfig(await appData(sortType(data, "none"),id, className), load)

        //appData(sortType(data, "none"),id, className);

    };

}