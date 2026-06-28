const express = require('express')
const { authenticate } = require('../middleware/auth.middleware')
const taskController = require('../controllers/task.controller')

const router = express.Router()

// All task routes require authentication
router.use(authenticate)

router.post('/', taskController.create)
router.get('/', taskController.list)
router.get('/:id', taskController.getOne)
router.put('/:id', taskController.update)
router.delete('/:id', taskController.remove)

module.exports = router
