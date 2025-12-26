import { skus } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(skus);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newSKU = {
    id: uuidv4(),
    ...body,
    reorder_level: Number(body.reorder_level),
    unit_price: Number(body.unit_price),
    created_at: new Date().toISOString(),
  };
  skus.push(newSKU);
  return NextResponse.json(newSKU, { status: 201 });
}