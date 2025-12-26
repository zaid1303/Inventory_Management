import mongoose from 'mongoose';
import SKU from '../app/models/SKU';
import Inventory from '../app/models/Inventory';
import StockMovement from '../app/models/StockMovement';
import 'dotenv/config';


const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  await mongoose.connect(MONGODB_URI);
  
  // Clear existing data
  await SKU.deleteMany({});
  await Inventory.deleteMany({});
  await StockMovement.deleteMany({});
  
  // Create SKUs
  const sku1 = await SKU.create({
    name: 'Vitrified Tiles 600x600mm',
    sku_code: 'VT-600-WHT',
    category: 'Flooring',
    unit: 'Box',
    reorder_level: 50,
    unit_price: 450,
    location: 'Warehouse-A',
  });
  
  const sku2 = await SKU.create({
    name: 'Laminate Flooring Oak',
    sku_code: 'LF-OAK-8MM',
    category: 'Flooring',
    unit: 'SqFt',
    reorder_level: 500,
    unit_price: 85,
    location: 'Warehouse-A',
  });
  
  const sku3 = await SKU.create({
    name: 'LED Panel Light 2x2',
    sku_code: 'LED-2X2-40W',
    category: 'Lighting',
    unit: 'Piece',
    reorder_level: 30,
    unit_price: 1200,
    location: 'Warehouse-B',
  });
  
  const sku4 = await SKU.create({
    name: 'Cement Paint White 20L',
    sku_code: 'CP-WHT-20L',
    category: 'Paint',
    unit: 'Bucket',
    reorder_level: 20,
    unit_price: 3500,
    location: 'Warehouse-A',
  });
  
  const sku5 = await SKU.create({
    name: 'Steel Door Frame',
    sku_code: 'SDF-STD',
    category: 'Hardware',
    unit: 'Piece',
    reorder_level: 15,
    unit_price: 2800,
    location: 'Warehouse-C',
  });
  
  // Create inventory
  await Inventory.create([
    { sku_id: sku1._id, location: 'Warehouse-A', quantity: 120 },
    { sku_id: sku2._id, location: 'Warehouse-A', quantity: 850 },
    { sku_id: sku3._id, location: 'Warehouse-B', quantity: 25 },
    { sku_id: sku4._id, location: 'Warehouse-A', quantity: 45 },
    { sku_id: sku5._id, location: 'Warehouse-C', quantity: 12 },
  ]);
  
  // Create sample movements
  await StockMovement.create([
    {
      sku_id: sku1._id,
      type: 'inward',
      quantity: 50,
      reference: 'PO-2024-001',
      location: 'Warehouse-A',
      created_at: new Date(Date.now() - 86400000),
    },
    {
      sku_id: sku3._id,
      type: 'outward',
      quantity: 15,
      reference: 'INV-2024-045',
      location: 'Warehouse-B',
      created_at: new Date(Date.now() - 172800000),
    },
  ]);
  
  console.log('Database seeded successfully!');
  await mongoose.connection.close();
}

seed().catch(console.error);