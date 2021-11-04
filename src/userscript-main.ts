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
let gameStarted: boolean = false;
const clickTimeout: number = 2000;
// 0: main menu, 1: event menu, 2: inside event
let appLevel: number = 0;
let currentEventType: number = 0;
// 0 = none/unknown, 1 = arena, 2 = raid, 3 = tower, 4 = hunt
const eventTypes: any = { "default": 0, "arena": 1, "raid": 2, "tower": 3, "hunt": 4 };
let advancingTower: boolean = false;
let encounteredBoss: boolean = false;
// Player stats
let staminaValue: string|null = null;
let bpValue: string|null = null;
let bpGaugeTime: string|null = null;

const start = () => {
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
        waitFor("#main_frame").then(() => {
            setTABAVars();
            // TODO: add ability to start go to (when we want to do events/quests etc.).
            goTo("event");
            doEvent();
        });
    }
};

// TODO: TABAVars -> Object
const setTABAVars = () => {
    setCurrentEventType();
    console.log("set current done", getCurrentEventType());
    setGaugesData();
    console.log(getGaugeData());
};

const setCurrentEventType = () => {
    // This is only possible on the main page.
    if (appLevel !== 0) {
        goTo("home");
        appLevel = 0;
        setCurrentEventType();
        return;
    }

    const eventBannerSelector = "#main_frame > a[href*='_event_']";

    let eventPrefix;

    let eventBanner = document.querySelector(
        "#main_frame > a[href*='_event_']"
    );

    if (eventBanner) {
        eventPrefix = eventBanner.getAttribute("href")?.split("/")[1];
        console.log("event prefix", eventPrefix);
    }

    currentEventType = eventPrefix
        ? eventTypes[eventPrefix]
        : eventTypes.default;
};

const getCurrentEventType = () => {
    return currentEventType;
};

const setGaugesData = () => {
    try {
        let staminaGauge: any = document.querySelector("#stam_gage_num")?.textContent;
        staminaGauge = staminaGauge.match(".+?(?=/)");
        staminaValue = staminaGauge ? staminaGauge[0] : null;

        let bpGauge: any = document.querySelector("#top_bp_num")?.textContent;
        bpGauge = bpGauge.match(".+?(?=/)");
        bpValue = bpGauge ? bpGauge[0] : null;

        let bpGaugeTime = document.querySelector("#bp_gage_time")?.textContent;
        bpGaugeTime = bpGaugeTime;
    } catch (error) {
        logTABA(error);
    }
};

const getGaugeData = (key: string|null = null) => {
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
};

const goTo = (location: string) => {
    switch (location) {
        case "home":
            clickOnElement("#mypage");
            break;
        case "event":
            // Navigate to the event frame and start doing the event steps. (only do this when not already on the main page.)
            // goToMainPage();
            console.log("go to event");
            console.log("current event set?", getCurrentEventType());
            waitFor("#main_frame > a[href*='_event_']").then(
				function(){
					clickOnElement("#main_frame > a[href*='_event_']");
				}
            );
            appLevel = 1;
    }
};

const doEvent = () => {
    console.log("do event?");
    console.log(getCurrentEventType());
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
};
const doQuest = () => {};
const doArenaEvent = () => {};
const doRaidEvent = () => {};
const doTowerEvent = () => {
    // TODO: WIP
    console.log("will attempt tower event");

    const eventQuestButtonSelector = "#stage_choice";
    waitFor(eventQuestButtonSelector);
};
const doHuntEvent = () => {
    const mainFrameHunt = "#main_frame_hunt";
    waitFor(mainFrameHunt).then(() => {
        clickOnElement("#stage_choice");
        console.log("clicked on quest button?");
    });
};

doEvents: () => {};

// Helper functions
// Use wait for when there are animations in place. They ususally prevent certain elements from loading in DOM at once.
const waitFor = (selector: string) => {
    return new Promise(function (res, rej) {
        waitForElementToDisplay(selector, 500);
        function waitForElementToDisplay(selector: string, time: number) {
            if (document.querySelector(selector) != null) {
                res(document.querySelector(selector));
            } else {
                setTimeout(function () {
                    waitForElementToDisplay(selector, time);
                }, time);
            }
        }
    });
};

const clickOnElement = (selector: string, delayMs: number = clickTimeout) => {
    setTimeout(function () {
        console.log("click on", selector);
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
            console.log("Click!");
            element.click();
        } else {
            console.log("unable to find element", selector);
        }
    }, delayMs);
};

const delay = (n: number) => new Promise((r) => setTimeout(r, n * 1000));

const logTABA = (...args: any[]) => {
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
};

// Start script on page load.
(function () {
    start();
})();
