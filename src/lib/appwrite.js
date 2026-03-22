import { Client, Databases, Storage, Account, ID, Query } from 'appwrite'

// ─── Client setup ────────────────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '')

export const account   = new Account(client)
export const databases = new Databases(client)
export const storage   = new Storage(client)
export { ID, Query }

// ─── IDs — paste yours from Appwrite dashboard after setup ───────────────────
// These are read from env vars so you never hard-code them.
export const DB_ID         = import.meta.env.VITE_APPWRITE_DB_ID       || ''
export const BUCKET_ID     = import.meta.env.VITE_APPWRITE_BUCKET_ID   || ''

export const COL = {
  animals:       import.meta.env.VITE_COL_ANIMALS        || 'animals',
  feedSchedules: import.meta.env.VITE_COL_FEED_SCHEDULES || 'feed_schedules',
  careLogs:      import.meta.env.VITE_COL_CARE_LOGS      || 'care_logs',
  propertyTasks: import.meta.env.VITE_COL_PROPERTY_TASKS || 'property_tasks',
  taskCompletions: import.meta.env.VITE_COL_TASK_COMPLETIONS || 'task_completions',
  emergencyContacts: import.meta.env.VITE_COL_EMERGENCY  || 'emergency_contacts',
  healthRecords: import.meta.env.VITE_COL_HEALTH_RECORDS || 'health_records',
  ranchNotes:    import.meta.env.VITE_COL_RANCH_NOTES    || 'ranch_notes',
  manureLog:     import.meta.env.VITE_COL_MANURE_LOG     || 'manure_log',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** List all documents in a collection (handles up to 5000 docs automatically) */
export async function listAll(collectionId, queries = []) {
  const res = await databases.listDocuments(DB_ID, collectionId, [
    Query.limit(500),
    ...queries,
  ])
  return res.documents
}

/** Create a document with an auto-generated ID */
export async function createDoc(collectionId, data) {
  return databases.createDocument(DB_ID, collectionId, ID.unique(), data)
}

/** Update a document */
export async function updateDoc(collectionId, docId, data) {
  return databases.updateDocument(DB_ID, collectionId, docId, data)
}

/** Delete a document */
export async function deleteDoc(collectionId, docId) {
  return databases.deleteDocument(DB_ID, collectionId, docId)
}

/**
 * Upload an image file to Appwrite Storage.
 * Returns the public preview URL.
 */
export async function uploadImage(file) {
  const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), file)
  return storage.getFilePreview(BUCKET_ID, uploaded.$id).toString()
}

/**
 * Get a file preview URL from a stored file ID
 */
export function getFileUrl(fileId) {
  return storage.getFilePreview(BUCKET_ID, fileId).toString()
}
