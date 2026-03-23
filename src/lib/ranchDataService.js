/**
 * Ranch Data Service
 * Handles all Appwrite reads/writes for editable ranch data.
 * Falls back to ranch.config.js if Appwrite isn't seeded yet.
 */
import { databases, ID, Query, DB_ID } from './appwrite'
import { RANCH_CONFIG } from '../data/ranch.config'

// ── Collection IDs ────────────────────────────────────────────
export const COLLECTIONS = {
  animals:       import.meta.env.VITE_COL_ANIMALS_EDIT        || 'animals_edit',
  feedSchedule:  import.meta.env.VITE_COL_FEED_EDIT           || 'feed_schedule_edit',
  dailyTasks:    import.meta.env.VITE_COL_DAILY_TASKS_EDIT    || 'daily_tasks_edit',
  propertyTasks: import.meta.env.VITE_COL_PROPERTY_TASKS_EDIT || 'property_tasks_edit',
  treats:        import.meta.env.VITE_COL_TREATS_EDIT         || 'treats_edit',
  waterNotes:    import.meta.env.VITE_COL_WATER_NOTES_EDIT    || 'water_notes_edit',
  contacts:      import.meta.env.VITE_COL_CONTACTS_EDIT       || 'contacts_edit',
}

// ── Generic helpers ───────────────────────────────────────────

async function listDocs(colId, queries = []) {
  try {
    const res = await databases.listDocuments(DB_ID, colId, [Query.limit(200), ...queries])
    return res.documents
  } catch {
    return null // collection not seeded yet
  }
}

async function createDoc(colId, data) {
  return databases.createDocument(DB_ID, colId, ID.unique(), data)
}

async function updateDoc(colId, docId, data) {
  return databases.updateDocument(DB_ID, colId, docId, data)
}

async function deleteDoc(colId, docId) {
  return databases.deleteDocument(DB_ID, colId, docId)
}

// ── SEED helpers (run once on first admin load) ───────────────

async function seedCollection(colId, items) {
  for (const item of items) {
    const { $id, $createdAt, $updatedAt, $permissions, $collectionId, $databaseId, ...clean } = item
    await createDoc(colId, clean)
  }
}

// ── ANIMALS ───────────────────────────────────────────────────

export async function getAnimals() {
  const docs = await listDocs(COLLECTIONS.animals, [Query.orderAsc('sort_order')])
  if (docs && docs.length > 0) return docs

  // Seed from config
  const items = RANCH_CONFIG.animals.map((a, i) => ({
    name: a.name,
    type: a.type,
    breed: a.breed || '',
    emoji: a.emoji || '🐾',
    notes: a.notes || '',
    likes: a.likes || '',
    dislikes: a.dislikes || '',
    odd_but_ok: a.odd_but_ok || '',
    special: JSON.stringify(a.special || []),
    evacuation_order: a.evacuationOrder || 0,
    evacuation_note: a.evacuationNote || '',
    archived: false,
    sort_order: i,
  }))

  try {
    await seedCollection(COLLECTIONS.animals, items)
    return listDocs(COLLECTIONS.animals, [Query.orderAsc('sort_order')])
  } catch {
    return RANCH_CONFIG.animals.map((a, i) => ({ ...a, $id: `local-${i}`, archived: false }))
  }
}

export async function saveAnimal(animal) {
  const data = {
    name: animal.name,
    type: animal.type,
    breed: animal.breed || '',
    emoji: animal.emoji || '🐾',
    notes: animal.notes || '',
    likes: animal.likes || '',
    dislikes: animal.dislikes || '',
    odd_but_ok: animal.odd_but_ok || '',
    special: JSON.stringify(animal.special || []),
    evacuation_order: animal.evacuation_order || 0,
    evacuation_note: animal.evacuation_note || '',
    archived: animal.archived || false,
    sort_order: animal.sort_order || 0,
  }
  if (animal.$id && !animal.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.animals, animal.$id, data)
  }
  return createDoc(COLLECTIONS.animals, data)
}

