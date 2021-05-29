const express = require('express');
const ProductModel = require('../models/productModel');

const router = express.Router();

router.get('/', async (_req, res) => {
  const products = await ProductModel.getAll();

  res.json(products);
});

router.get('/:id', async (req, res) => {
  const product = await ProductModel.getById(req.params.id);

  if (!product) return res.status(404).json({ message: 'Not found' });

  res.json(product);
});

router.post('/', async (req, res) => {
  const { name, brand } = req.body;

  const newProduct = await ProductModel.add(name, brand);

  if (!newProduct) return res.status(500).json({ message: 'Something went wrong' });

  res.status(201).json(newProduct);
});

router.delete('/:id', async (req, res) => {
  const wasDeleted = await ProductModel.exclude(req.params.id);

  if (!wasDeleted) return res.status(500).json({ message: 'Something went wrong' });

  res.status(204).end();
});

router.put('/:id', async (req, res) => {
  const { name, brand } = req.body;

  const wasUpdated = await ProductModel.update(req.params.id, name, brand);

  if (!wasUpdated) return res.status(500).json({ message: 'Something went wrong' });

  res.json({ message: 'Product successfully updated' });
});

module.exports = router;
