export interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  reorderThreshold: number;
  costPrice: number;
  updatedAt: Date;
  createdAt: Date;
  createdBy: string;
}

export interface QuantityAudit {
  _id: string;
  itemId: string;
  userId: string;
  change: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  createdAt: Date;
}

export interface Category {
  value: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { value: 'dough', label: 'Dough & Base' },
  { value: 'sauce', label: 'Sauces' },
  { value: 'cheese', label: 'Cheese' },
  { value: 'meat', label: 'Meat' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'toppings', label: 'Toppings' },
  { value: 'drinks', label: 'Drinks' },
  { value: 'supplies', label: 'Supplies' },
];

export const UNITS = [
  'kg', 'g', 'lb', 'oz', 'L', 'ml', 'pieces', 'packages', 'cans'
];