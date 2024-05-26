import Category from '../models/Category/Category.js';

const categoryController = {
  async createCategory(req, res) {
    const { category } = req.body;

    try {
      const categoryExists = await Category.findOne({ category });

      if (categoryExists) {
        return res.status(400).json({
          success: false,
          status: 400,
          message: 'Category already exists',
        });
      }

      const newCategory = await Category.create({ category });

      if (newCategory) {
        res.status(201).json({
          success: true,
          status: 201,
          category: {
            _id: newCategory._id,
            category: newCategory.category,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          status: 400,
          message: 'Invalid category data',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  },

  async getCategories(req, res) {
    try {
      const categories = await Category.find();
      res.status(200).json({
        success: true,
        status: 200,
        categories: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  },

  async updateCategory(req, res) {
    const { id } = req.params;
    const { category } = req.body;

    try {
      const updatedCategory = await Category.findByIdAndUpdate(id, { category }, { new: true });

      if (updatedCategory) {
        res.status(200).json({
          success: true,
          status: 200,
          category: {
            _id: updatedCategory._id,
            category: updatedCategory.category,
          },
        });
      } else {
        res.status(404).json({
          success: false,
          status: 404,
          message: 'Category not found',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  },

  async deleteCategory(req, res) {
    const { id } = req.params;

    try {
      const deletedCategory = await Category.findByIdAndDelete(id);

      if (deletedCategory) {
        res.status(200).json({
          success: true,
          status: 200,
          message: 'Category deleted successfully',
        });
      } else {
        res.status(404).json({
          success: false,
          status: 404,
          message: 'Category not found',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        status: 500,
        message: error.message,
      });
    }
  },
};

    export default categoryController 