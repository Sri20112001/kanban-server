const router = require('express').Router();
const auth = require('../middleware/auth');
const {
  getBoards, getBoard, createBoard, updateBoard, deleteBoard,
  addColumn, renameColumn, deleteColumn,
} = require('../controllers/boardController');

router.use(auth);

router.get('/', getBoards);
router.post('/', createBoard);
router.get('/:id', getBoard);
router.put('/:id', updateBoard);
router.delete('/:id', deleteBoard);

router.post('/:id/columns', addColumn);
router.put('/:id/columns/:columnId', renameColumn);
router.delete('/:id/columns/:columnId', deleteColumn);

module.exports = router;
