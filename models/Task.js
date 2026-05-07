const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  dueDate: { type: Date, default: null },
  labels: [{ type: String, trim: true }],
  boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
  status: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