export async function archiveAnimal(docId) {
  return updateDoc(COLLECTIONS.animals, docId, { archived: true })
}

export async function deleteAnimal(docId) {
  return deleteDoc(COLLECTIONS.animals, docId)
}

// ── FEED SCHEDULE ─────────────────────────────────────────────

export async function getFeedSchedule() {
  const docs = await listDocs(COLLECTIONS.feedSchedule, [Query.orderAsc('animal_name')])
  if (docs && docs.length > 0) return docs

  // Seed from config
  const items = []
  RANCH_CONFIG.feedSchedule.forEach(entry => {
    entry.meals.forEach((meal, i) => {
      items.push({
        animal_name: entry.animal,
        meal_time: meal.time,
        time_window: meal.window || '',
        items: meal.items || '',
        has_medication: meal.hasMed || false,
        sort_order: i,
      })
    })
  })

  try {
    await seedCollection(COLLECTIONS.feedSchedule, items)
    return listDocs(COLLECTIONS.feedSchedule, [Query.orderAsc('animal_name')])
  } catch {
    return []
  }
}

export async function saveFeedEntry(entry) {
  const data = {
    animal_name: entry.animal_name,
    meal_time: entry.meal_time,
    time_window: entry.time_window || '',
    items: entry.items || '',
    has_medication: entry.has_medication || false,
    sort_order: entry.sort_order || 0,
  }
  if (entry.$id && !entry.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.feedSchedule, entry.$id, data)
  }
  return createDoc(COLLECTIONS.feedSchedule, data)
}

export async function deleteFeedEntry(docId) {
  return deleteDoc(COLLECTIONS.feedSchedule, docId)
}

// ── DAILY TASKS ───────────────────────────────────────────────

export async function getDailyTasks() {
  const docs = await listDocs(COLLECTIONS.dailyTasks, [Query.orderAsc('sort_order')])
  if (docs && docs.length > 0) return docs

  const items = RANCH_CONFIG.dailyTasks.map((t, i) => ({
    task_id: t.id,
    label: t.label,
    icon: t.icon || '✅',
    time_period: t.time,
    note: t.note || '',
    active: true,
    sort_order: i,
  }))

  try {
    await seedCollection(COLLECTIONS.dailyTasks, items)
    return listDocs(COLLECTIONS.dailyTasks, [Query.orderAsc('sort_order')])
  } catch {
    return []
  }
}

export async function saveDailyTask(task) {
  const data = {
    task_id: task.task_id || ID.unique(),
    label: task.label,
    icon: task.icon || '✅',
    time_period: task.time_period,
    note: task.note || '',
    active: task.active !== false,
    sort_order: task.sort_order || 0,
  }
  if (task.$id && !task.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.dailyTasks, task.$id, data)
  }
  return createDoc(COLLECTIONS.dailyTasks, data)
}

export async function deleteDailyTask(docId) {
  return deleteDoc(COLLECTIONS.dailyTasks, docId)
}

// ── PROPERTY TASKS ────────────────────────────────────────────

export async function getPropertyTasks() {
  const docs = await listDocs(COLLECTIONS.propertyTasks, [Query.orderAsc('sort_order')])
  if (docs && docs.length > 0) return docs

  const items = RANCH_CONFIG.propertyTasks.map((t, i) => ({
    task_key: t.id,
    title: t.title,
    description: t.description || '',
    category: t.category,
    frequency_days: t.frequency_days || 1,
    priority: t.priority || 'normal',
    supply_location: t.supply_location || '',
    warning: t.warning || '',
    sort_order: i,
  }))

  try {
    await seedCollection(COLLECTIONS.propertyTasks, items)
    return listDocs(COLLECTIONS.propertyTasks, [Query.orderAsc('sort_order')])
  } catch {
    return []
  }
}

