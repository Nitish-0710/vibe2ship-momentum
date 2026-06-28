const taskService = require('../services/task.service')
const { validateCreateTask, validateUpdateTask } = require('../validators/task.validator')

/**
 * Task Controller — thin layer only.
 * Validates request, delegates to service, formats response.
 * No business logic here.
 */

/** POST /tasks */
async function create(req, res) {
  const errors = validateCreateTask(req.body)
  if (errors) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', messages: errors } })
  }
  try {
    const task = await taskService.createTask(req.user.uid, req.body)
    return res.status(201).json({ success: true, data: task })
  } catch (err) {
    console.error('task.controller.create:', err.message)
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
  }
}

/** GET /tasks */
async function list(req, res) {
  try {
    const tasks = await taskService.getTasks(req.user.uid)
    return res.status(200).json({ success: true, data: tasks })
  } catch (err) {
    console.error('task.controller.list:', err.message)
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
  }
}

/** GET /tasks/:id */
async function getOne(req, res) {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.uid)
    return res.status(200).json({ success: true, data: task })
  } catch (err) {
    if (err.message === 'TASK_NOT_FOUND') return res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } })
    if (err.message === 'FORBIDDEN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } })
    console.error('task.controller.getOne:', err.message)
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
  }
}

/** PUT /tasks/:id */
async function update(req, res) {
  const errors = validateUpdateTask(req.body)
  if (errors) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', messages: errors } })
  }
  try {
    const task = await taskService.updateTask(req.params.id, req.user.uid, req.body)
    return res.status(200).json({ success: true, data: task })
  } catch (err) {
    if (err.message === 'TASK_NOT_FOUND') return res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } })
    if (err.message === 'FORBIDDEN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } })
    console.error('task.controller.update:', err.message)
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
  }
}

/** DELETE /tasks/:id */
async function remove(req, res) {
  try {
    await taskService.deleteTask(req.params.id, req.user.uid)
    return res.status(200).json({ success: true, data: { id: req.params.id } })
  } catch (err) {
    if (err.message === 'TASK_NOT_FOUND') return res.status(404).json({ success: false, error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' } })
    if (err.message === 'FORBIDDEN') return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } })
    console.error('task.controller.remove:', err.message)
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } })
  }
}

module.exports = { create, list, getOne, update, remove }
