import { cloneDoc } from "./doc";
import { HISTORY_MAX, type Doc } from "./types";

type Snapshot = { doc: Doc; undo: number; redo: number };

/** Synchronous editor transactions; React only subscribes to immutable snapshots. */
export function createHistory(initial: Doc) {
  let snapshot: Snapshot = { doc: initial, undo: 0, redo: 0 };
  let past: Doc[] = [];
  let future: Doc[] = [];
  const listeners = new Set<() => void>();
  const publish = (doc: Doc) => {
    snapshot = { doc, undo: past.length, redo: future.length };
    listeners.forEach((listener) => listener());
  };
  const checkpoint = () => {
    past = [...past, cloneDoc(snapshot.doc)].slice(-HISTORY_MAX);
    future = [];
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    setDoc: (next: Doc | ((prev: Doc) => Doc), record = true) => {
      const doc = typeof next === "function" ? next(snapshot.doc) : next;
      if (doc === snapshot.doc) return;
      if (record) checkpoint();
      // Any edit after undo starts a new branch, including unrecorded drag updates.
      future = [];
      publish(doc);
    },
    beginHistory: () => { checkpoint(); publish(snapshot.doc); },
    undo: () => {
      const doc = past.pop();
      if (!doc) return;
      future.push(cloneDoc(snapshot.doc));
      publish(doc);
    },
    redo: () => {
      const doc = future.pop();
      if (!doc) return;
      past = [...past, cloneDoc(snapshot.doc)].slice(-HISTORY_MAX);
      publish(doc);
    },
  };
}
