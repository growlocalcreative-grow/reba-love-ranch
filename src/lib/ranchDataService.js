/**
 * Ranch Data Service
 * Handles all Appwrite reads/writes for editable ranch data.
 * Updated for Multi-Tenancy (VITE_RANCH_ID) and strict Type Safety.
 */
import { databases, ID, Query, DB_ID } from './appwrite'
import { RANCH_CONFIG } from '../data/ranch.config'

// The specific ID for this ranch instance (from Vercel Env Vars)
const VITE_RANCH_ID = import.meta.env.VITE_RANCH_ID || 'rebalove-ranch';

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
    const res = await databases.listDocuments(DB_ID, colId, [
      Query.equal('ranch_id', VITE_RANCH_ID), // Filter by this ranch
      Query.limit(200), 
      ...queries
    ])
    return res.documents
  } catch (error) {
    console.error(`Error listing ${colId}:`, error);
    return null 
  }
}

async function createDoc(colId, data) {
  // Automatically inject the ranch_id into every new document
  const dataWithTenant = {
    ...data,
    ranch_id: VITE_RANCH_ID
  };
  return databases.createDocument(DB_ID, colId, ID.unique(), dataWithTenant)
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
  return await seedAnimals()
}

export async function seedAnimals() {
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
    evacuation_order: String(a.evacuationOrder || '0'), // Type fix: String
    evacuation_note: a.evacuationNote || '',
    archived: 'false',
    sort_order: String(i), // Type fix: String
  }))

  const created = []
  for (const item of items) {
    try {
      const doc = await createDoc(COLLECTIONS.animals, item)
      created.push(doc)
    } catch (e) {
      console.error('Failed to seed animal:', item.name, e)
    }
  }
  return created
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
    evacuation_order: String(animal.evacuation_order || '0'), // Type fix: String
    evacuation_note: animal.evacuation_note || '',
    archived: String(animal.archived || false),
    sort_order: String(animal.sort_order || 0), // Type fix: String
  }
  if (animal.$id && !animal.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.animals, animal.$id, data)
  }
  return createDoc(COLLECTIONS.animals, data)
}

export async function archiveAnimal(docId) {
  return updateDoc(COLLECTIONS.animals, docId, { archived: 'true' })
}

export async function deleteAnimal(docId) {
  return deleteDoc(COLLECTIONS.animals, docId)
}

// ── FEED SCHEDULE ─────────────────────────────────────────────

