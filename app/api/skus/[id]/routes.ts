import { skus } from '../../db';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sku = skus.find(s => s.id === params.id);
  if (!sku) {
    return Response.json({ error: 'SKU not found' }, { status: 404 });
  }
  return Response.json(sku);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const index = skus.findIndex(s => s.id === params.id);
  if (index === -1) {
    return Response.json({ error: 'SKU not found' }, { status: 404 });
  }
  skus[index] = { ...skus[index], ...body };
  return Response.json(skus[index]);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const index = skus.findIndex(s => s.id === params.id);
  if (index === -1) {
    return Response.json({ error: 'SKU not found' }, { status: 404 });
  }
  skus.splice(index, 1);
  return new Response(null, { status: 204 });
}