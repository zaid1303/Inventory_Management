import { stockMovements, skus, updateInventory } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';

export async function GET() {
  const movementsWithDetails = stockMovements.map(movement => {
    const sku = skus.find(s => s.id === movement.sku_id);
    return {
      ...movement,
      sku_name: sku?.name,
      sku_code: sku?.sku_code,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  
  return NextResponse.json(movementsWithDetails);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { sku_id, type, quantity, reference, notes, location } = body;
  
  if (!sku_id || !type || !quantity || !location) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const newMovement = {
    id: uuidv4(),
    sku_id,
    type,
    quantity: Number(quantity),
    reference: reference || '',
    notes: notes || '',
    location,
    created_at: new Date().toISOString(),
  };
  
  stockMovements.push(newMovement);
  updateInventory(sku_id, location, Number(quantity), type);
  
  return NextResponse.json(newMovement, { status: 201 });
}