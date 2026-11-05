import mongoose from 'mongoose';

const coinItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  circulation_or_bullion: { type: String, required: true, enum: ['circulation', 'bullion'] },
  Ag: { type: Number, required: true, min: 0, max: 1 },
  weight_g: { type: Number, required: true, min: 0 },
  weight_toz: { type: Number, required: true, min: 0 },
  ASW_toz: { type: Number, required: true, min: 0 },
  number: { type: Number, required: true, min: 0, validate: Number.isInteger },
  production_run: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 }
}, { collection: 'coin_items', autoIndex: false });

export const CoinItem = mongoose.models.CoinItem || mongoose.model('CoinItem', coinItemSchema);
