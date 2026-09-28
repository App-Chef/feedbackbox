import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, type TestDb } from "./harness";

const ALICE = "00000000-0000-4000-8000-00000000000a";
const BOB = "00000000-0000-4000-8000-00000000000b";

let db: TestDb;
let aliceProject: string;
let bobProject: string;

async function submit(projectId: string, message: string, clientKey = "client-1", email: string | null = null) {
  const { rows } = await as(db, "service_role", null, () =>
    db.query<{ result: { ok: boolean; id?: string; error?: string } }>(
      `select public.submit_feedback($1, $2, 'bug', $3, 'https://example.com/a', 'Chrome', 'macOS', 1440, 900, $4) as result`,
      [projectId, message, email, clientKey],
    ),
  );
  return rows[0].result;
}

beforeAll(async () => {
  db = await createTestDb();
  await createUser(db, ALICE, "alice@example.com");
  await createUser(db, BOB, "bob@example.com");

  aliceProject = await as(db, "authenticated", ALICE, async () => {
    const { rows } = await db.query<{ id: string }>(
      `insert into public.projects (name) values ('Amazu') returning id`,
    );
    return rows[0].id;
  });
  bobProject = await as(db, "authenticated", BOB, async () => {
    const { rows } = await db.query<{ id: string }>(
      `insert into public.projects (name) values ('Financ') returning id`,
    );
    return rows[0].id;
  });

  await submit(aliceProject, "Search is difficult to use", "seed-a");
  await submit(bobProject, "Login button does nothing", "seed-b");
});

describe("profiles", () => {
  it("creates a profile for every new auth user", async () => {
    const { rows } = await db.query(`select email from public.profiles order by email`);
    expect(rows).toEqual([{ email: "alice@example.com" }, { email: "bob@example.com" }]);
  });

  it("only exposes a user's own profile", async () => {
    const rows = await as(db, "authenticated", ALICE, async () =>
      (await db.query(`select email from public.profiles`)).rows,
    );
    expect(rows).toEqual([{ email: "alice@example.com" }]);
  });
});

