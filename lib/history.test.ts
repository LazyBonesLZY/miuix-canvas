import { describe, expect, it, vi } from "vitest";
import { defaultDoc } from "./doc";
import { createHistory } from "./history";
import { HISTORY_MAX } from "./types";

describe("editor history", () => {
  it("applies transactions once and exposes their result synchronously", () => {
    const history = createHistory(defaultDoc("en"));
    const change = vi.fn((doc) => ({ ...doc, title: "Changed" }));
    history.setDoc(change);
    expect(change).toHaveBeenCalledTimes(1);
    expect(history.getSnapshot()).toMatchObject({ doc: { title: "Changed" }, undo: 1 });
    history.undo();
    expect(history.getSnapshot()).toMatchObject({ doc: { title: "Sample app" }, undo: 0, redo: 1 });
    history.redo();
    expect(history.getSnapshot()).toMatchObject({ doc: { title: "Changed" }, undo: 1, redo: 0 });
  });

  it("groups live drag updates into a single undo step", () => {
    const history = createHistory(defaultDoc("en"));
    history.beginHistory();
    for (const x of [4, 8, 12]) {
      history.setDoc((doc) => ({ ...doc, screens: doc.screens.map((screen) => ({ ...screen, x })) }), false);
    }
    expect(history.getSnapshot().undo).toBe(1);
    history.undo();
    expect(history.getSnapshot().doc.screens[0].x).toBe(0);
    history.redo();
    expect(history.getSnapshot().doc.screens[0].x).toBe(12);
  });

  it("does not record no-ops or clear redo until an actual edit", () => {
    const history = createHistory(defaultDoc("en"));
    history.setDoc((doc) => ({ ...doc, title: "A" }));
    history.undo();
    const before = history.getSnapshot();
    history.setDoc((doc) => doc);
    expect(history.getSnapshot()).toBe(before);
    history.setDoc((doc) => ({ ...doc, title: "B" }), false);
    expect(history.getSnapshot().redo).toBe(0);
  });

  it("notifies subscribers and bounds the history", () => {
    const history = createHistory(defaultDoc("en"));
    const notify = vi.fn();
    const unsubscribe = history.subscribe(notify);
    for (let i = 0; i <= HISTORY_MAX; i++) history.setDoc((doc) => ({ ...doc, title: String(i) }));
    expect(history.getSnapshot().undo).toBe(HISTORY_MAX);
    expect(notify).toHaveBeenCalledTimes(HISTORY_MAX + 1);
    unsubscribe();
    history.undo();
    expect(notify).toHaveBeenCalledTimes(HISTORY_MAX + 1);
  });
});
