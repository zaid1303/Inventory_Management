import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Inventory from '@/app/models/Inventory';

export async function GET(
  request: Request,
  { params }: { params: { sku_id: string } }
) {
  try {
    await connectDB();
    const inventory = await Inventory.find({ sku_id: params.sku_id }).populate('sku_id');
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}