const Board = require('../models/Board');
const Task = require('../models/Task');

exports.exportData = async (req, res, next) => {
  try {
    const boards = await Board.find({ userId: req.userId }).lean();
    const boardIds = boards.map((b) => b._id);
    const tasks = await Task.find({ boardId: { $in: boardIds } }).lean();

    const cleanBoards = boards.map(({ _id, __v, userId, ...rest }) => ({
      ...rest,
      _ref: _id.toString(),
      columns: rest.columns.map(({ _id: colId, ...col }) => ({
        ...col,
        _ref: colId.toString(),
        taskIds: col.taskIds.map((id) => id.toString()),
      })),
    }));

    const cleanTasks = tasks.map(({ _id, __v, boardId, ...rest }) => ({
      ...rest,
      _ref: _id.toString(),
      boardRef: boardId.toString(),
    }));

    res.setHeader('Content-Disposition', 'attachment; filename=kanban-export.json');
    res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      boards: cleanBoards,
      tasks: cleanTasks,
    });
  } catch (err) {
    next(err);
  }
};

exports.exportBoard = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const tasks = await Task.find({ boardId: board._id }).lean();

    const { _id, __v, userId, ...boardRest } = board;
    const cleanBoard = {
      ...boardRest,
      _ref: _id.toString(),
      columns: boardRest.columns.map(({ _id: colId, ...col }) => ({
        ...col,
        _ref: colId.toString(),
        taskIds: col.taskIds.map((id) => id.toString()),
      })),
    };

    const cleanTasks = tasks.map(({ _id: tId, __v: v, boardId, ...rest }) => ({
      ...rest,
      _ref: tId.toString(),
      boardRef: _id.toString(),
    }));

    res.setHeader('Content-Disposition', `attachment; filename=${board.name.replace(/[^a-z0-9]/gi, '-')}-export.json`);
    res.json({
      version: 1,
      exportedAt: new Date().toISOString(),
      boards: [cleanBoard],
      tasks: cleanTasks,
    });
  } catch (err) {
    next(err);
  }
};

exports.importData = async (req, res, next) => {
  const session = await Board.startSession();
  try {
    const { boards, tasks } = req.body;

    if (!Array.isArray(boards) || !Array.isArray(tasks)) {
      return res.status(400).json({ message: 'Invalid format: expected { boards, tasks }' });
    }

    await session.withTransaction(async () => {
      // Clear existing user data
      const existingBoards = await Board.find({ userId: req.userId }).session(session).lean();
      const existingBoardIds = existingBoards.map((b) => b._id);
      await Task.deleteMany({ boardId: { $in: existingBoardIds } }).session(session);
      await Board.deleteMany({ userId: req.userId }).session(session);

      // Maps old refs to new IDs
      const boardRefMap = {};
      const taskRefMap = {};

      // Create boards first (without taskIds in columns)
      for (const boardData of boards) {
        const { _ref, columns, ...rest } = boardData;
        const [board] = await Board.create([{
          ...rest,
          userId: req.userId,
          columns: columns.map(({ _ref: colRef, taskIds, ...col }) => ({
            ...col,
            taskIds: [],
          })),
        }], { session });
        boardRefMap[_ref] = board;
      }

      // Create tasks
      for (const taskData of tasks) {
        const { _ref, boardRef, ...rest } = taskData;
        const board = boardRefMap[boardRef];
        if (!board) continue;

        const [task] = await Task.create([{
          ...rest,
          boardId: board._id,
        }], { session, timestamps: false });
        taskRefMap[_ref] = task._id;
      }

      // Wire taskIds into columns
      for (const boardData of boards) {
        const board = boardRefMap[boardData._ref];
        if (!board) continue;

        boardData.columns.forEach((colData, i) => {
          board.columns[i].taskIds = colData.taskIds
            .map((oldId) => taskRefMap[oldId])
            .filter(Boolean);
        });
        await board.save({ session });
      }
    });

    const boardCount = boards.length;
    const taskCount = tasks.length;
    res.json({ message: `Imported ${boardCount} boards and ${taskCount} tasks` });
  } catch (err) {
    next(err);
  } finally {
    await session.endSession();
  }
};