export async function savePropertyTask(task) {
  const data = {
    task_key: task.task_key || task.id || ID.unique(),
    title: task.title,
    description: task.description || '',
    category: task.category,
    frequency_days: task.frequency_days || 1,
    priority: task.priority || 'normal',
    supply_location: task.supply_location || '',
    warning: task.warning || '',
    sort_order: task.sort_order || 0,
  }
  if (task.$id && !task.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.propertyTasks, task.$id, data)
  }
  return createDoc(COLLECTIONS.propertyTasks, data)
}

export async function deletePropertyTask(docId) {
  return deleteDoc(COLLECTIONS.propertyTasks, docId)
}

// ── TREATS ────────────────────────────────────────────────────

export async function getTreats() {
  const docs = await listDocs(COLLECTIONS.treats)
  if (docs && docs.length > 0) return docs

  const items = RANCH_CONFIG.treats.map((t, i) => ({
    animals: t.animals,
    emoji: t.emoji || '🥕',
    description: t.description,
    sort_order: i,
  }))

  try {
    await seedCollection(COLLECTIONS.treats, items)
    return listDocs(COLLECTIONS.treats)
  } catch {
    return []
  }
}

export async function saveTreat(treat) {
  const data = {
    animals: treat.animals,
    emoji: treat.emoji || '🥕',
    description: treat.description,
    sort_order: treat.sort_order || 0,
  }
  if (treat.$id && !treat.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.treats, treat.$id, data)
  }
  return createDoc(COLLECTIONS.treats, data)
}

export async function deleteTreat(docId) {
  return deleteDoc(COLLECTIONS.treats, docId)
}

// ── WATER NOTES ───────────────────────────────────────────────

export async function getWaterNotes() {
  const docs = await listDocs(COLLECTIONS.waterNotes)
  if (docs && docs.length > 0) return docs

  const items = RANCH_CONFIG.waterNotes.map((w, i) => ({
    emoji: w.emoji || '💧',
    note: w.note,
    urgent: w.urgent || false,
    sort_order: i,
  }))

  try {
    await seedCollection(COLLECTIONS.waterNotes, items)
    return listDocs(COLLECTIONS.waterNotes)
  } catch {
    return []
  }
}

export async function saveWaterNote(item) {
  const data = {
    emoji: item.emoji || '💧',
    note: item.note,
    urgent: item.urgent || false,
    sort_order: item.sort_order || 0,
  }
  if (item.$id && !item.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.waterNotes, item.$id, data)
  }
  return createDoc(COLLECTIONS.waterNotes, data)
}

export async function deleteWaterNote(docId) {
  return deleteDoc(COLLECTIONS.waterNotes, docId)
}

// ── EMERGENCY CONTACTS ────────────────────────────────────────

export async function getContacts() {
  const docs = await listDocs(COLLECTIONS.contacts, [Query.orderAsc('sort_order')])
  if (docs && docs.length > 0) return docs

  const items = []
  let i = 0
  RANCH_CONFIG.emergencyContacts.forEach(group => {
    group.items.forEach(c => {
      items.push({
        category: group.category,
        name: c.name,
        role: c.role || '',
        phone: c.phone,
        display: c.display || c.phone,
        note: c.note || '',
        address: c.address || '',
        sort_order: i++,
      })
    })
  })

  try {
    await seedCollection(COLLECTIONS.contacts, items)
    return listDocs(COLLECTIONS.contacts, [Query.orderAsc('sort_order')])
  } catch {
    return []
  }
}

export async function saveContact(contact) {
  const data = {
    category: contact.category,
    name: contact.name,
    role: contact.role || '',
    phone: contact.phone,
    display: contact.display || contact.phone,
    note: contact.note || '',
    address: contact.address || '',
    sort_order: contact.sort_order || 0,
  }
  if (contact.$id && !contact.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.contacts, contact.$id, data)
  }
  return createDoc(COLLECTIONS.contacts, data)
}

export async function deleteContact(docId) {
  return deleteDoc(COLLECTIONS.contacts, docId)
}
