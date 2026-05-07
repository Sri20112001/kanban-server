const mongoose = require('mongoose');

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  taskIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const boardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  columns: [columnSchema],
}, { timestamps: true });

module.exports = mongoose.model('Board', boardSchema);
