// ==UserScript==
// @name         MPSN
// @namespace    MAJDI
// @version      3.2
// @description  MPSN - All Browsers
// @author       MAJDI
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
    // بيانات التواصل
    const WHATSAPP_NUMBER = "33250215"; // اكتب الرقم مع مفتاح الدولة بدون + أو 00
    const TELEGRAM_USER = "iue1t";
    const WHATSAPP_URL = "https://wa.me/" + WHATSAPP_NUMBER;
    const TELEGRAM_URL = "https://t.me/" + TELEGRAM_USER;
    let ui = null;
    let beat = null;
    let busy = false;
    let isActivated = false;
    let daysLeft = 0;
    console.log(PREFIX, "loaded");

    // توافق مع كل المتصفحات / مديري السكربتات
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

    function createUI() {
        if (ui) return;
        const host = document.createElement("div");
        host.id = "godmode-host";
        host.style.cssText = `
            all: initial;
            position: fixed;
            top: 25px;
            left: 15px;
            z-index: 2147483647;
        `;
        const shadow = host.attachShadow({ mode: "open" });
        shadow.innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                    font-family: -apple-system, BlinkMacSystemFont,
                    "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                #wrap {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                #btn {
                    background: linear-gradient(135deg, #ffd95a, #f5a623);
                    color: #111;
                    border: none;
                    border-radius: 30px;
                    padding: 14px 22px;
                    font-size: 16px;
                    font-weight: 800;
                    letter-spacing: 0.3px;
                    cursor: pointer;
                    box-shadow: 0 6px 18px rgba(245, 166, 35, 0.45),
                                inset 0 1px 0 rgba(255, 255, 255, 0.55);
                    -webkit-appearance: none;
                    appearance: none;
                    -webkit-tap-highlight-color: transparent;
                    transition: all 0.25s ease;
                }
                #btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 9px 22px rgba(245, 166, 35, 0.55),
                                inset 0 1px 0 rgba(255, 255, 255, 0.55);
                }
                #btn.ok {
                    background: linear-gradient(135deg, #4be08b, #1fa95b);
                    color: #fff;
                    box-shadow: 0 6px 18px rgba(46, 204, 113, 0.45),
                                inset 0 1px 0 rgba(255, 255, 255, 0.45);
                }
                #btn.warn {
                    background: linear-gradient(135deg, #ffa24d, #e0640f);
                    color: #fff;
                    box-shadow: 0 6px 18px rgba(230, 126, 34, 0.45),
                                inset 0 1px 0 rgba(255, 255, 255, 0.4);
                }
                /* الدائرة الشفافة عند الإغلاق */
                #btn.collapsed {
                    width: 54px;
                    height: 54px;
                    min-width: 54px;
                    padding: 0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 17px;
                    font-weight: 900;
                    background: rgba(245, 197, 66, 0.35);
                    color: #111;
                    border: 1px solid rgba(245, 197, 66, 0.6);
                    -webkit-backdrop-filter: blur(10px);
                    backdrop-filter: blur(10px);
                    box-shadow: 0 3px 15px rgba(0, 0, 0, 0.15);
                }
                #btn.collapsed.ok {
                    background: rgba(46, 204, 113, 0.3);
                    border-color: rgba(46, 204, 113, 0.55);
                    color: #0b5d30;
                }
                #btn.collapsed.warn {
                    background: rgba(230, 126, 34, 0.3);
                    border-color: rgba(230, 126, 34, 0.55);
                    color: #7a3a07;
                }
                #btn:active {
                    transform: scale(0.94);
                }
                #panel {
                    width: 280px;
                    padding: 18px;
                    border-radius: 18px;
                    background: #fff;
                    color: #111;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.28);
                    direction: rtl;
                    text-align: center;
                }
                .hide {
                    display: none !important;
                }
                #title {
                    font-size: 18px;
                    font-weight: 900;
                    margin-bottom: 12px;
                }
                #msg {
                    font-size: 14px;
                    margin-bottom: 12px;
                    white-space: pre-line;
                    line-height: 1.6;
                }
                #msg.err { color: #c0392b; }
                #msg.good { color: #27ae60; }
                #msg.wait { color: #777; }
                input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 10px;
                    font-size: 16px;
                    margin-bottom: 10px;
                    -webkit-appearance: none;
                    appearance: none;
                    outline: none;
                }
                input:focus {
                    border-color: #f5a623;
                }
                button.act,
                button.out {
                    width: 100%;
                    padding: 12px;
                    border: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    -webkit-appearance: none;
                    appearance: none;
                }
                button.act {
                    background: linear-gradient(135deg, #ffd95a, #f5a623);
                    color: #111;
                }
                button.out {
                    background: #eee;
                    color: #111;
                    margin-top: 8px;
                }
                /* قسم التواصل */
                #contact {
                    margin-top: 14px;
                    padding-top: 14px;
                    border-top: 1px solid #eee;
                }
                .contact-row {
                    display: flex;
                    gap: 8px;
                }
                a.c {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 7px;
                    padding: 10px 6px;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 800;
                    text-decoration: none;
                    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.18);
                    transition: transform 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                a.c:hover { transform: translateY(-2px); }
                a.c:active { transform: scale(0.95); }
                a.c svg {
                    width: 22px;
                    height: 22px;
                    fill: #fff;
                    flex-shrink: 0;
                }
                a.wa { background: linear-gradient(135deg, #3ee37a, #128c4a); }
                a.tg { background: linear-gradient(135deg, #3bb4ee, #1b7fc4); }
            </style>
            <div id="wrap">
                <button id="btn">🔑 MPSN</button>
                <div id="panel" class="hide">
                    <div id="title">MPSN</div>
                    <div id="msg"></div>
                    <div id="form">
                        <input id="key"
                            placeholder="كود الاشتراك"
                            autocomplete="off">
                        <button class="act" id="activate">
                            تفعيل
                        </button>
                    </div>
                    <button class="out hide" id="logout">
                        تسجيل خروج
                    </button>
                    <div id="contact">
                        <div class="contact-row">
                            <a class="c wa" href="${WHATSAPP_URL}"
                               target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                <span>تواصل</span>
                            </a>
                            <a class="c tg" href="${TELEGRAM_URL}"
                               target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                <span>تواصل</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.documentElement.appendChild(host);
        ui = {
            host,
            btn: shadow.getElementById("btn"),
            panel: shadow.getElementById("panel"),
            msg: shadow.getElementById("msg"),
            form: shadow.getElementById("form"),
            key: shadow.getElementById("key"),
            activate: shadow.getElementById("activate"),
            logout: shadow.getElementById("logout")
        };
        ui.btn.addEventListener("click", () => {
            ui.panel.classList.toggle("hide");
            updateButton();
        });
        ui.activate.addEventListener("click", () => {
            const key = ui.key.value.trim();
            if (!key) {
                message("اكتب كود الاشتراك أولاً", "err");
                return;
            }
            load(key, "", true);
        });
        ui.logout.addEventListener("click", async () => {
            await reset();
            location.reload();
        });
        setInterval(() => {
            if (!host.isConnected && document.documentElement) {
                document.documentElement.appendChild(host);
            }
        }, 2000);
        updateButton();
    }

    function updateButton() {
        if (!ui) return;
        const closed = ui.panel.classList.contains("hide");
        if (closed) {
            ui.btn.classList.add("collapsed");
            ui.btn.textContent = isActivated
                ? String(daysLeft)
                : "🔑";
            ui.btn.title = isActivated
                ? "MPSN - " + daysLeft + " يوم متبقي"
                : "MPSN";
        } else {
            ui.btn.classList.remove("collapsed");
            ui.btn.textContent = isActivated
                ? "MPSN ✓ · " + daysLeft + " يوم"
                : "🔑 MPSN";
        }
        ui.btn.classList.remove("ok", "warn");
        if (isActivated) {
            ui.btn.classList.add(
                daysLeft <= 3 ? "warn" : "ok"
            );
        }
    }

    function message(text, type = "") {
        if (!ui) return;
        ui.msg.textContent = text;
        ui.msg.className = type;
    }

    function active(days, activated = false) {
        if (!ui) return;
        isActivated = true;
        daysLeft = Number(days) || 0;
        ui.form.classList.add("hide");
        ui.logout.classList.remove("hide");
        message(
            (activated ? "✅ تم تفعيل الاشتراك بنجاح\n" : "") +
            (daysLeft <= 0
                ? "ينتهي اشتراكك اليوم"
                : "باقي من اشتراكك: " + daysLeft + " يوم"),
            "good"
        );
        if (activated) {
            ui.panel.classList.remove("hide");
        }
        updateButton();
    }

    function inactive(text) {
        if (!ui) return;
        isActivated = false;
        daysLeft = 0;
        ui.form.classList.remove("hide");
        ui.logout.classList.add("hide");
        ui.panel.classList.remove("hide");
        message(text, "err");
        updateButton();
    }

    async function reset() {
        if (beat) {
            clearInterval(beat);
            beat = null;
        }
        isActivated = false;
        daysLeft = 0;
        await GMAPI.del("key");
        await GMAPI.del("token");
    }

    function heartbeat(key, token) {
        if (beat) clearInterval(beat);
        beat = setInterval(() => {
            request({
                method: "POST",
                url: BASE + "/check",
                headers: {
                    "X-API-Key": key,
                    "X-Token": token
                },
                onload: async (r) => {
                    if (r.status === 200) {
                        try {
                            const data = JSON.parse(r.responseText);
                            active(data.days_left);
                        } catch (e) {}
                    } else if ([401, 403, 409].includes(r.status)) {
                        await reset();
                        location.reload();
                    }
                }
            });
        }, 120000);
    }

    function runInPage(code) {
        if (typeof code !== "string" || !code.trim()) {
            return "السيرفر لم يرجع كود تشغيل صالح";
        }
        const script = document.createElement("script");
        script.textContent = code;
        try {
            (document.head || document.documentElement)
                .appendChild(script);
            script.remove();
            return null;
        } catch (e) {
            script.remove();
            return "تعذر حقن الكود: " + e.message;
        }
    }

    function load(key, token, manual = false) {
        if (busy) return;
        busy = true;
        if (manual) {
            ui.panel.classList.remove("hide");
            updateButton();
            message("⏳ جاري التحقق من الاشتراك...", "wait");
        }
        request({
            method: "POST",
            url: BASE + "/code",
            headers: {
                "X-API-Key": key,
                "X-Token": token
            },
            onload: async (r) => {
                busy = false;
                try {
                    if (r.status === 200) {
                        const data = JSON.parse(r.responseText);
                        await GMAPI.set("key", key);
                        await GMAPI.set("token", data.token);
                        heartbeat(key, data.token);
                        active(data.days_left, manual);
                        const error = runInPage(data.code);
                        if (error) {
                            message(
                                "تم التفعيل، لكن تعذر تشغيل الكود:\n" +
                                error,
                                "err"
                            );
                        }
                    } else {
                        await reset();
                        const errors = {
                            401: "❌ الكود غير صحيح",
                            403: "❌ انتهى الاشتراك",
                            409: "❌ الكود مستخدم في متصفح آخر"
                        };
                        inactive(
                            errors[r.status] ||
                            "❌ خطأ من السيرفر: " + r.status
                        );
                    }
                } catch (e) {
                    inactive("❌ خطأ: " + e.message);
                }
            },
            onerror: () => {
                busy = false;
                inactive("❌ تعذر الاتصال بالسيرفر");
            },
            ontimeout: () => {
                busy = false;
                inactive("❌ انتهت مهلة الاتصال");
            }
        });
    }

    async function start() {
        createUI();
        const key = await GMAPI.get("key");
        const token = await GMAPI.get("token");
        if (key) {
            load(key, token, false);
        } else {
            inactive("أدخل كود الاشتراك");
        }
    }

    start();
})();
