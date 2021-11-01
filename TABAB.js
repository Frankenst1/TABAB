// ==UserScript==
// @name		 Taimanin Asagi Battle Arena Bot
// @namespace    https://github.com/Frankenst1/TABAB
// @version      0.0.1
// @author       Frankenst1
// @match        http*://osapi.dmm.com/gadgets/ifr*gadget_asagi*
// @match        http*://osapi.nutaku.com/gadgets/ifr?*tid=taimanin-asagi-battle-arena*
// @grant	     GM_log
// @license      MIT
// @updateURL    https://github.com/Frankenst1/TABAB/raw/main/TABAB.js
// @downloadURL  https://github.com/Frankenst1/TABAB/raw/main/TABAB.js
// ==/UserScript==

// Game status/settings
let gameStarted = false;
const clickTimeout = 5000;
// 0: main menu, 1: event menu, 2: inside event
const appLevel = 0;
let currentEventType = 0;
// 0 = none/unknown, 1 = arena, 2 = raid, 3 = tower, 4 = hunt
const eventTypes = { default: 0, arena: 1, raid: 2, tower: 3, hunt: 4 };
let advancingTower = false;
let encounteredBoss = false;
// Player stats
let staminaValue = null;
let bpValue = null;
let bpGaugeTime = null;

function start() {
    if (!gameStarted) {
        // Adding opacity 1 allows us to wait to click until the "start" animation is done.
        const opacityStyle = "[style='opacity: 1;']";
        const gameStartButtonSelector = ".game_start_over" + opacityStyle;
        waitFor(gameStartButtonSelector).then(function () {
            console.log("starting the game");
            clickOnElement(gameStartButtonSelector, 0);
            gameStarted = true;
            start();
        });
    } else {
        waitFor("#main_frame").then(setTABAVars());

        goTo("event");
    }
}

function logTABA(...args) {
    let currDate = new Date();
    let text;
    const prefix =
        currDate.toLocaleString() + "." + currDate.getMilliseconds() + ":";

    if (args.length === 1) {
        if (typeof args[0] === "string" || args[0] instanceof String) {
            text = args[0];
        } else {
            text = JSON.stringify(args[0], null, 2);
        }
    } else {
        text = JSON.stringify(args, null, 2);
    }

    if (typeof GM_log === "function") {
        GM_log(prefix + ":" + text);
    } else {
        console.log(prefix + ":" + text);
    }
}

// TODO: TABAVars -> Object
function setTABAVars() {
    setCurrentEventType();
    setGaugesData();
    console.log(getGaugeData());
}

function setCurrentEventType() {
    // This is only possible on the main page (for now).
    let eventBanner = document.querySelector(
        "#main_frame > a[href*='_event_']"
    );
    let eventPrefix;

    if (eventBanner) {
        eventPrefix = eventBanner.getAttribute("href").split("/")[1];
    }

    currentEventType = eventPrefix
        ? eventTypes[eventPrefix]
        : eventTypes.default;
}

function getCurrentEventType() {
    return currentEventType;
}

function setGaugesData() {
    try {
        let staminaGauge = document.querySelector("#stam_gage_num").textContent;
        staminaGauge = staminaGauge.match(".+?(?=/)");
        staminaValue = staminaGauge ? staminaGauge[0] : null;

        let bpGauge = document.querySelector("#top_bp_num").textContent;
        bpGauge = bpGauge.match(".+?(?=/)");
        bpValue = bpGauge ? bpGauge[0] : null;

        let bpGaugeTime = document.querySelector("#bp_gage_time").textContent;
        bpGaugeTime = bpGaugeTime;
    } catch (error) {
        logTABA(error);
    }
}

function getGaugeData(key = null) {
    switch (key) {
        case "stamina":
            return staminaValue;
        case "bp":
            return [bpValue, bpGaugeTime];
        default:
            return {
                stamina: staminaValue,
                bp: [bpValue, bpGaugeTime],
            };
    }
}

function goTo(location) {
    switch (location) {
        case "home":
            clickOnElement("#mypage").click();
            break;
        case "event":
            // Navigate to the event frame and start doing the event steps. (only do this when not already on the main page.)
            // goToMainPage();
            console.log("go to event");
            let eventBannerSelector = "#main_frame > a[href*='_event_']";
            waitFor(eventBannerSelector).then(
                clickOnElement(eventBannerSelector)
            );
    }
}

function doEvent() {
    switch (getCurrentEventType()) {
        case 0:
            doQuest();
            break;
        case 1:
            doArenaEvent();
            break;
        case 2:
            doRaidEvent();
            break;
        case 3:
            doTowerEvent();
            break;
        case 4:
            doHuntEvent();
            break;
    }
}
function doQuest() {}
function doArenaEvent() {}
function doRaidEvent() {}
function doTowerEvent() {
    console.log("will attempt tower event");

    const eventQuestButtonSelector = "#stage_choice";
    waitFor(eventQuestButtonSelector, function () {
        console.log("ready to go!");
        clickOnElement(eventQuestButtonSelector);
    });
}
function doHuntEvent() {}

// Helper functions
function waitFor(selector) {
    return new Promise(function (res, rej) {
        waitForElementToDisplay(selector, 500);
        function waitForElementToDisplay(selector, time) {
            if (document.querySelector(selector) != null) {
                res(document.querySelector(selector));
            } else {
                setTimeout(function () {
                    waitForElementToDisplay(selector, time);
                }, time);
            }
        }
    });
}

function clickOnElement(selector, delayMs = clickTimeout) {
    setTimeout(function () {
        console.log("click on", selector);
        const element = document.querySelector(selector);
        if (element) {
            console.log("Click!");
            document.querySelector(selector).click();
        } else {
            console.log("unable to find element", selector);
        }
    }, delayMs);
}

// Start script on page load.
(function () {
    start();
})();
