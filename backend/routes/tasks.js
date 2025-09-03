const express = require('express');
const Task = require('../models/Task');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();
router.use(verifyToken);
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.userRole !== 'admin') {
      query.userId = req.user.uid;
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const task = new Task({
      title,
      description,
      userId: req.user.uid
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { title, description, completed } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    if (req.userRole !== 'admin' && task.userId !== req.user.uid) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    task.updatedAt = new Date();
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;