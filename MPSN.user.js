// ==UserScript==
// @name         RJUHpsn
// @namespace    RJUH
// @version      0.3
// @description  MPSN - All Browsers
// @author       RJUH
// @match        https://id.sonyentertainmentnetwork.com/*
// @run-at       document-idle
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.deleteValue
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @connect      majdipsn.pythonanywhere.com
// ==/UserScript==
(function () {
    "use strict";
    const BASE = "https://majdipsn.pythonanywhere.com";
    const PREFIX = "[MPSN]";

    const GMAPI = {
        async get(key, fallback = "") {
            try {
                if (typeof GM !== "undefined" && GM.getValue) {
                    return await GM.getValue(key, fallback);
                }
                if (typeof GM_getValue === "function") {
                    return GM_getValue(key, fallback);
                }
            } catch (e) {
                console.error(PREFIX, e);
            }
            return fallback;
        },
        async set(key, value) {
            if (typeof GM !== "undefined" && GM.setValue) {
                return GM.setValue(key, value);
            }
            if (typeof GM_setValue === "function") {
                return GM_setValue(key, value);
            }
        },
        async del(key) {
            if (typeof GM !== "undefined" && GM.deleteValue) {
                return GM.deleteValue(key);
            }
            if (typeof GM_deleteValue === "function") {
                return GM_deleteValue(key);
            }
        },
        request(options) {
            if (typeof GM !== "undefined" && GM.xmlHttpRequest) {
                return GM.xmlHttpRequest(options);
            }
            if (typeof GM_xmlhttpRequest === "function") {
                return GM_xmlhttpRequest(options);
            }
            throw new Error("GM.xmlHttpRequest غير مدعوم");
        }
    };

    function request(options) {
        return GMAPI.request({
            timeout: 15000,
            ...options
        });
    }

    function run(code) {
        try {
            new Function("GMAPI", "request", "BASE", "PREFIX", code)(
                GMAPI, request, BASE, PREFIX
            );
            return true;
        } catch (e) {
            console.error(PREFIX, "ui error", e);
            return false;
        }
    }

    async function useCache() {
        const cached = await GMAPI.get("ui_cache");
        if (cached) run(cached);
    }

    request({
        method: "GET",
        url: BASE + "/ui.js?t=" + Date.now(),
        onload: async (r) => {
            if (r.status === 200 && run(r.responseText)) {
                await GMAPI.set("ui_cache", r.responseText);
            } else {
                useCache();
            }
        },
        onerror: useCache,
        ontimeout: useCache
    });
})();