describe("projects", () => {
  it("assigns new projects to the signed-in user", async () => {
    const { rows } = await db.query(`select user_id from public.projects where id = $1`, [aliceProject]);
    expect(rows[0]).toEqual({ user_id: ALICE });
  });

  it("only lists a user's own projects", async () => {
    const rows = await as(db, "authenticated", ALICE, async () =>
      (await db.query<{ name: string }>(`select name from public.projects`)).rows,
    );
    expect(rows.map((r) => r.name)).toEqual(["Amazu"]);
  });

  it("refuses to create a project owned by someone else", async () => {
    await expect(
      as(db, "authenticated", ALICE, () =>
        db.query(`insert into public.projects (name, user_id) values ('Sneaky', $1)`, [BOB]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("cannot update or delete another user's project", async () => {
    await as(db, "authenticated", ALICE, async () => {
      const upd = await db.query(`update public.projects set name = 'Hacked' where id = $1`, [bobProject]);
      const del = await db.query(`delete from public.projects where id = $1`, [bobProject]);
      expect(upd.affectedRows).toBe(0);
      expect(del.affectedRows).toBe(0);
    });
    const { rows } = await db.query(`select name from public.projects where id = $1`, [bobProject]);
    expect(rows[0]).toEqual({ name: "Financ" });
  });

  it("cannot transfer a project to another user", async () => {
    await expect(
      as(db, "authenticated", ALICE, () =>
        db.query(`update public.projects set user_id = $1 where id = $2`, [BOB, aliceProject]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("is invisible to anonymous visitors", async () => {
    await expect(
      as(db, "anon", null, () => db.query(`select * from public.projects`)),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("feedback", () => {
  it("only shows feedback for the user's own projects", async () => {
    const rows = await as(db, "authenticated", BOB, async () =>
      (await db.query<{ message: string }>(`select message from public.feedback`)).rows,
    );
    expect(rows.map((r) => r.message)).toEqual(["Login button does nothing"]);
  });

  it("lets the owner change status", async () => {
    await as(db, "authenticated", ALICE, async () => {
      const res = await db.query(
        `update public.feedback set status = 'resolved' where project_id = $1`,
        [aliceProject],
      );
      expect(res.affectedRows).toBe(1);
    });
  });

  it("rejects unknown statuses", async () => {
    await expect(
      as(db, "authenticated", ALICE, () =>
        db.query(`update public.feedback set status = 'done' where project_id = $1`, [aliceProject]),
      ),
    ).rejects.toThrow(/check constraint/);
  });

  it("does not let owners rewrite what users said", async () => {
    await expect(
      as(db, "authenticated", ALICE, () =>
        db.query(`update public.feedback set message = 'edited' where project_id = $1`, [aliceProject]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot change status of another user's feedback", async () => {
    await as(db, "authenticated", ALICE, async () => {
      const res = await db.query(
        `update public.feedback set status = 'archived' where project_id = $1`,
        [bobProject],
      );
      expect(res.affectedRows).toBe(0);
    });
  });

  it("cannot be inserted directly by signed-in users", async () => {
    await expect(
      as(db, "authenticated", ALICE, () =>
        db.query(`insert into public.feedback (project_id, message) values ($1, 'hello there')`, [aliceProject]),
      ),
    ).rejects.toThrow(/permission denied/);
  });

  it("cannot be read, inserted or modified by anonymous visitors", async () => {
    for (const sql of [
      `select * from public.feedback`,
      `insert into public.feedback (project_id, message) values ('${aliceProject}', 'spam spam')`,
      `update public.feedback set status = 'archived'`,
      `delete from public.feedback`,
    ]) {
      await expect(as(db, "anon", null, () => db.query(sql))).rejects.toThrow(/permission denied/);
    }
  });

  it("counts feedback per project through the invoker-rights view", async () => {
    const rows = await as(db, "authenticated", ALICE, async () =>
      (await db.query(`select total, open, resolved from public.project_feedback_counts`)).rows,
    );
    expect(rows).toEqual([{ total: 1, open: 0, resolved: 1 }]);
  });
});

describe("submit_feedback", () => {
  it("is not callable by anonymous or signed-in clients", async () => {
    for (const role of ["anon", "authenticated"] as const) {
      await expect(
        as(db, role, role === "anon" ? null : ALICE, () =>
          db.query(`select public.submit_feedback($1, 'hello world', 'bug')`, [aliceProject]),
        ),
      ).rejects.toThrow(/permission denied/);
    }
  });

  it("stores feedback with status open for a valid project", async () => {
    const result = await submit(aliceProject, "  Dark mode please  ", "client-x", "user@example.com");
    expect(result.ok).toBe(true);
    const { rows } = await db.query(
      `select message, status, type, email, browser, screen_width from public.feedback where id = $1`,
      [result.id],
    );
    expect(rows[0]).toEqual({
      message: "Dark mode please",
      status: "open",
      type: "bug",
      email: "user@example.com",
      browser: "Chrome",
      screen_width: 1440,
    });
  });

  it("rejects unknown projects", async () => {
    const result = await submit("00000000-0000-4000-8000-000000000000", "hello world");
    expect(result).toEqual({ ok: false, error: "project_not_found" });
  });

  it("enforces constraints even when called by the server", async () => {
    await expect(submit(aliceProject, "  ", "client-y")).rejects.toThrow(/check constraint/);
    await expect(submit(aliceProject, "valid message", "client-y", "not-an-email")).rejects.toThrow(
      /check constraint/,
    );
  });

  it("rate limits a single client per project", async () => {
    const results = [];
    for (let i = 0; i < 6; i++) results.push(await submit(bobProject, `message number ${i}`, "flooder"));
    expect(results.slice(0, 5).every((r) => r.ok)).toBe(true);
    expect(results[5]).toEqual({ ok: false, error: "rate_limited" });
    // Other clients are unaffected.
    expect((await submit(bobProject, "a different person", "someone-else")).ok).toBe(true);
  });

  it("does not leak rate limit data to clients", async () => {
    await expect(
      as(db, "authenticated", ALICE, () => db.query(`select * from private.rate_limits`)),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("get_widget_config", () => {
  it("returns only the widget config to anonymous visitors", async () => {
    const rows = await as(db, "anon", null, async () =>
      (await db.query(`select public.get_widget_config($1) as config`, [aliceProject])).rows,
    );
    expect(rows[0]).toEqual({
      config: { buttonLabel: "Feedback", accentColor: "#ff5a1f", position: "bottom-right" },
    });
  });

  it("returns null for unknown projects", async () => {
    const rows = await as(db, "anon", null, async () =>
      (await db.query(`select public.get_widget_config('00000000-0000-4000-8000-000000000000') as config`)).rows,
    );
    expect(rows[0]).toEqual({ config: null });
  });
});
