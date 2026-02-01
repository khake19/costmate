import PouchDB from "pouchdb-browser";

// Single database for all documents (using type prefixes for separation)
export const db = new PouchDB("costmate");

// Expose to window for debugging (dev only)
if (import.meta.env.DEV) {
  (window as unknown as { costmateDb: typeof db }).costmateDb = db;
}

// Optional: Enable sync with CouchDB later
// export function enableSync(remoteUrl: string) {
//   return db.sync(remoteUrl, { live: true, retry: true });
// }
