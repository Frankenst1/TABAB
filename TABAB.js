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

let gameStarted = false;
let staminaValue = null;
let bpValue = null;
let bpGageTime = null;
const transitionDuration = 2500;
const clickTimeout = 3000;
let eventType = 0; // 0 = none/unknown, 1 = arena, 2 = raid, 3 = tower, 4 = hunt
const eventTypes = { default: 0, arena: 1, raid: 2, tower: 3, hunt: 4 };
const appLevel = 0;
let advancingTower = false;
let encounteredBoss = false;

function start() {
    logTABA("start?", gameStarted);
    if (!gameStarted) {
        console.log("instant call");
        console.log($(".game_start_over"));

        // Check/wait if element exists
        (function checkIfElemExists() {
            console.log("checking if element is availableè");
            if (!document.querySelector(".game_start_over")) {
                window.requestAnimationFrame(checkIfElemExists);
            } else {
                if ($(".game_start_over").length) {
                    $(".game_start_over")[0].click();

                    gameStarted = true;
                }
            }
        })();
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

function setTABAVars(key, value) {
    logTABA("Setting variables.");
}

function getGaugeData() {
    logTABA("⏱ Collecting gauge data");

    try {
        let staminaGage = document.querySelector("#stam_gage_num").textContent;
        staminaGage = staminaGage.match(".+?(?=/)");
        staminaValue = staminaGage ? staminaGage[0] : null;

        let bpGage = document.querySelector("#top_bp_num").textContent;
        bpGage = bpGage.match(".+?(?=/)");
        bpValue = bpGage ? bpGage[0] : null;

        let bpGageTime = document.querySelector("#bp_gage_time").textContent;

        return bpGage;
    } catch (error) {
        logTABA(error);
        setTimeout(getGaugeData, 500);
    }
}

async function checkElement(selector) {
    const querySelector = null;
    while (querySelector === null) {
        await rafAsync();
        querySelector = document.querySelector(selector);
    }
    return querySelector;
}

(function () {
    start();
})();
