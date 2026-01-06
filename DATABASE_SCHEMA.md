# Database Schema for Noita Dashboard

## Tables

### categories
Stores ingredient categories (editable by user)
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### ingredients
Stores individual ingredients
```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### inventory_purchases
Tracks purchases of ingredients for cost calculation
```sql
CREATE TABLE inventory_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  supplier TEXT,
  purchase_date DATE NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL, -- g, kg, ml, l, oz, lb, etc.
  cost DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### formulations
Stores formulation metadata
```sql
CREATE TABLE formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- lotion, cream, serum, etc.
  default_batch_size DECIMAL(10,2) NOT NULL,
  batch_unit TEXT NOT NULL DEFAULT 'g', -- g, kg, ml, l, oz, lb
  ph_level TEXT,
  shelf_life TEXT,
  usage_instructions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### formulation_ingredients
Junction table for formulation ingredients
```sql
CREATE TABLE formulation_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id UUID REFERENCES formulations(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  percentage DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(formulation_id, ingredient_id)
);
```

### expense_categories
Stores expense categories for accounting
```sql
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### expenses
Stores business expenses
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  vendor TEXT,
  payment_method TEXT, -- cash, credit, debit, etc.
  receipt_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### income_categories
Stores income categories
```sql
CREATE TABLE income_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);
```

### income
Stores income/revenue records
```sql
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES income_categories(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  source TEXT, -- etsy, squarespace, custom, etc.
  payment_method TEXT,
  order_id TEXT, -- for imports
  customer_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### assets
Stores asset records for balance sheet
```sql
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL, -- current, fixed, etc.
  current_value DECIMAL(10,2) NOT NULL,
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### liabilities
Stores liability records for balance sheet
```sql
CREATE TABLE liabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  liability_type TEXT NOT NULL, -- current, long-term
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  creditor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

Enable RLS on all tables and create policies to ensure users can only access their own data:

```sql
-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formulation_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE liabilities ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Ingredients policies
CREATE POLICY "Users can view own ingredients" ON ingredients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ingredients" ON ingredients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ingredients" ON ingredients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ingredients" ON ingredients
  FOR DELETE USING (auth.uid() = user_id);

-- Inventory purchases policies
CREATE POLICY "Users can view own purchases" ON inventory_purchases
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own purchases" ON inventory_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own purchases" ON inventory_purchases
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own purchases" ON inventory_purchases
  FOR DELETE USING (auth.uid() = user_id);

-- Formulations policies
CREATE POLICY "Users can view own formulations" ON formulations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own formulations" ON formulations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own formulations" ON formulations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own formulations" ON formulations
  FOR DELETE USING (auth.uid() = user_id);

-- Formulation ingredients policies
CREATE POLICY "Users can view own formulation ingredients" ON formulation_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM formulations
      WHERE formulations.id = formulation_ingredients.formulation_id
      AND formulations.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own formulation ingredients" ON formulation_ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM formulations
      WHERE formulations.id = formulation_ingredients.formulation_id
      AND formulations.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own formulation ingredients" ON formulation_ingredients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM formulations
      WHERE formulations.id = formulation_ingredients.formulation_id
      AND formulations.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own formulation ingredients" ON formulation_ingredients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM formulations
      WHERE formulations.id = formulation_ingredients.formulation_id
      AND formulations.user_id = auth.uid()
    )
  );

-- Expense categories policies
CREATE POLICY "Users can view own expense categories" ON expense_categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expense categories" ON expense_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expense categories" ON expense_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expense categories" ON expense_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Income categories policies
CREATE POLICY "Users can view own income categories" ON income_categories
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income categories" ON income_categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income categories" ON income_categories
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income categories" ON income_categories
  FOR DELETE USING (auth.uid() = user_id);

-- Income policies
CREATE POLICY "Users can view own income" ON income
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own income" ON income
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own income" ON income
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own income" ON income
  FOR DELETE USING (auth.uid() = user_id);

-- Assets policies
CREATE POLICY "Users can view own assets" ON assets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own assets" ON assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own assets" ON assets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own assets" ON assets
  FOR DELETE USING (auth.uid() = user_id);

-- Liabilities policies
CREATE POLICY "Users can view own liabilities" ON liabilities
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liabilities" ON liabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own liabilities" ON liabilities
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own liabilities" ON liabilities
  FOR DELETE USING (auth.uid() = user_id);
```

## Setup Instructions

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the above SQL commands in order
3. Copy your project URL and anon key from Settings > API
4. Add them to your `.env` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
