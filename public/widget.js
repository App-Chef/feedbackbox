/*!
 * Feedbackbox widget — https://github.com/App-Chef/feedbackbox (MIT)
 *
 * <script src="https://your-feedbackbox.app/widget.js" data-project="PROJECT_ID" async></script>
 *
 * Optional attributes: data-label, data-color, data-position ("bottom-right" | "bottom-left"),
 * data-theme ("light" | "dark" | "auto", default "light"),
 * data-demo ("true" renders the widget without sending anything).
 *
 * Renders inside a closed Shadow DOM so host styles can't leak in or out,
 * and defines no globals.
 */
(function () {
  "use strict";

  var script =
    document.currentScript ||
    document.querySelector('script[src*="widget.js"][data-project]');
  if (!script) return;

  var projectId = script.getAttribute("data-project") || "";
  var demo = script.getAttribute("data-demo") === "true";
  var theme = script.getAttribute("data-theme") || "light";
  if (!projectId && !demo) {
    console.warn("[Feedbackbox] Missing data-project attribute.");
    return;
  }

  // Only mount once per project, even if the snippet is included twice.
  var mountSelector = '[data-feedbackbox="' + projectId.replace(/"/g, "") + '"]';
  if (document.querySelector(mountSelector)) return;

  var origin;
  try {
    origin = new URL(script.src, location.href).origin;
  } catch {
    return;
  }

  var TYPES = [
    ["bug", "Bug"],
    ["feature", "Feature request"],
    ["improvement", "Improvement"],
    ["question", "Question"],
    ["other", "Other"],
  ];

  var overrides = {
    buttonLabel: script.getAttribute("data-label"),
    accentColor: script.getAttribute("data-color"),
    position: script.getAttribute("data-position"),
  };

  function loadConfig() {
    var defaults = { buttonLabel: "Feedback", accentColor: "#ff5a1f", position: "bottom-right" };
    if (demo) return Promise.resolve(defaults);
    return fetch(origin + "/api/widget/" + encodeURIComponent(projectId), { credentials: "omit" }).then(
      function (res) {
        if (!res.ok) throw new Error("Unknown project " + projectId);
        return res.json();
      },
    );
  }

  function start() {
    loadConfig()
      .then(function (config) {
        Object.keys(overrides).forEach(function (key) {
          if (overrides[key]) config[key] = overrides[key];
        });
        mount(config);
      })
      .catch(function (err) {
        console.warn("[Feedbackbox] Widget disabled:", err && err.message);
      });
  }

  // ---------------------------------------------------------------------------

  function contrastText(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return "#0f0f0f";
    var n = parseInt(m[1], 16);
    var lum = [n >> 16, (n >> 8) & 255, n & 255]
      .map(function (c) {
        c /= 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      })
      .reduce(function (acc, c, i) {
        return acc + c * [0.2126, 0.7152, 0.0722][i];
      }, 0);
    return lum > 0.35 ? "#0f0f0f" : "#ffffff";
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      if (key === "text") node.textContent = attrs[key];
      else node.setAttribute(key, attrs[key]);
    });
    (children || []).forEach(function (child) {
      node.appendChild(child);
    });
    return node;
  }

  var CHAT_ICON =
    '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var CLOSE_ICON =
    '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var CHECK_ICON =
    '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  var DARK = "--fg:#f3f3ee;--bg:#161614;--muted:#a3a39c;--line:#f3f3ee;--soft:#34342f;--field:#0f0f0e";

  function styles(accent, accentText, left) {
    var side = left ? "left" : "right";
    return (
      ":host{all:initial}" +
      "*{box-sizing:border-box;margin:0;font-family:ui-sans-serif,system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
      ".root{--fg:#0f0f0f;--bg:#ffffff;--muted:#5b5b57;--line:#0f0f0f;--soft:#e7e7e1;--field:#fafaf7;--accent:" + accent + ";--accent-fg:" + accentText + ";" +
      "position:fixed;z-index:2147483000;bottom:20px;" + side + ":20px;color:var(--fg);font-size:14px;line-height:1.45}" +
      ".root.dark{" + DARK + "}" +
      "@media (prefers-color-scheme:dark){.root.auto{" + DARK + "}}" +
      ".trigger{all:unset;box-sizing:border-box;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;cursor:pointer;" +
      "background:var(--accent);color:var(--accent-fg);border:1px solid var(--line);box-shadow:3px 3px 0 var(--line);font-weight:600;font-size:14px;" +
      "transition:transform .18s ease-out,box-shadow .18s ease-out,opacity .18s ease-out}" +
      ".trigger:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--line)}" +
      ".trigger:active{transform:translate(2px,2px);box-shadow:1px 1px 0 var(--line)}" +
      ".trigger:focus-visible,button:focus-visible,textarea:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid var(--accent);outline-offset:2px}" +
      ".trigger[aria-expanded=true]{opacity:0;pointer-events:none;transform:scale(.96)}" +
      ".backdrop{position:fixed;inset:0;background:rgba(15,15,15,.28);opacity:0;transition:opacity .2s ease-out}" +
      ".panel{position:absolute;bottom:0;" + side + ":0;width:340px;max-width:calc(100vw - 40px);background:var(--bg);border:1px solid var(--line);" +
      "border-radius:14px;box-shadow:4px 4px 0 var(--line);padding:18px;opacity:0;transform:translateY(8px) scale(.98);" +
      "transform-origin:bottom " + side + ";transition:opacity .2s ease-out,transform .2s ease-out}" +
      ".open .panel{opacity:1;transform:none}.open .backdrop{opacity:1}" +
      ".head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}" +
      "h2{font-size:16px;font-weight:700;letter-spacing:-.01em}" +
      ".close{all:unset;display:grid;place-items:center;width:32px;height:32px;border-radius:8px;cursor:pointer;color:var(--muted)}" +
      ".close:hover{background:var(--soft);color:var(--fg)}" +
      "label{display:block;font-size:13px;font-weight:600;margin:12px 0 6px}" +
      "label .opt{font-weight:400;color:var(--muted)}" +
      "textarea,select,input{width:100%;font-size:16px;color:var(--fg);background:var(--field);border:1px solid var(--soft);border-radius:10px;padding:10px 12px;transition:border-color .15s ease-out}" +
      "textarea{min-height:110px;resize:vertical}" +
      "textarea:hover,select:hover,input:hover{border-color:var(--muted)}" +
      "select{appearance:none;background-image:linear-gradient(45deg,transparent 50%,currentColor 50%),linear-gradient(135deg,currentColor 50%,transparent 50%);" +
      "background-position:calc(100% - 17px) 50%,calc(100% - 12px) 50%;background-size:5px 5px;background-repeat:no-repeat;padding-right:32px}" +
      ".hp{position:absolute!important;left:-10000px!important;width:1px;height:1px;overflow:hidden}" +
      ".foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:16px}" +
      ".count{font-size:12px;color:var(--muted)}" +
      ".send{all:unset;box-sizing:border-box;cursor:pointer;padding:10px 16px;border-radius:10px;font-weight:600;background:var(--accent);color:var(--accent-fg);" +
      "border:1px solid var(--line);box-shadow:2px 2px 0 var(--line);transition:transform .15s ease-out,box-shadow .15s ease-out}" +
      ".send:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--line)}" +
      ".send:active{transform:translate(1px,1px);box-shadow:0 0 0 var(--line)}" +
      ".send[disabled]{opacity:.6;cursor:progress}" +
      ".error{margin-top:12px;font-size:13px;color:#b42318;background:#fef3f2;border:1px solid #fecdca;border-radius:8px;padding:8px 10px}" +
      ".error:empty{display:none}" +
      ".done{text-align:center;padding:18px 4px 6px}" +
      ".badge{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:999px;background:var(--accent);color:var(--accent-fg);border:1px solid var(--line);margin-bottom:12px}" +
      ".done p{color:var(--muted);margin:6px 0 16px}" +
      ".brand{margin-top:14px;font-size:11px;color:var(--muted);text-align:center}" +
      ".brand a{color:inherit}" +
      "[hidden]{display:none!important}" +
      "@media (max-width:520px){.root{bottom:16px;" + side + ":16px}" +
      ".panel{position:fixed;left:0;right:0;bottom:0;width:100%;max-width:none;border-radius:18px 18px 0 0;box-shadow:none;border-width:1px 0 0;" +
      "padding:20px 16px calc(16px + env(safe-area-inset-bottom));transform:translateY(100%);max-height:92vh;overflow:auto}" +
      ".open .panel{transform:none}.send{flex:1;text-align:center}}" +
      "@media (min-width:521px){.backdrop{display:none}}" +
      "@media (prefers-reduced-motion:reduce){*{transition:none!important}}"
    );
  }

  function mount(config) {
    var left = config.position === "bottom-left";
    var accent = /^#[0-9a-f]{6}$/i.test(config.accentColor || "") ? config.accentColor : "#ff5a1f";
    var label = String(config.buttonLabel || "Feedback").slice(0, 24);

    var host = el("div", { "data-feedbackbox": projectId });
    var shadow = host.attachShadow({ mode: "closed" });
    var style = el("style", { text: styles(accent, contrastText(accent), left) });

    var uid = "fbx-" + Math.random().toString(36).slice(2, 8);

    var trigger = el("button", { type: "button", class: "trigger", "aria-haspopup": "dialog", "aria-expanded": "false" });
    trigger.innerHTML = CHAT_ICON;
    trigger.appendChild(el("span", { text: label }));

    var closeBtn = el("button", { type: "button", class: "close", "aria-label": "Close feedback form" });
    closeBtn.innerHTML = CLOSE_ICON;

    var message = el("textarea", {
      id: uid + "-msg",
      name: "message",
      required: "",
      minlength: "3",
      maxlength: "5000",
      placeholder: "What would you like to tell us?",
    });
    var typeSelect = el("select", { id: uid + "-type", name: "type" });
    TYPES.forEach(function (t) {
      typeSelect.appendChild(el("option", { value: t[0], text: t[1] }));
    });
    var email = el("input", {
      id: uid + "-email",
      name: "email",
      type: "email",
      autocomplete: "email",
      maxlength: "254",
      placeholder: "you@example.com",
    });
    var honeypot = el("input", { type: "text", name: "website", tabindex: "-1", autocomplete: "off" });
    var count = el("span", { class: "count", "aria-live": "polite" });
    var send = el("button", { type: "submit", class: "send", text: "Send feedback" });
    var error = el("p", { class: "error", role: "alert" });

    var emailLabel = el("label", { for: uid + "-email", text: "Email " });
    emailLabel.appendChild(el("span", { class: "opt", text: "(optional)" }));

    var form = el("form", { novalidate: "" }, [
      el("label", { for: uid + "-msg", text: "What would you like to tell us?" }),
      message,
      el("label", { for: uid + "-type", text: "Type" }),
      typeSelect,
      emailLabel,
      email,
      el("div", { class: "hp", "aria-hidden": "true" }, [honeypot]),
      error,
      el("div", { class: "foot" }, [count, send]),
    ]);

    var checkBadge = el("div", { class: "badge" });
    checkBadge.innerHTML = CHECK_ICON;
    var doneClose = el("button", { type: "button", class: "send", text: "Close" });
    var done = el("div", { class: "done", hidden: "" }, [
      checkBadge,
      el("h2", { text: "Thanks for the feedback!", tabindex: "-1" }),
      el("p", { text: demo ? "This is a demo, so nothing was sent." : "It's been sent to the team." }),
      doneClose,
    ]);

    var panel = el(
      "div",
      { class: "panel", role: "dialog", "aria-modal": "true", "aria-labelledby": uid + "-title", hidden: "" },
      [
        el("div", { class: "head" }, [el("h2", { id: uid + "-title", text: "Give feedback" }), closeBtn]),
        form,
        done,
        el("p", { class: "brand" }, [el("a", { href: "https://github.com/App-Chef/feedbackbox", target: "_blank", rel: "noopener", text: "Powered by Feedbackbox" })]),
      ],
    );
    var backdrop = el("div", { class: "backdrop", hidden: "" });
    var root = el("div", { class: "root " + (theme === "dark" || theme === "auto" ? theme : "light") }, [
      backdrop,
      panel,
      trigger,
    ]);

    shadow.appendChild(style);
    shadow.appendChild(root);
    document.body.appendChild(host);

    var openedAt = 0;
    var sending = false;

    function focusables() {
      return Array.prototype.filter.call(
        panel.querySelectorAll("button, textarea, select, input:not([tabindex='-1']), a[href]"),
        function (node) {
          return !node.disabled && !node.closest("[hidden], .hp");
        },
      );
    }

    function open() {
      openedAt = Date.now();
      panel.hidden = false;
      backdrop.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      // Next frame so the transition runs from the hidden state.
      requestAnimationFrame(function () {
        root.classList.add("open");
        (done.hidden ? message : doneClose).focus();
      });
    }

    function close() {
      root.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(function () {
        if (root.classList.contains("open")) return;
        panel.hidden = true;
        backdrop.hidden = true;
        if (!done.hidden) reset();
      }, reduced ? 0 : 200);
      trigger.focus();
    }

    function reset() {
      form.reset();
      form.hidden = false;
      done.hidden = true;
      error.textContent = "";
      count.textContent = "";
    }

    function validate() {
      var text = message.value.trim();
      if (text.length < 3) return { field: message, text: "Please write a little more." };
      if (email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.value.trim())) {
        return { field: email, text: "That email address doesn't look right." };
      }
      return null;
    }

    function submit(event) {
      event.preventDefault();
      if (sending) return;
      error.textContent = "";

      var invalid = validate();
      if (invalid) {
        error.textContent = invalid.text;
        invalid.field.setAttribute("aria-invalid", "true");
        invalid.field.focus();
        return;
      }
      message.removeAttribute("aria-invalid");
      email.removeAttribute("aria-invalid");

      sending = true;
      send.disabled = true;
      send.textContent = "Sending…";

      var payload = {
        projectId: projectId,
        message: message.value.trim(),
        type: typeSelect.value,
        email: email.value.trim() || null,
        pageUrl: location.href,
        screenWidth: window.screen ? window.screen.width : null,
        screenHeight: window.screen ? window.screen.height : null,
        website: honeypot.value,
        elapsedMs: Date.now() - openedAt,
      };

      var request = demo
        ? new Promise(function (resolve) {
            setTimeout(function () {
              resolve({ ok: true });
            }, 500);
          })
        : fetch(origin + "/api/feedback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "omit",
            body: JSON.stringify(payload),
          }).then(function (res) {
            return res
              .json()
              .catch(function () {
                return {};
              })
              .then(function (body) {
                if (!res.ok) throw new Error(body.error || "We couldn't send your feedback. Please try again.");
                return body;
              });
          });

      request
        .then(function () {
          form.hidden = true;
          done.hidden = false;
          done.querySelector("h2").focus();
        })
        .catch(function (err) {
          error.textContent =
            err && err.message && err.message !== "Failed to fetch"
              ? err.message
              : "Something went wrong. We couldn't send your feedback. Please try again.";
        })
        .then(function () {
          sending = false;
          send.disabled = false;
          send.textContent = "Send feedback";
        });
    }

    trigger.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    doneClose.addEventListener("click", close);
    backdrop.addEventListener("click", close);
    form.addEventListener("submit", submit);

    message.addEventListener("input", function () {
      var remaining = 5000 - message.value.length;
      count.textContent = remaining < 500 ? remaining + " characters left" : "";
    });

    panel.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "Tab") {
        // Keep focus inside the dialog while it is open.
        var items = focusables();
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        var active = shadow.activeElement;
        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      } else if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        if (form.requestSubmit) form.requestSubmit();
        else submit(event);
      }
    });

    // Stop host-page keyboard shortcuts from firing while typing feedback.
    root.addEventListener("keydown", function (event) {
      event.stopPropagation();
    });
    root.addEventListener("keyup", function (event) {
      event.stopPropagation();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
