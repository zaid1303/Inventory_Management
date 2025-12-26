import mongoose, { Schema, model, models } from 'mongoose';
import 'dotenv/config';

export interface ISKU {
  name: string;
  sku_code: string;
  category: string;
  unit: string;
  reorder_level: number;
  unit_price: number;
  location: string;
  created_at: Date;
}

const SKUSchema = new Schema<ISKU>({
  name: { type: String, required: true },
  sku_code: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  reorder_level: { type: Number, required: true },
  unit_price: { type: Number, required: true },
  location: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const SKU = models.SKU || model<ISKU>('SKU', SKUSchema);
export default SKU;