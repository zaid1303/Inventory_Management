import mongoose, { Schema, model, models } from 'mongoose';
import 'dotenv/config';

export interface IStockMovement {
  sku_id: mongoose.Types.ObjectId;
  type: 'inward' | 'outward' | 'transfer' | 'damage';
  quantity: number;
  reference: string;
  notes: string;
  location: string;
  created_at: Date;
}

const StockMovementSchema = new Schema<IStockMovement>({
  sku_id: { type: Schema.Types.ObjectId, ref: 'SKU', required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['inward', 'outward', 'transfer', 'damage'] 
  },
  quantity: { type: Number, required: true },
  reference: { type: String, default: '' },
  notes: { type: String, default: '' },
  location: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

const StockMovement = models.StockMovement || model<IStockMovement>('StockMovement', StockMovementSchema);
export default StockMovement;