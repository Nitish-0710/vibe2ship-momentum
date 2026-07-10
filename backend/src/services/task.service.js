const mongoose = require('mongoose');
const Task = require('../models/Task');

/**
 * Task Service.
 * All MongoDB operations for the tasks collection.
 */

/**
 * Creates a new task document for the authenticated user.
 *
 * @param {string} userId
 * @param {Object} taskData
 * @returns {Promise<Object>} Created task document
 */
async function createTask(userId, taskData) {
  const now = new Date().toISOString();
  const taskId = new mongoose.Types.ObjectId().toString();

  const task = new Task({
    id: taskId,
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
  });

  await task.save();
  return task.toObject();
}

/**
 * Returns all tasks belonging to the authenticated user.
 * Ordered by createdAt descending (newest first).
 *
 * @param {string} userId
 * @returns {Promise<Object[]>}
 */
async function getTasks(userId) {
  const tasks = await Task.find({ userId }).sort({ createdAt: -1 });
  return tasks.map((task) => task.toObject());
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
  const task = await Task.findOne({ id: taskId });

  if (!task) throw new Error('TASK_NOT_FOUND');
  if (task.userId !== userId) throw new Error('FORBIDDEN');

  return task.toObject();
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
  const task = await Task.findOne({ id: taskId });

  if (!task) throw new Error('TASK_NOT_FOUND');
  if (task.userId !== userId) throw new Error('FORBIDDEN');

  const now = new Date().toISOString();
  const allowedFields = ['title', 'description', 'category', 'deadline', 'estimatedHours', 'status', 'priorityScore'];

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      if (field === 'title') task[field] = updates[field].trim();
      else if (field === 'estimatedHours') task[field] = updates[field] != null ? Number(updates[field]) : null;
      else task[field] = updates[field];
    }
  }

  task.updatedAt = now;
  await task.save();
  return task.toObject();
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
  const task = await Task.findOne({ id: taskId });

  if (!task) throw new Error('TASK_NOT_FOUND');
  if (task.userId !== userId) throw new Error('FORBIDDEN');

  await Task.deleteOne({ id: taskId });
}

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
