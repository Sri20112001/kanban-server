const Board = require('../models/Board');
const Task = require('../models/Task');

const DEFAULT_COLUMNS = [
  { title: 'Todo', taskIds: [] },
  { title: 'In Progress', taskIds: [] },
  { title: 'Done', taskIds: [] },
];

exports.getBoards = async (req, res, next) => {
  try {
    const boards = await Board.find({ userId: req.userId }).sort('-createdAt');
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

exports.getBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const tasks = await Task.find({ boardId: board._id });
    res.json({ board, tasks });
  } catch (err) {
    next(err);
  }
};

exports.createBoard = async (req, res, next) => {
  try {
    const { name, columns } = req.body;
    const board = await Board.create({
      name,
      userId: req.userId,
      columns: columns?.length ? columns.map((c) => ({ title: c.title, taskIds: [] })) : DEFAULT_COLUMNS,
    });
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
};

exports.updateBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { name: req.body.name } },
      { new: true },
    );
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    next(err);
  }
};

exports.deleteBoard = async (req, res, next) => {
  try {
    const board = await Board.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    await Task.deleteMany({ boardId: board._id });
    res.json({ message: 'Board deleted' });
  } catch (err) {
    next(err);
  }
};

exports.addColumn = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Column title is required' });

    const board = await Board.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    board.columns.push({ title: title.trim(), taskIds: [] });
    await board.save();
    res.status(201).json(board);
  } catch (err) {
    next(err);
  }
};

exports.renameColumn = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Column title is required' });

    const board = await Board.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Column not found' });

    const oldTitle = column.title;
    column.title = title.trim();
    await board.save();

    // Update task statuses to match new column title
    await Task.updateMany(
      { boardId: board._id, status: oldTitle },
      { $set: { status: column.title } },
    );

    res.json(board);
  } catch (err) {
    next(err);
  }
};

exports.deleteColumn = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const column = board.columns.id(req.params.columnId);
    if (!column) return res.status(404).json({ message: 'Column not found' });

    // Delete all tasks in this column
    await Task.deleteMany({ _id: { $in: column.taskIds } });

    board.columns.pull(req.params.columnId);
    await board.save();
    res.json(board);
  } catch (err) {
    next(err);
  }
};
