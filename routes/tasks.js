const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  createTask, updateTask, deleteTask, moveTask,
} = require('../controllers/taskController');

router.use(auth);

router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/move', moveTask);

module.exports = router;
