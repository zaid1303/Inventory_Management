import { inventory, skus } from '../db';

export async function GET() {
  const inventoryWithDetails = inventory.map(inv => {
    const sku = skus.find(s => s.id === inv.sku_id);
    return {
      ...inv,
      sku_name: sku?.name,
      sku_code: sku?.sku_code,
      category: sku?.category,
      unit: sku?.unit,
      reorder_level: sku?.reorder_level,
      unit_price: sku?.unit_price,
      value: (sku?.unit_price || 0) * inv.quantity,
      status: inv.quantity <= (sku?.reorder_level || 0) ? 'low' : 'ok',
    };
  });
  return Response.json(inventoryWithDetails);
}