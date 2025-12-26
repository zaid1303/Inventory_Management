import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import SKU from '@/app/models/SKU';
import Inventory from '@/app/models/Inventory';

export async function GET() {
  try {
    await connectDB();
    const skus = await SKU.find({}).sort({ created_at: -1 });
    return NextResponse.json(skus);
  } catch (error) {
    console.error('Error fetching SKUs:', error);
    return NextResponse.json({ error: 'Failed to fetch SKUs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    const newSKU = await SKU.create({
      name: body.name,
      sku_code: body.sku_code,
      category: body.category,
      unit: body.unit,
      reorder_level: Number(body.reorder_level),
      unit_price: Number(body.unit_price),
      location: body.location,
    });

    // Initialize inventory for this SKU
    await Inventory.create({
      sku_id: newSKU._id,
      location: body.location,
      quantity: 0,
    });

    return NextResponse.json(newSKU, { status: 201 });
  } catch (error) {
    console.error('Error creating SKU:', error);
    return NextResponse.json({ error: 'Failed to create SKU' }, { status: 500 });
  }
}