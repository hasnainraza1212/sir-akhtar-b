import  mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true // if each category should be unique
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
