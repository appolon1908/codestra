import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LeadForm from "./LeadForm";
import { trackEvent } from "./analytics";

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router", () => ({ useNavigate: () => navigate }));
vi.mock("react-i18next", () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { resolvedLanguage: "en" } }) }));
vi.mock("../../i18n/LocalizedLink", () => ({ default: () => null }));
vi.mock("react-hook-form", () => ({
  useForm: () => ({
    register: (name: string) => ({ name }),
    watch: () => ({ unsubscribe: vi.fn() }),
    formState: { errors: {} },
    handleSubmit: (submit: (values: Record<string, unknown>) => Promise<void>) => (event: Event) => {
      event.preventDefault();
      return submit({ full_name: "Test", work_email: "test@example.invalid", message: "" });
    },
  }),
}));

describe("optional lead analytics", () => {
  let root: Root;
  let container: HTMLDivElement;
  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("codestra_analytics_consent", "granted");
    navigate.mockReset();
    container = document.createElement("div");
    root = createRoot(container);
  });
  afterEach(async () => {
    await act(async () => { root.unmount(); });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it.each(["all", "lead_delivery_succeeded"])("submits and confirms while %s analytics remains pending", async (stalledEvent) => {
    const fetchMock = vi.fn((url: string, options: RequestInit) => {
      if (url.endsWith("/analytics/events")) {
        const event = JSON.parse(String(options.body)).event_name;
        if (stalledEvent === "all" || event === stalledEvent) return new Promise<Response>(() => {});
      }
      return Promise.resolve(new Response(JSON.stringify({ request_id: "request-test" }), { status: 200 }));
    });
    vi.stubGlobal("fetch", fetchMock);
    await act(async () => { root.render(<LeadForm industrySelected="legal" />); });
    await act(async () => {
      container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(fetchMock.mock.calls.some(([url]) => url.endsWith("/api/v1/leads"))).toBe(true);
    expect(container.querySelector('[role="status"]')?.textContent).toBe("success");
    expect(container.querySelector("button")?.disabled).toBe(true);
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith("/en/thank-you?request_id=request-test"));
  });

  it("does not send telemetry without consent", async () => {
    localStorage.setItem("codestra_analytics_consent", "denied");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await trackEvent("lead_submitted");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles telemetry transport rejection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")));
    await expect(trackEvent("lead_submitted")).resolves.toBeUndefined();
  });

  it("handles unavailable consent storage without a rejected telemetry promise", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    await expect(trackEvent("lead_submitted")).resolves.toBeUndefined();
  });
});
