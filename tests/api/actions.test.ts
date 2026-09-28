import { beforeEach, describe, expect, it, vi } from "vitest";

// A tiny fake of the Supabase query builder that records calls.
type Result = { data: unknown; error: unknown };
const calls: Array<{ table: string; op: string; payload?: unknown; filters: Array<[string, unknown]> }> = [];
let nextResult: Result = { data: [{ id: "x" }], error: null };

function builder(table: string) {
  const call = { table, op: "", payload: undefined as unknown, filters: [] as Array<[string, unknown]> };
  calls.push(call);
  const chain = {
    insert(payload: unknown) {
      call.op = "insert";
      call.payload = payload;
      return chain;
    },
    update(payload: unknown) {
      call.op = "update";
      call.payload = payload;
      return chain;
    },
    delete() {
      call.op = "delete";
      return chain;
    },
    eq(col: string, val: unknown) {
      call.filters.push([col, val]);
      return chain;
    },
    select() {
      return chain;
    },
    single() {
      return Promise.resolve(nextResult);
    },
    then(resolve: (r: Result) => void) {
      resolve(nextResult);
    },
  };
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: builder,
    auth: { getUser: async () => ({ data: { user: { id: "user-1" } } }) },
  }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const actions = await import("@/app/dashboard/actions");
const FEEDBACK = "3f1c9a52-7c1e-4d7a-9a3e-2b6f0d1e8c11";

function form(values: Record<string, string>) {
  const fd = new FormData();
  Object.entries(values).forEach(([k, v]) => fd.set(k, v));
  return fd;
}

beforeEach(() => {
  calls.length = 0;
  nextResult = { data: [{ id: "x" }], error: null };
});

describe("createProject", () => {
  it("requires a name", async () => {
    const result = await actions.createProject({}, form({ name: "   " }));
    expect(result.fieldErrors?.name).toBeTruthy();
    expect(calls).toHaveLength(0);
  });

  it("creates the project and sends the user to the install page", async () => {
    nextResult = { data: { id: "p1" }, error: null };
    await expect(actions.createProject({}, form({ name: " Amazu ", description: "" }))).rejects.toThrow(
      "REDIRECT:/dashboard/projects/p1/install?new=1",
    );
    // user_id is not sent: the database assigns auth.uid(), so it can't be spoofed.
    expect(calls[0]).toMatchObject({ table: "projects", op: "insert", payload: { name: "Amazu", description: null } });
  });

  it("reports database failures", async () => {
    nextResult = { data: null, error: { message: "boom" } };
    const result = await actions.createProject({}, form({ name: "Amazu" }));
    expect(result.error).toMatch(/couldn't create/i);
  });
});

describe("updateFeedbackStatus", () => {
  it("updates only the status of the given feedback", async () => {
    const result = await actions.updateFeedbackStatus(FEEDBACK, "resolved");
    expect(result).toEqual({ ok: true });
    expect(calls[0]).toMatchObject({
      table: "feedback",
      op: "update",
      payload: { status: "resolved" },
      filters: [["id", FEEDBACK]],
    });
  });

  it("rejects unknown statuses without touching the database", async () => {
    // @ts-expect-error testing untrusted input from the client
    const result = await actions.updateFeedbackStatus(FEEDBACK, "done");
    expect(result.error).toBeTruthy();
    expect(calls).toHaveLength(0);
  });

  it("reports an error when RLS hides the row (someone else's feedback)", async () => {
    nextResult = { data: [], error: null };
    const result = await actions.updateFeedbackStatus(FEEDBACK, "archived");
    expect(result.error).toMatch(/couldn't update/i);
  });
});

describe("updateWidgetConfig", () => {
  it("validates settings before saving", async () => {
    const result = await actions.updateWidgetConfig(
      "p1",
      {},
      form({ buttonLabel: "Feedback", accentColor: "orange", position: "bottom-right" }),
    );
    expect(result.fieldErrors?.accentColor).toBeTruthy();
    expect(calls).toHaveLength(0);
  });

  it("saves a normalized config", async () => {
    const result = await actions.updateWidgetConfig(
      "p1",
      {},
      form({ buttonLabel: "Ideas?", accentColor: "#00AAFF", position: "bottom-left" }),
    );
    expect(result).toEqual({ ok: true });
    expect(calls[0].payload).toEqual({
      widget_config: { buttonLabel: "Ideas?", accentColor: "#00aaff", position: "bottom-left" },
    });
  });
});
