import express from 'express';
import categoryController from '../controllers/categoryController.js';

const router = express.Router();

// Route to create a new category
router.post('/create-category', categoryController.createCategory);

// Route to get all categories
router.get('/categories', categoryController.getCategories);

// Route to update a category by ID
router.put('/update-category/:id', categoryController.updateCategory);

// Route to delete a category by ID
router.delete('/delete-category/:id', categoryController.deleteCategory);

export default router;