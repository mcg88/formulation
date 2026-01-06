import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Category {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface InventoryPurchase {
  id: string;
  user_id: string;
  ingredient_id: string;
  supplier?: string;
  purchase_date: string;
  quantity: number;
  unit: string;
  cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  ingredient?: Ingredient;
}

export interface Formulation {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  category?: string;
  default_batch_size: number;
  batch_unit: string;
  ph_level?: string;
  shelf_life?: string;
  usage_instructions?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FormulationIngredient {
  id: string;
  formulation_id: string;
  ingredient_id: string;
  percentage: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  ingredient?: Ingredient;
}

// Accounting Types
export interface ExpenseCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  category_id?: string;
  date: string;
  description: string;
  amount: number;
  vendor?: string;
  payment_method?: string;
  receipt_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: ExpenseCategory;
}

export interface IncomeCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  category_id?: string;
  date: string;
  description: string;
  amount: number;
  source?: string;
  payment_method?: string;
  order_id?: string;
  customer_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  category?: IncomeCategory;
}

export interface Asset {
  id: string;
  user_id: string;
  name: string;
  asset_type: string;
  current_value: number;
  purchase_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Liability {
  id: string;
  user_id: string;
  name: string;
  liability_type: string;
  amount: number;
  due_date?: string;
  creditor?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}
