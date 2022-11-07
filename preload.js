/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */

const fs = require('fs')

const copy = require('copy-to-clipboard');

const jsonFile = './programs.json'

const json = () => JSON.parse(fs.readFileSync(jsonFile))

const data = json()

const winget = data.winget

const appCount = data.winget.length

let installing = winget.filter(program => program.install === true)

const qrcodeSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>`

  async function runCmd(cmd) {

  let spawn = require("child_process").spawn,child

  child = spawn("cmd.exe",['/c', cmd])

  child.stdout.on("data",async function(data){

    consoleLog(data)

  })

  child.stderr.on("data",function(data){

    console.log("Powershell Errors: " + data)

  })

  child.on("exit",function(){

    console.log("Winget has finished running")

    document.getElementById('install').disabled = false

    document.getElementById('generateQr').disabled = false

    document.getElementById('copyCmd').disabled = false

    document.getElementById('progressbar').classList.add('invisible')

  })

}

function consoleLog(data) {

  let code = document.getElementById('code')

  let cData = data.toString()

  const unwanted_chars_regex =/[^a-zA-Z0-9,:;\-.?! ]/g

  const clean_string = cData.replace(unwanted_chars_regex, '');

  if(clean_string !== '-' && clean_string !== '   -' && clean_string !== '') {

    code.innerHTML += `<p id="data" class="flex">${clean_string}</p>`

  }

  //Scroll output div when new content is added dynamically

  let elem = document.getElementById('code');

  elem.scrollTop = elem.scrollHeight;
}

function qrcode(id,qrcode,cmd) {

  let QRCode = require('qrcode')

  let canvas = document.getElementById(id)

  let qr = document.getElementById(qrcode)

  canvas.classList.remove('hidden')

  qr.classList.add('hidden')

  QRCode.toCanvas(canvas, cmd, function (error) {

    if (error) console.error(error)

    console.log('Qrcode created!')

  })
}

function chkChecked() {

  const checked = [...document.querySelectorAll('.install:checked')].map(e => e.value)

  if(checked.length > 0) {

    document.getElementById('install').disabled = false

    document.getElementById('generateQr').disabled = false

    document.getElementById('copyCmd').disabled = false

  } else {

    document.getElementById('install').disabled = true

    document.getElementById('generateQr').disabled = true

    document.getElementById('copyCmd').disabled = true

    document.getElementById('canvas').classList.add('hidden')

    document.getElementById('qrcode').classList.remove('hidden')

    document.getElementById('copyCmd').classList.remove('hidden')

  }

}

function showOnlyChecked() {

  const checked = [...document.querySelectorAll('.install:checked')].map(e => e.value)

  if(checked.length > 0) {

    document.getElementById('install').disabled = false

    document.getElementById('generateQr').disabled = false

    document.getElementById('copyCmd').disabled = false

  }

}

window.addEventListener('DOMContentLoaded', () => {

  const apps = document.getElementById('apps')

  const qrc = document.getElementById('qrcode')

  console.log(qrc);

  qrc.innerHTML = qrcodeSvg

  function filterList() {

    let valueInput = document.querySelector('#myInput').value.toLowerCase().trim()

    for(let i = 0; i < itensList.length; i++){

            let item = itensList[i]

            let valueLi = item.innerText.toLowerCase().trim()

            item.style.display = valueLi.search(new RegExp(valueInput.replace(/\s+/, '|'))) != -1 ? '' : 'none'

        }

    }

  winget.forEach(program => {

    if(program.install === true) {

      apps.innerHTML += `
                          <label class="program mb-2 pb-2 text-gray-800" for="${program.id}">
                            <input
                              class="install form-check-label inline-block text-gray-800"
                              type="checkbox"
                              checked
                              name="${program.name}"
                              value="${program.id}"
                            />
                            ${program.name}
                          </label>
                        `

    }
    else {

      apps.innerHTML += `
                          <label class="program mb-2 pb-2 text-gray-800" for="${program.id}">
                            <input
                              class="install form-check-label inline-block text-gray-800"
                              type="checkbox"
                              name="${program.name}"
                              value="${program.id}"
                              />
                              ${program.name}
                            </label>
                          `

    }

  })

  let itensList = document.querySelectorAll('label.program')

  document.getElementById("myInput").addEventListener("keyup", filterList)

  let checkboxes= document.querySelectorAll('input[type="checkbox"]')

  const isntallBtn = document.querySelector('.install-btn span')

  isntallBtn.innerHTML = `Install ${installing.length}/${appCount} apps`

  checkboxes.forEach(checkbox => {


    checkbox.addEventListener('change', () => {

      chkChecked()

      let checked = []

      checkboxes.forEach(checkbox => {

        if(checkbox.checked) {

          checked.push(checkbox.value)

        }

      })

      console.log(checked)

      isntallBtn.innerHTML = `Install ${checked.length}/${appCount} apps`

    })

  })

  document.getElementById('install').onclick = async function() {

    document.getElementById('progressbar').classList.remove('invisible')

    document.getElementById('code').innerHTML = ''

    document.getElementById('code').classList.add('code-run')

    const data = [...document.querySelectorAll('.install:checked')].map(e => e.value)

    // const cmdToRun = `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${data.map(software => software)
    //   .join(`; ${data.wingetInstall}`)}`
    //   .replace(/;/g, ' &&')

    const cmdToRun = `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${data.map(software => software)
      .join(`; ${data.wingetInstall}`)}`
      .replace(/;/g, ' &&')

      //runCmd(cmdToRun)

      document.getElementById('install').disabled = true

      document.getElementById('generateQr').disabled = true

      document.getElementById('copyCmd').disabled = true

      document.getElementById('canvas').classList.add('hidden')

      document.getElementById('qrcode').classList.remove('hidden')

      document.getElementById('copyCmd').classList.remove('hidden')

      document.getElementById('progressbar').innerHTML = `
      <div class="w-full pt-4">
      <span class="text-white">Installing software, please wait...</span>
      <div class="w-full overflow-hidden">
      <div class="w-1/2 inline-block relative fluentProgressBar-waiting"></div>
      </div>
      </div>`

      await runCmd(cmdToRun)
  }

  document.getElementById('generateQr').onclick = function() {

    const checked = [...document.querySelectorAll('.install:checked')].map(e => e.value)

    const cmdToRun = `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${checked.map(software => software)
      .join(`; ${data.wingetInstall}`)}`
      .replace(/;/g, ' &&')

    if(checked.length <= 25) {

      qrcode("canvas","qrcode",cmdToRun)
    }
    else {

        alert('Data is too big to generate a QR Code, please select 25 or less apps.')
    }

  }

  document.getElementById("copyCmd").onclick = function ()
	{

    const checked = [...document.querySelectorAll('.install:checked')].map(e => e.value)

    const cmdToRun = `winget install -e -h --accept-source-agreements --accept-package-agreements --id ${checked.map(software => software)
      .join(`; ${data.wingetInstall}`)}`
      .replace(/;/g, ' &&')

		copy(cmdToRun, {
			debug: true,
			message: 'Press #{key} to copy',
		});
  }

  document.getElementById('clearOutput').onclick = function() {

    document.getElementById('code').innerHTML = ''

    document.getElementById('code').classList.remove('code-run')

  }

})
