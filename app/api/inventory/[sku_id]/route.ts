import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Inventory from '@/app/models/Inventory';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sku_id: string }> }
) {
  try {
    await connectDB();
    const { sku_id } = await params;
    const inventory = await Inventory.find({ sku_id }).populate('sku_id');
    return NextResponse.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ sku_id: string }> }
) {
  try {
    await connectDB();
    const { sku_id } = await params;
    const body = await request.json();
    const { location, quantity } = body;

    if (quantity === undefined || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: location and quantity' },
        { status: 400 }
      );
    }

    // Find and update the inventory item
    const updatedInventory = await Inventory.findOneAndUpdate(
      { sku_id, location },
      { 
        quantity: Number(quantity),
        last_updated: new Date()
      },
      { new: true, runValidators: true }
    ).populate('sku_id');

    if (!updatedInventory) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInventory);
  } catch (error) {
    console.error('Error updating inventory:', error);
    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ sku_id: string }> }
) {
  try {
    await connectDB();
    const { sku_id } = await params;
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!location) {
      return NextResponse.json(
        { error: 'Location parameter is required' },
        { status: 400 }
      );
    }

    const deletedInventory = await Inventory.findOneAndDelete({
      sku_id,
      location
    });

    if (!deletedInventory) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    return NextResponse.json(
      { error: 'Failed to delete inventory' },
      { status: 500 }
    );
  }
}