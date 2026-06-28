const { getDb } = require('../config/firebase')

/**
 * Task Service.
 * All Firestore operations for the tasks collection.
 * Ownership is enforced on every read/write by matching userId.
 */

/**
 * Creates a new task document for the authenticated user.
 *
 * @param {string} userId
 * @param {Object} taskData
 * @returns {Promise<Object>} Created task document
 */
async function createTask(userId, taskData) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const now = new Date().toISOString()
  const taskRef = db.collection('tasks').doc()

  const task = {
    id: taskRef.id,
    userId,
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    category: taskData.category || 'other',
    deadline: taskData.deadline || null,
    estimatedHours: taskData.estimatedHours != null ? Number(taskData.estimatedHours) : null,
    priorityScore: null,
    status: taskData.status || 'pending',
    createdAt: now,
    updatedAt: now,
  }

  await taskRef.set(task)
  return task
}

/**
 * Returns all tasks belonging to the authenticated user.
 * Ordered by createdAt descending (newest first).
 *
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
async function getTasks(userId) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const snapshot = await db
    .collection('tasks')
    .where('userId', '==', userId)
    .orderBy('createdAt', 'desc')
    .get()

  return snapshot.docs.map((doc) => doc.data())
}

/**
 * Returns a single task by ID.
 * Verifies ownership — throws FORBIDDEN if userId does not match.
 *
 * @param {string} taskId
 * @param {string} userId
 * @returns {Promise<Object>}
 */
async function getTaskById(taskId, userId) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const taskSnap = await db.collection('tasks').doc(taskId).get()

  if (!taskSnap.exists) throw new Error('TASK_NOT_FOUND')
  if (taskSnap.data().userId !== userId) throw new Error('FORBIDDEN')

  return taskSnap.data()
}

/**
 * Updates an existing task.
 * Verifies ownership before writing.
 *
 * @param {string} taskId
 * @param {string} userId
 * @param {Object} updates
 * @returns {Promise<Object>} Updated task document
 */
async function updateTask(taskId, userId, updates) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const taskRef = db.collection('tasks').doc(taskId)
  const taskSnap = await taskRef.get()

  if (!taskSnap.exists) throw new Error('TASK_NOT_FOUND')
  if (taskSnap.data().userId !== userId) throw new Error('FORBIDDEN')

  const now = new Date().toISOString()

  // Build the update payload — only include fields present in the request
  const allowedFields = ['title', 'description', 'category', 'deadline', 'estimatedHours', 'status', 'priorityScore']
  const updatePayload = { updatedAt: now }

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === 'title') updatePayload[field] = updates[field].trim()
      else if (field === 'estimatedHours') updatePayload[field] = updates[field] != null ? Number(updates[field]) : null
      else updatePayload[field] = updates[field]
    }
  }

  await taskRef.update(updatePayload)
  return { ...taskSnap.data(), ...updatePayload }
}

/**
 * Deletes a task by ID.
 * Verifies ownership before deletion.
 *
 * @param {string} taskId
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function deleteTask(taskId, userId) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const taskRef = db.collection('tasks').doc(taskId)
  const taskSnap = await taskRef.get()

  if (!taskSnap.exists) throw new Error('TASK_NOT_FOUND')
  if (taskSnap.data().userId !== userId) throw new Error('FORBIDDEN')

  await taskRef.delete()
}

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask }
