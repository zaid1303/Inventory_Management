import { skus } from '../db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  return Response.json(skus);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newSKU = {
    id: uuidv4(),
    ...body,
    created_at: new Date().toISOString(),
  };
  skus.push(newSKU);
  return Response.json(newSKU, { status: 201 });
}