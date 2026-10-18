// ==UserScript==
// @name         MPSN
// @namespace    RJUH
// @version      0.2
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
    // بيانات التواصل
    const TIKTOK_USER = "rjuh";
    const TELEGRAM_USER = "iue1t";
    const TIKTOK_URL = "https://www.tiktok.com/@" + TIKTOK_USER;
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

                /* ========== iOS 26 Liquid Glass ========== */
                /* ========== الزر / الفقاعة ========== */
                #btn {
                    --tint: 255, 255, 255;
                    position: relative;
                    background:
                        linear-gradient(rgba(var(--tint), 0.12), rgba(var(--tint), 0.12)),
                        rgba(24, 26, 36, 0.42);
                    -webkit-backdrop-filter: blur(22px) saturate(200%) brightness(1.08);
                    backdrop-filter: blur(22px) saturate(200%) brightness(1.08);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    border-radius: 30px;
                    padding: 9px 15px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.4px;
                    cursor: pointer;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    box-shadow:
                        inset 0 1px 0.5px rgba(255, 255, 255, 0.7),
                        inset 0 -1px 1px rgba(255, 255, 255, 0.15),
                        inset 0 0 12px rgba(255, 255, 255, 0.08),
                        0 8px 24px rgba(0, 0, 0, 0.18);
                    -webkit-appearance: none;
                    appearance: none;
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.35s cubic-bezier(.34, 1.56, .64, 1),
                                background 0.25s ease,
                                box-shadow 0.25s ease;
                }
                #btn:hover { transform: scale(1.05); filter: brightness(1.15); }
                #btn:active { transform: scale(0.93); }
                /* لمسة لون خفيفة جداً فقط للحالة */
                #btn.ok { --tint: 120, 255, 200; }
                #btn.warn { --tint: 255, 140, 160; }

                /* الفقاعة المصغّرة: كرة زجاجية */
                #btn.collapsed {
                    width: 42px;
                    height: 42px;
                    min-width: 42px;
                    padding: 0;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 13px;
                    font-weight: 800;
                    letter-spacing: 0;
                    animation: float 3.2s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { translate: 0 0; }
                    50% { translate: 0 -2px; }
                }

                /* ========== المربع ========== */
                #panel {
                    position: relative;
                    isolation: isolate;
                    width: 228px;
                    padding: 14px 13px 13px;
                    border-radius: 28px;
                    background: rgba(24, 26, 36, 0.42);
                    -webkit-backdrop-filter: blur(40px) saturate(210%) brightness(1.06);
                    backdrop-filter: blur(40px) saturate(210%) brightness(1.06);
                    color: #fff;
                    box-shadow:
                        inset 0 1px 1px rgba(255, 255, 255, 0.65),
                        inset 0 -1px 1px rgba(255, 255, 255, 0.2),
                        inset 0 0 28px rgba(255, 255, 255, 0.07),
                        0 20px 50px rgba(0, 0, 0, 0.25);
                    direction: rtl;
                    text-align: center;
                    animation: pop 0.35s cubic-bezier(.34, 1.4, .64, 1);
                }
                /* حد زجاجي أبيض ناعم */
                #panel::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    padding: 1px;
                    border-radius: inherit;
                    background: linear-gradient(140deg,
                        rgba(255, 255, 255, 0.7),
                        rgba(255, 255, 255, 0.1) 40%,
                        rgba(255, 255, 255, 0.1) 60%,
                        rgba(255, 255, 255, 0.45));
                    -webkit-mask: linear-gradient(#000 0 0) content-box,
                                  linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                    mask: linear-gradient(#000 0 0) content-box exclude,
                          linear-gradient(#000 0 0);
                    pointer-events: none;
                    z-index: -1;
                }
                /* لمعة انعكاس خفيفة */
                #panel::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    border-radius: inherit;
                    background: linear-gradient(180deg,
                        rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0) 28%);
                    pointer-events: none;
                    z-index: -1;
                }
                @keyframes pop {
                    from { opacity: 0; transform: translateY(-8px) scale(0.94); }
                    to { opacity: 1; transform: none; }
                }
                .hide { display: none !important; }
                #title {
                    font-size: 15px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    margin-bottom: 8px;
                    color: #fff;
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
                }
                #msg {
                    font-size: 12.5px;
                    margin-bottom: 10px;
                    white-space: pre-line;
                    line-height: 1.6;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                }
                #msg:empty { display: none; }
                #msg.err { color: #ffc2cc; }
                #msg.good { color: #b6f7de; }
                #msg.wait { color: #f1f2ff; }
                input {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.22);
                    border-radius: 16px;
                    background: rgba(255, 255, 255, 0.12);
                    -webkit-backdrop-filter: blur(12px);
                    backdrop-filter: blur(12px);
                    color: #fff;
                    font-size: 14px;
                    text-align: center;
                    margin-bottom: 8px;
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.12),
                                inset 0 -1px 0 rgba(255, 255, 255, 0.12);
                    -webkit-appearance: none;
                    appearance: none;
                    outline: none;
                    transition: border-color 0.2s ease, box-shadow 0.2s ease;
                }
                input::placeholder { color: rgba(255, 255, 255, 0.6); }
                input:focus {
                    border-color: rgba(255, 255, 255, 0.6);
                    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.12),
                                0 0 0 3px rgba(255, 255, 255, 0.15);
                }
                button.act,
                button.out {
                    width: 100%;
                    padding: 10px;
                    border-radius: 16px;
                    font-size: 13px;
                    font-weight: 700;
                    color: #fff;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    cursor: pointer;
                    -webkit-appearance: none;
                    appearance: none;
                    background: rgba(255, 255, 255, 0.18);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    -webkit-backdrop-filter: blur(14px) saturate(180%);
                    backdrop-filter: blur(14px) saturate(180%);
                    box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.6),
                                inset 0 -1px 1px rgba(255, 255, 255, 0.12),
                                0 4px 12px rgba(0, 0, 0, 0.12);
                    -webkit-tap-highlight-color: transparent;
                    transition: transform 0.25s cubic-bezier(.34, 1.56, .64, 1),
                                background 0.2s ease;
                }
                button.out { margin-top: 4px; background: rgba(255, 255, 255, 0.12); }
                button.act:hover,
                button.out:hover { background: rgba(255, 255, 255, 0.24); }
                button.act:active,
                button.out:active { transform: scale(0.95); }

                /* قسم التواصل */
                #contact {
                    margin-top: 11px;
                    padding-top: 11px;
                    border-top: 1px solid rgba(255, 255, 255, 0.16);
                }
                .contact-row { display: flex; gap: 8px; }
                a.c {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    padding: 8px 4px;
                    border-radius: 16px;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
                    background: rgba(255, 255, 255, 0.14);
                    border: 1px solid rgba(255, 255, 255, 0.28);
                    -webkit-backdrop-filter: blur(14px) saturate(180%);
                    backdrop-filter: blur(14px) saturate(180%);
                    box-shadow: inset 0 1px 0.5px rgba(255, 255, 255, 0.55),
                                inset 0 -1px 1px rgba(255, 255, 255, 0.1);
                    transition: transform 0.25s cubic-bezier(.34, 1.56, .64, 1),
                                background 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                }
                a.c:hover { transform: scale(1.04); background: rgba(255, 255, 255, 0.22); }
                a.c:active { transform: scale(0.94); }
                a.c svg {
                    width: 16px;
                    height: 16px;
                    fill: #fff;
                    flex-shrink: 0;
                    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
                }
                a.tt, a.tg { background: rgba(255, 255, 255, 0.14); }
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
                            <a class="c tt" href="${TIKTOK_URL}"
                               target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
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
