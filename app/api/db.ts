export interface SKU {
  id: string;
  name: string;
  sku_code: string;
  category: string;
  unit: string;
  reorder_level: number;
  unit_price: number;
  location: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  sku_id: string;
  type: 'inward' | 'outward' | 'transfer' | 'damage';
  quantity: number;
  reference: string;
  notes: string;
  location: string;
  created_at: string;
}

export interface Inventory {
  sku_id: string;
  location: string;
  quantity: number;
  last_updated: string;
}

// In-memory storage
export const skus: SKU[] = [
  {
    id: '1',
    name: 'Vitrified Tiles 600x600mm',
    sku_code: 'VT-600-WHT',
    category: 'Flooring',
    unit: 'Box',
    reorder_level: 50,
    unit_price: 450,
    location: 'Warehouse-A',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Laminate Flooring Oak',
    sku_code: 'LF-OAK-8MM',
    category: 'Flooring',
    unit: 'SqFt',
    reorder_level: 500,
    unit_price: 85,
    location: 'Warehouse-A',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'LED Panel Light 2x2',
    sku_code: 'LED-2X2-40W',
    category: 'Lighting',
    unit: 'Piece',
    reorder_level: 30,
    unit_price: 1200,
    location: 'Warehouse-B',
    created_at: new Date().toISOString(),
  },
];

export const stockMovements: StockMovement[] = [];

export const inventory: Inventory[] = [
  { sku_id: '1', location: 'Warehouse-A', quantity: 120, last_updated: new Date().toISOString() },
  { sku_id: '2', location: 'Warehouse-A', quantity: 850, last_updated: new Date().toISOString() },
  { sku_id: '3', location: 'Warehouse-B', quantity: 25, last_updated: new Date().toISOString() },
];

export const updateInventory = (sku_id: string, location: string, quantity: number, type: string) => {
  const invIndex = inventory.findIndex(i => i.sku_id === sku_id && i.location === location);
  
  if (invIndex >= 0) {
    if (type === 'inward') {
      inventory[invIndex].quantity += quantity;
    } else if (type === 'outward' || type === 'damage') {
      inventory[invIndex].quantity -= quantity;
    }
    inventory[invIndex].last_updated = new Date().toISOString();
  } else {
    inventory.push({
      sku_id,
      location,
      quantity: type === 'inward' ? quantity : -quantity,
      last_updated: new Date().toISOString(),
    });
  }
};