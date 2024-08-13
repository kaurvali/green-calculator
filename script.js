const statuses = Object.freeze({
    OK: 0,
    MEDIUM: 1,
    BAD: 2,
});

window.addEventListener('DOMContentLoaded', loadTranslations);

let translations;

function showResults() {
    const language = document.querySelector('html').getAttribute('lang');
    getResults(language);
    document.getElementById("overlay").style.display = "block";
    document.getElementById("results-box").style.display = "block";
}

function hideResults() {
    let resultsSection = document.getElementsByClassName("result-section");
    let resultsArray = Array.from(resultsSection)

    resultsArray.forEach(function (element) {
        element.style.display = 'none';
    });
    removeAllChildren("results")

    document.getElementById("overlay").style.display = "none";
    document.getElementById("results-box").style.display = "none";
}

async function loadTranslations() {
    const response = await fetch('translations.json', { mode: 'cors' });
    if (response.ok) {
        translations = await response.json();
        setLanguage('ee');
    }
}

function setLanguage(language) {
    document.querySelector('html').setAttribute('lang', language);
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = translations[language][key];
    });
    if (hasChildren('results')) {
        removeAllChildren("results");
        getResults(language);
    }
}

function getResults(language) {
    let issueTopics = checkResults(language);
    let status = determineStatus(issueTopics, document.querySelectorAll('.question').length);

    const resultsDiv = document.getElementById("results");
    let text = document.createElement("p");

    if (status === statuses.OK) {
        document.getElementById("ok").style.display = "block";

        text.textContent = translations[language].all_ok;
        resultsDiv.appendChild(text);

    } else if (status === statuses.MEDIUM) {
        document.getElementById("medium").style.display = "block";

        let text1 = document.createElement("p");
        text1.textContent = translations[language].issues_with;
        resultsDiv.appendChild(text1);

        createList(issueTopics);

        let text2 = document.createElement("p");
        text2.textContent = translations[language].issues_with_followup
        resultsDiv.appendChild(text2);
    } else {
        document.getElementById("bad").style.display = "block";

        text.textContent = translations[language].you_should_work_harder;
        resultsDiv.appendChild(text);
    }
}

function checkResults(language) {
    const questions = document.querySelectorAll(".question");

    let issueTopics = [];
    questions.forEach((question, index) => {
        const checkboxes = question.querySelectorAll('input[type="checkbox"]');
        const questionValue = question.getAttribute("value");
        let countOk = 0;

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) countOk++;
        });

        if (questionValue == "packaging" && checkboxes[0].checked) {
            // quick workaround for packaging issue
            return;
        }
        if (questionValue == "waste" && checkboxes[1].checked) {
            // quick workaround for waste issue
            return;
        }
        if (countOk < 3) {
            const translation = translations[language][questionValue];
            issueTopics.push(translation.toLowerCase());
        }
    });
    return issueTopics;
}

function determineStatus(issueTopics, questionLength) {
    if (issueTopics.length === 0) return statuses.OK;
    else if (issueTopics.length === questionLength) return statuses.BAD;
    return statuses.MEDIUM;
}

function createList(issueTopics) {
    let ul = document.createElement("ul");
    issueTopics.forEach(function (item) {
        let listItem = document.createElement("li");
        listItem.textContent = item;
        ul.appendChild(listItem);
    });
    let result = document.getElementById("results");
    result.appendChild(ul);

}

function hasChildren(elementId) {
    let element = document.getElementById(elementId);
    return element && element.childNodes.length > 0;
}

function removeAllChildren(id) {
    let container = document.getElementById(id);
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}