import { inventory, skus } from '../../db';

export async function GET() {
  const inventoryWithValue = inventory.map(inv => {
    const sku = skus.find(s => s.id === inv.sku_id);
    return {
      sku_id: inv.sku_id,
      sku_name: sku?.name,
      sku_code: sku?.sku_code,
      quantity: inv.quantity,
      unit_price: sku?.unit_price || 0,
      value: (sku?.unit_price || 0) * inv.quantity,
    };
  }).sort((a, b) => b.value - a.value);
  
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
  
  return Response.json(abcAnalysis);
}