import express from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './database.js';
import { CoinItem } from './coin-items.js';

export const app = express();
app.use(express.json({ limit: '16kb' }));

// note : the links were going to a coin items js because i was fooling around/trying to change this to connect to my own database - check the .env file

// server side endpoint to delete a thing in the thing
app.delete('/api/coin-items/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await connectDatabase();
    const result = await CoinItem.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Experience not found.' });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

app.get('/api/coin-items', async (req, res, next) => {
  try {
    await connectDatabase();
    const items = await CoinItem.find().lean();
    res.json(items);
  } catch (error) {
    next(error);
  }
});

app.post('/api/coin-items', async (req, res, next) => {
  try {
    const {
      name, circulation_or_bullion, Ag, weight_g, weight_toz, ASW_toz, number, production_run, description
    } = req.body || {};
    const item = new CoinItem({
      name, circulation_or_bullion, Ag, weight_g, weight_toz, ASW_toz, number, production_run, description
    });
    await item.validate();
    await connectDatabase();
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: 'Please check the coin item fields and try again.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large.' });
  }
  console.error('Coin API error:', error.name);
  res.status(500).json({ error: 'Unable to process the request. Please try again later.' });
});
