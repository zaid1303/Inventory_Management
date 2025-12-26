import mongoose, { Schema, model, models } from 'mongoose';
import 'dotenv/config';


export interface IInventory {
  sku_id: mongoose.Types.ObjectId;
  location: string;
  quantity: number;
  last_updated: Date;
}

const InventorySchema = new Schema<IInventory>({
  sku_id: { type: Schema.Types.ObjectId, ref: 'SKU', required: true },
  location: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  last_updated: { type: Date, default: Date.now },
});

InventorySchema.index({ sku_id: 1, location: 1 }, { unique: true });

const Inventory = models.Inventory || model<IInventory>('Inventory', InventorySchema);
export default Inventory;