import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import SKU from '@/app/models/SKU';
import Inventory from '@/app/models/Inventory';
import StockMovement from '@/app/models/StockMovement';

export async function GET() {
  try {
    await connectDB();
    
    const totalSKUs = await SKU.countDocuments();
    
    const inventoryItems = await Inventory.find({}).populate('sku_id');
    
    let totalValue = 0;
    let lowStockItems = 0;
    
    inventoryItems.forEach((inv: any) => {
      const sku = inv.sku_id;
      totalValue += sku.unit_price * inv.quantity;
      if (inv.quantity <= sku.reorder_level) {
        lowStockItems++;
      }
    });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const totalMovements = await StockMovement.countDocuments({
      created_at: { $gte: thirtyDaysAgo }
    });
    
    // Category breakdown
    const skus = await SKU.find({});
    const categories = [...new Set(skus.map(s => s.category))];
    
    const categoryBreakdown = await Promise.all(
      categories.map(async (cat) => {
        const catSKUs = skus.filter(s => s.category === cat);
        const catSKUIds = catSKUs.map(s => s._id);
        
        const catInventory = await Inventory.find({
          sku_id: { $in: catSKUIds }
        }).populate('sku_id');
        
        const catValue = catInventory.reduce((sum: number, inv: any) => {
          return sum + (inv.sku_id.unit_price * inv.quantity);
        }, 0);
        
        return {
          category: cat,
          value: catValue,
          count: catSKUs.length
        };
      })
    );
    
    return NextResponse.json({
      totalSKUs,
      totalValue,
      lowStockItems,
      totalMovements,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}