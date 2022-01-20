import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
  },
});

export default mongoose.model('User', userSchema);