import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import StockMovement from '@/app/models/StockMovement';
import Inventory from '@/app/models/Inventory';
import SKU from '@/app/models/SKU';

export async function GET() {
  try {
    await connectDB();
    
    const movements = await StockMovement.find({})
      .populate('sku_id')
      .sort({ created_at: -1 })
      .limit(100);
    
    const movementsWithDetails = movements.map((movement: any) => ({
      id: movement._id,
      sku_id: movement.sku_id._id,
      sku_name: movement.sku_id.name,
      sku_code: movement.sku_id.sku_code,
      type: movement.type,
      quantity: movement.quantity,
      reference: movement.reference,
      notes: movement.notes,
      location: movement.location,
      created_at: movement.created_at,
    }));
    
    return NextResponse.json(movementsWithDetails);
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json({ error: 'Failed to fetch movements' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { sku_id, type, quantity, reference, notes, location } = body;
    
    if (!sku_id || !type || !quantity || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Create movement record
    const newMovement = await StockMovement.create({
      sku_id,
      type,
      quantity: Number(quantity),
      reference: reference || '',
      notes: notes || '',
      location,
    });
    
    // Update inventory
    const inventory = await Inventory.findOne({ sku_id, location });
    
    if (inventory) {
      if (type === 'inward') {
        inventory.quantity += Number(quantity);
      } else if (type === 'outward' || type === 'damage') {
        inventory.quantity -= Number(quantity);
      }
      inventory.last_updated = new Date();
      await inventory.save();
    } else {
      // Create new inventory record
      await Inventory.create({
        sku_id,
        location,
        quantity: type === 'inward' ? Number(quantity) : -Number(quantity),
      });
    }
    
    return NextResponse.json(newMovement, { status: 201 });
  } catch (error) {
    console.error('Error creating movement:', error);
    return NextResponse.json({ error: 'Failed to create movement' }, { status: 500 });
  }
}