import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Inventory from '@/app/models/Inventory';

export async function GET() {
  try {
    await connectDB();
    
    const inventoryItems = await Inventory.find({}).populate('sku_id');
    
    const inventoryWithValue = inventoryItems
      .map((inv: any) => ({
        sku_id: inv.sku_id._id,
        sku_name: inv.sku_id.name,
        sku_code: inv.sku_id.sku_code,
        quantity: inv.quantity,
        unit_price: inv.sku_id.unit_price,
        value: inv.sku_id.unit_price * inv.quantity,
      }))
      .sort((a, b) => b.value - a.value);
    
    const totalValue = inventoryWithValue.reduce((sum, item) => sum + item.value, 0);
    let cumulativeValue = 0;
    
    const abcAnalysis = inventoryWithValue.map(item => {
      cumulativeValue += item.value;
      const percentValue = (item.value / totalValue) * 100;
      const cumulativePercent = (cumulativeValue / totalValue) * 100;
      
      let category = 'C';
      if (cumulativePercent <= 80) category = 'A';
      else if (cumulativePercent <= 95) category = 'B';
      
      return {
        ...item,
        percentValue: percentValue.toFixed(2),
        cumulativePercent: cumulativePercent.toFixed(2),
        abcCategory: category,
      };
    });
    
    return NextResponse.json(abcAnalysis);
  } catch (error) {
    console.error('Error fetching ABC analysis:', error);
    return NextResponse.json({ error: 'Failed to fetch ABC analysis' }, { status: 500 });
  }
}