import { skus, inventory, stockMovements } from '../../db';
import { NextResponse } from 'next/server';

export async function GET() {
  const totalSKUs = skus.length;
  const totalValue = inventory.reduce((sum, inv) => {
    const sku = skus.find(s => s.id === inv.sku_id);
    return sum + ((sku?.unit_price || 0) * inv.quantity);
  }, 0);
  
  const lowStockItems = inventory.filter(inv => {
    const sku = skus.find(s => s.id === inv.sku_id);
    return inv.quantity <= (sku?.reorder_level || 0);
  }).length;
  
  const categories = [...new Set(skus.map(s => s.category))];
  const categoryBreakdown = categories.map(cat => {
    const catSKUs = skus.filter(s => s.category === cat);
    const catValue = inventory.reduce((sum, inv) => {
      const sku = skus.find(s => s.id === inv.sku_id && s.category === cat);
      return sum + ((sku?.unit_price || 0) * inv.quantity);
    }, 0);
    return { category: cat, value: catValue, count: catSKUs.length };
  });
  
  return NextResponse.json({
    totalSKUs,
    totalValue,
    lowStockItems,
    totalMovements: stockMovements.length,
    categoryBreakdown,
  });
}