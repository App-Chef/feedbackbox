// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const WIDGET_SOURCE = readFileSync(path.join(process.cwd(), "public", "widget.js"), "utf8");
const PROJECT = "3f1c9a52-7c1e-4d7a-9a3e-2b6f0d1e8c11";
const ORIGIN = "https://feedbackbox.test";

let shadow: ShadowRoot | null;
let fetchMock: ReturnType<typeof vi.fn>;

function jsonResponse(status: number, body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
}

/** Inserts the embed snippet and runs the widget script, like a browser would. */
async function loadWidget(attrs: Record<string, string> = {}) {
  const script = document.createElement("script");
  script.setAttribute("src", `${ORIGIN}/widget.js`);
  script.setAttribute("data-project", PROJECT);
  Object.entries(attrs).forEach(([k, v]) => script.setAttribute(k, v));
  document.body.appendChild(script);
  new Function(WIDGET_SOURCE)();
  await vi.waitFor(() => {
    if (!shadow?.querySelector(".trigger")) throw new Error("widget not mounted");
  });
  return shadow!;
}

const q = <T extends Element>(selector: string) => shadow!.querySelector<T>(selector)!;

async function open() {
  q<HTMLButtonElement>(".trigger").click();
  await vi.waitFor(() => expect(q(".root").classList.contains("open")).toBe(true));
}

function fill(message: string, email = "") {
  q<HTMLTextAreaElement>("textarea").value = message;
  q<HTMLInputElement>('input[type="email"]').value = email;
}

beforeEach(() => {
  shadow = null;
  // The widget uses a closed shadow root; capture it so tests can look inside.
  const attach = Element.prototype.attachShadow;
  vi.spyOn(Element.prototype, "attachShadow").mockImplementation(function (this: Element, init) {
    shadow = attach.call(this, init);
    return shadow;
  });
  fetchMock = vi.fn((url: string) =>
    url.includes("/api/widget/")
      ? jsonResponse(200, { buttonLabel: "Ideas?", accentColor: "#2563eb", position: "bottom-left" })
      : jsonResponse(201, { ok: true }),
  );
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("feedback widget", () => {
  it("loads its config from the Feedbackbox origin and renders the button", async () => {
    await loadWidget();
    expect(fetchMock).toHaveBeenCalledWith(`${ORIGIN}/api/widget/${PROJECT}`, { credentials: "omit" });
    expect(q(".trigger").textContent).toBe("Ideas?");
    expect(q("style").textContent).toContain("#2563eb");
    expect(q("style").textContent).toContain("left:20px");
  });

  it("isolates itself from the host page", async () => {
    const globalsBefore = new Set(Object.keys(window));
    await loadWidget();
    const host = document.querySelector(`[data-feedbackbox="${PROJECT}"]`)!;
    expect(host.shadowRoot).toBeNull(); // closed shadow root
    expect(document.querySelector("textarea, .trigger")).toBeNull(); // nothing leaks into the light DOM
    expect(Object.keys(window).filter((k) => !globalsBefore.has(k))).toEqual([]);
  });

  it("mounts only once when the snippet is included twice", async () => {
    await loadWidget();
    new Function(WIDGET_SOURCE)();
    expect(document.querySelectorAll("[data-feedbackbox]")).toHaveLength(1);
  });

  it("stays hidden for unknown projects", async () => {
    fetchMock.mockImplementation(() => jsonResponse(404, { error: "Unknown project." }));
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const script = document.createElement("script");
    script.setAttribute("src", `${ORIGIN}/widget.js`);
    script.setAttribute("data-project", PROJECT);
    document.body.appendChild(script);
    new Function(WIDGET_SOURCE)();
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    expect(shadow).toBeNull();
  });

  it("opens an accessible dialog and closes it with Escape", async () => {
    await loadWidget();
    const trigger = q<HTMLButtonElement>(".trigger");
    await open();

    const dialog = q('[role="dialog"]');
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(shadow!.getElementById(dialog.getAttribute("aria-labelledby")!)?.textContent).toBe("Give feedback");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(shadow!.activeElement).toBe(q("textarea"));

    // Every field has a label.
    for (const field of shadow!.querySelectorAll("textarea, select, input[type=email]")) {
      expect(shadow!.querySelector(`label[for="${field.id}"]`)).not.toBeNull();
    }

    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(shadow!.activeElement).toBe(trigger);
  });

  it("validates the message before sending", async () => {
    await loadWidget();
    await open();
    fill("hi");
    q<HTMLButtonElement>(".send").click();
    expect(q(".error").textContent).toMatch(/write a little more/i);
    expect(q("textarea").getAttribute("aria-invalid")).toBe("true");
    expect(fetchMock).toHaveBeenCalledTimes(1); // only the config request
  });

  it("validates the optional email", async () => {
    await loadWidget();
    await open();
    fill("Search is slow", "not-an-email");
    q<HTMLButtonElement>(".send").click();
    expect(q(".error").textContent).toMatch(/email/i);
  });

  it("submits feedback with page context and shows a thank-you message", async () => {
    await loadWidget();
    await open();
    fill("Search could be faster", "me@example.com");
    q<HTMLSelectElement>("select").value = "improvement";
    q<HTMLButtonElement>(".send").click();

    await vi.waitFor(() => expect(q<HTMLElement>(".done").hidden).toBe(false));
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe(`${ORIGIN}/api/feedback`);
    expect(init.method).toBe("POST");
    expect(init.credentials).toBe("omit");
    expect(JSON.parse(init.body)).toMatchObject({
      projectId: PROJECT,
      message: "Search could be faster",
      type: "improvement",
      email: "me@example.com",
      pageUrl: location.href,
      website: "",
    });
    expect(q(".done").textContent).toContain("Thanks for the feedback!");
  });

  it("sends anonymous feedback when email is left empty", async () => {
    await loadWidget();
    await open();
    fill("Love the new dashboard");
    q<HTMLButtonElement>(".send").click();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).email).toBeNull();
  });

  it("shows the server's error message and keeps the text", async () => {
    await loadWidget();
    fetchMock.mockImplementation(() =>
      jsonResponse(429, { ok: false, error: "You're sending feedback very quickly. Please wait a moment and try again." }),
    );
    await open();
    fill("Search could be faster");
    q<HTMLButtonElement>(".send").click();

    await vi.waitFor(() => expect(q(".error").textContent).toMatch(/very quickly/));
    expect(q<HTMLTextAreaElement>("textarea").value).toBe("Search could be faster");
    expect(q<HTMLButtonElement>(".send").disabled).toBe(false);
  });

  it("shows a friendly message when the network fails", async () => {
    await loadWidget();
    fetchMock.mockImplementation(() => Promise.reject(new TypeError("Failed to fetch")));
    await open();
    fill("Search could be faster");
    q<HTMLButtonElement>(".send").click();
    await vi.waitFor(() => expect(q(".error").textContent).toMatch(/couldn't send your feedback/i));
  });

  it("runs without network calls in demo mode", async () => {
    fetchMock.mockClear();
    await loadWidget({ "data-demo": "true" });
    await open();
    fill("Just trying it out");
    q<HTMLButtonElement>(".send").click();
    await vi.waitFor(() => expect(q<HTMLElement>(".done").hidden).toBe(false));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
