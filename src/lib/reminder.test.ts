import { describe, expect, it } from "vitest";

import { nextReminderDate } from "./reminder";

describe("daily reminder time", () => {
  it("fires later today when the chosen time has not passed", () => {
    const at = nextReminderDate(new Date(2026, 10, 22, 7, 0), "08:30");
    expect([at.getDate(), at.getHours(), at.getMinutes()]).toEqual([22, 8, 30]);
  });

  it("moves to tomorrow once today's time has passed", () => {
    const at = nextReminderDate(new Date(2026, 10, 22, 21, 0), "08:30");
    expect([at.getDate(), at.getHours(), at.getMinutes()]).toEqual([23, 8, 30]);
  });
});
