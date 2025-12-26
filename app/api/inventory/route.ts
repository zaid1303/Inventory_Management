import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Inventory from '@/app/models/Inventory';
import SKU from '@/app/models/SKU';

export async function GET() {
  try {
    await connectDB();
    
    const inventoryItems = await Inventory.find({}).populate('sku_id');
    
    const inventoryWithDetails = inventoryItems
      .filter((inv: any) => inv.sku_id !== null) // Filter out items with deleted SKUs
      .map((inv: any) => {
        const sku = inv.sku_id;
        return {
          _id: inv._id,
          sku_id: sku._id,
          sku_name: sku.name,
          sku_code: sku.sku_code,
          category: sku.category,
          location: inv.location,
          quantity: inv.quantity,
          unit: sku.unit,
          reorder_level: sku.reorder_level,
          unit_price: sku.unit_price,
          value: sku.unit_price * inv.quantity,
          status: inv.quantity <= sku.reorder_level ? 'low' : 'ok',
          last_updated: inv.last_updated,
        };
      });
    
    return NextResponse.json(inventoryWithDetails);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}