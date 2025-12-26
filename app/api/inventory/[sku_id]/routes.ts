import { inventory } from '../../db';

export async function GET(request: Request, { params }: { params: { sku_id: string } }) {
  const inv = inventory.filter(i => i.sku_id === params.sku_id);
  return Response.json(inv);
}