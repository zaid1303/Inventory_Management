import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import SKU from '@/app/models/SKU';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const sku = await SKU.findById(params.id);
    
    if (!sku) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }
    
    return NextResponse.json(sku);
  } catch (error) {
    console.error('Error fetching SKU:', error);
    return NextResponse.json({ error: 'Failed to fetch SKU' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await request.json();
    
    const updatedSKU = await SKU.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!updatedSKU) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedSKU);
  } catch (error) {
    console.error('Error updating SKU:', error);
    return NextResponse.json({ error: 'Failed to update SKU' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deletedSKU = await SKU.findByIdAndDelete(params.id);
    
    if (!deletedSKU) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting SKU:', error);
    return NextResponse.json({ error: 'Failed to delete SKU' }, { status: 500 });
  }
}