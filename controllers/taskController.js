const Task = require('../models/Task');
const Board = require('../models/Board');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, labels, boardId, columnId } = req.body;

    const board = await Board.findOne({ _id: boardId, userId: req.userId });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const column = board.columns.id(columnId);
    if (!column) return res.status(404).json({ message: 'Column not found' });

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      labels: labels || [],
      boardId,
      status: column.title,
    });

    column.taskIds.push(task._id);
    await board.save();

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, labels } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Verify ownership
    const board = await Board.findOne({ _id: task.boardId, userId: req.userId });
    if (!board) return res.status(403).json({ message: 'Forbidden' });

    Object.assign(task, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate || null }),
      ...(labels !== undefined && { labels }),
    });
    await task.save();

    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const board = await Board.findOne({ _id: task.boardId, userId: req.userId });
    if (!board) return res.status(403).json({ message: 'Forbidden' });

    // Remove task ID from its column
    for (const col of board.columns) {
      const idx = col.taskIds.indexOf(task._id);
      if (idx !== -1) {
        col.taskIds.splice(idx, 1);
        break;
      }
    }
    await board.save();
    await task.deleteOne();

    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

exports.moveTask = async (req, res, next) => {
  try {
    const { taskId, sourceColumnId, destinationColumnId, position } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const board = await Board.findOne({ _id: task.boardId, userId: req.userId });
    if (!board) return res.status(403).json({ message: 'Forbidden' });

    const sourceCol = board.columns.id(sourceColumnId);
    const destCol = board.columns.id(destinationColumnId);
    if (!sourceCol || !destCol) {
      return res.status(404).json({ message: 'Column not found' });
    }

    // Remove from source
    sourceCol.taskIds = sourceCol.taskIds.filter((id) => id.toString() !== taskId);

    // Insert at position in destination
    const pos = Math.min(position ?? destCol.taskIds.length, destCol.taskIds.length);
    destCol.taskIds.splice(pos, 0, task._id);

    // Update task status if column changed
    if (sourceColumnId !== destinationColumnId) {
      task.status = destCol.title;
      await task.save();
    }

    await board.save();
    res.json({ board, task });
  } catch (err) {
    next(err);
  }
};
