const Options = require('./modules/options.js');

const formSelectOptions = [
    "position",
    "language"
];

const fromRadioOptions = [
    "alltabs",
    "incognito"
];

function attachHandlers() {
    formSelectOptions.forEach(option => {
        document.getElementById(option).addEventListener("change", function () {
            let value = document.getElementById(option).value;
            Options.setOption(option, value);
        });
    });

    fromRadioOptions.forEach(option => {
        let nodeList = document.getElementsByName(option);
        let elements = Array.prototype.slice.call(nodeList);

        elements.forEach(element => {
            element.addEventListener("change", function () {
                let checked = elements.find(el => el.checked);
                Options.setOption(option, checked.id);
            });
        });
    });
}

function initOptions() {
    formSelectOptions.forEach(option => {
        Options.getOption(option, function (value) {
            document.getElementById(option).value = value;
        });
    });
    fromRadioOptions.forEach(option => {
        Options.getOption(option, function (value) {
            let nodeList = document.getElementsByName(option);
            let elements = Array.prototype.slice.call(nodeList);
            let optionToCheck = elements.find(x => x.id == value);
            optionToCheck.checked = true;
        });
    });
}

function init() {
    attachHandlers();
    initOptions();
}

init();