export async function getFeedSchedule() {
  const docs = await listDocs(COLLECTIONS.feedSchedule, [Query.orderAsc('animal_name')])
  if (docs && docs.length > 0) return docs

  const items = []
  RANCH_CONFIG.feedSchedule.forEach(entry => {
    entry.meals.forEach((meal, i) => {
      items.push({
        animal_name: entry.animal,
        meal_time: meal.time,
        time_window: meal.window || '',
        items: meal.items || '',
        has_medication: meal.hasMed === true || meal.hasMed === 'true', // Boolean is fine here
        sort_order: String(i), // Type fix: String
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
    has_medication: entry.has_medication === true || entry.has_medication === 'true',
    sort_order: String(entry.sort_order || 0), // Type fix: String
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
    sort_order: String(i), // Type fix: String
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
    active: task.active !== false && task.active !== 'false',
    sort_order: String(task.sort_order || 0), // Type fix: String
  }
  if (task.$id && !task.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.dailyTasks, task.$id, data)
  }
  return createDoc(COLLECTIONS.dailyTasks, data)
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
    frequency_days: String(t.frequency_days || 1), // Type fix: String
    priority: t.priority || 'normal',
    supply_location: t.supply_location || '',
    warning: t.warning || '',
    sort_order: String(i), // Type fix: String
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
    frequency_days: String(task.frequency_days || 1), // Type fix: String
    priority: task.priority || 'normal',
    supply_location: task.supply_location || '',
    warning: task.warning || '',
    sort_order: String(task.sort_order || 0), // Type fix: String
  }
  if (task.$id && !task.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.propertyTasks, task.$id, data)
  }
  return createDoc(COLLECTIONS.propertyTasks, data)
}

// ── TREATS ────────────────────────────────────────────────────

export async function getTreats() {
  const docs = await listDocs(COLLECTIONS.treats)
  if (docs && docs.length > 0) return docs

  const items = RANCH_CONFIG.treats.map((t, i) => ({
    animals: t.animals,
    emoji: t.emoji || '🥕',
    description: t.description,
    sort_order: String(i), // Type fix: String
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
    sort_order: String(treat.sort_order || 0), // Type fix: String
  }
  if (treat.$id && !treat.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.treats, treat.$id, data)
  }
  return createDoc(COLLECTIONS.treats, data)
}

// ── WATER NOTES ───────────────────────────────────────────────

export async function getWaterNotes() {
  const docs = await listDocs(COLLECTIONS.waterNotes)
  if (docs && docs.length > 0) return docs

  const items = RANCH_CONFIG.waterNotes.map((w, i) => ({
    emoji: w.emoji || '💧',
    note: w.note,
    urgent: w.urgent === true || w.urgent === 'true',
    sort_order: String(i), // Type fix: String
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
    urgent: item.urgent === true || item.urgent === 'true',
    sort_order: String(item.sort_order || 0), // Type fix: String
  }
  if (item.$id && !item.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.waterNotes, item.$id, data)
  }
  return createDoc(COLLECTIONS.waterNotes, data)
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
        sort_order: String(i++), // Type fix: String
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
    sort_order: String(contact.sort_order || 0), // Type fix: String
  }
  if (contact.$id && !contact.$id.startsWith('local-')) {
    return updateDoc(COLLECTIONS.contacts, contact.$id, data)
  }
  return createDoc(COLLECTIONS.contacts, data)
}

// Exporting manual seed functions for AdminPanel
export async function seedFeedSchedule() {
  const items = []
  RANCH_CONFIG.feedSchedule.forEach((entry, ei) => {
    entry.meals.forEach((meal, i) => {
      items.push({
        animal_name: entry.animal,
        meal_time: meal.time,
        time_window: meal.window || '',
        items: meal.items || '',
        has_medication: meal.hasMed === true || meal.hasMed === 'true',
        sort_order: String(ei * 10 + i),
      })
    })
  })
  for (const item of items) { await createDoc(COLLECTIONS.feedSchedule, item); }
  return true;
}

export async function seedDailyTasks() {
  const items = RANCH_CONFIG.dailyTasks.map((t, i) => ({
    task_id: t.id,
    label: t.label,
    icon: t.icon || '✅',
    time_period: t.time,
    note: t.note || '',
    active: true,
    sort_order: String(i),
  }))
  for (const item of items) { await createDoc(COLLECTIONS.dailyTasks, item); }
  return true;
}

export async function seedPropertyTasks() {
  const items = RANCH_CONFIG.propertyTasks.map((t, i) => ({
    task_key: t.id,
    title: t.title,
    description: t.description || '',
    category: t.category,
    frequency_days: String(t.frequency_days || 1),
    priority: t.priority || 'normal',
    supply_location: t.supply_location || '',
    warning: t.warning || '',
    sort_order: String(i),
  }))
  for (const item of items) { await createDoc(COLLECTIONS.propertyTasks, item); }
  return true;
}

export async function seedTreatsAndWater() {
  const treats = RANCH_CONFIG.treats.map((t, i) => ({
    animals: t.animals, emoji: t.emoji || '🥕', description: t.description, sort_order: String(i),
  }))
  const water = RANCH_CONFIG.waterNotes.map((w, i) => ({
    emoji: w.emoji || '💧', note: w.note, urgent: w.urgent === true || w.urgent === 'true', sort_order: String(i),
  }))
  for (const item of treats) { await createDoc(COLLECTIONS.treats, item); }
  for (const item of water) { await createDoc(COLLECTIONS.waterNotes, item); }
  return true;
}

export async function seedContacts() {
  const items = []
  let i = 0
  RANCH_CONFIG.emergencyContacts.forEach(group => {
    group.items.forEach(c => {
      items.push({
        category: group.category, name: c.name, role: c.role || '', phone: c.phone, display: c.display || c.phone, note: c.note || '', address: c.address || '', sort_order: String(i++),
      })
    })
  })
  for (const item of items) { await createDoc(COLLECTIONS.contacts, item); }
  return true;
}
