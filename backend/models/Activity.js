import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['card_created', 'card_moved', 'card_updated', 'card_deleted', 'comment_added', 'member_added', 'member_removed', 'due_date_set', 'due_date_removed', 'label_added', 'label_removed', 'attachment_added', 'attachment_removed']
  },
  description: {
    type: String,
    required: true
  },
  card: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Card',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Activity', activitySchema);
