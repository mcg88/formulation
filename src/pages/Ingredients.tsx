import { useEffect, useState } from 'react';
import { supabase, type Ingredient, type Category, type InventoryPurchase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [purchases, setPurchases] = useState<InventoryPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const { user } = useAuth();

  const [ingredientForm, setIngredientForm] = useState({
    name: '',
    category_id: '',
    notes: '',
  });

  const [purchaseForm, setPurchaseForm] = useState({
    ingredient_id: '',
    supplier: '',
    purchase_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'g',
    cost: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ingredientsRes, categoriesRes, purchasesRes] = await Promise.all([
        supabase.from('ingredients').select('*, category:categories(*)').order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('inventory_purchases').select('*, ingredient:ingredients(*)').order('purchase_date', { ascending: false }),
      ]);

      if (ingredientsRes.error) throw ingredientsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (purchasesRes.error) throw purchasesRes.error;

      setIngredients(ingredientsRes.data || []);
      setCategories(categoriesRes.data || []);
      setPurchases(purchasesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIngredientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('ingredients').insert([
        {
          ...ingredientForm,
          category_id: ingredientForm.category_id || null,
          user_id: user!.id,
        },
      ]);

      if (error) throw error;

      setIngredientForm({ name: '', category_id: '', notes: '' });
      setShowIngredientForm(false);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('inventory_purchases').insert([
        {
          ...purchaseForm,
          quantity: parseFloat(purchaseForm.quantity),
          cost: parseFloat(purchaseForm.cost),
          user_id: user!.id,
        },
      ]);

      if (error) throw error;

      setPurchaseForm({
        ingredient_id: '',
        supplier: '',
        purchase_date: new Date().toISOString().split('T')[0],
        quantity: '',
        unit: 'g',
        cost: '',
        notes: '',
      });
      setShowPurchaseForm(false);
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm('Delete this ingredient? This will also delete all purchase records.')) return;

    try {
      const { error } = await supabase.from('ingredients').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (!confirm('Delete this purchase record?')) return;

    try {
      const { error } = await supabase.from('inventory_purchases').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getCostPerUnit = (ingredientId: string) => {
    const ingredientPurchases = purchases.filter((p) => p.ingredient_id === ingredientId);
    if (ingredientPurchases.length === 0) return null;

    const latestPurchase = ingredientPurchases[0];
    const costPerUnit = latestPurchase.cost / latestPurchase.quantity;
    return `$${costPerUnit.toFixed(4)}/${latestPurchase.unit}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Ingredients</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPurchaseForm(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Add Purchase
          </button>
          <button
            onClick={() => setShowIngredientForm(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Add Ingredient
          </button>
        </div>
      </div>

      {showIngredientForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Ingredient</h2>
          <form onSubmit={handleIngredientSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={ingredientForm.name}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={ingredientForm.category_id}
                  onChange={(e) => setIngredientForm({ ...ingredientForm, category_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">No Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={ingredientForm.notes}
                onChange={(e) => setIngredientForm({ ...ingredientForm, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowIngredientForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showPurchaseForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Purchase</h2>
          <form onSubmit={handlePurchaseSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ingredient *
                </label>
                <select
                  value={purchaseForm.ingredient_id}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, ingredient_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Ingredient</option>
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={purchaseForm.supplier}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purchase Date *
                </label>
                <input
                  type="date"
                  value={purchaseForm.purchase_date}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, purchase_date: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.quantity}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  value={purchaseForm.unit}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, unit: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="g">g (grams)</option>
                  <option value="kg">kg (kilograms)</option>
                  <option value="ml">ml (milliliters)</option>
                  <option value="l">l (liters)</option>
                  <option value="oz">oz (ounces)</option>
                  <option value="lb">lb (pounds)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseForm.cost}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, cost: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={purchaseForm.notes}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowPurchaseForm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Ingredients</h2>
          </div>
          {ingredients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No ingredients yet. Add your first ingredient to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ingredients.map((ingredient) => (
                <div key={ingredient.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{ingredient.name}</h3>
                      {ingredient.category && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                          {(ingredient.category as any).name}
                        </span>
                      )}
                      {ingredient.notes && (
                        <p className="mt-1 text-sm text-gray-500">{ingredient.notes}</p>
                      )}
                      <p className="mt-1 text-sm font-medium text-gray-700">
                        Cost: {getCostPerUnit(ingredient.id) || 'No purchases'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteIngredient(ingredient.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Purchases</h2>
          </div>
          {purchases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No purchases yet. Add a purchase to track costs.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {purchases.slice(0, 10).map((purchase) => (
                <div key={purchase.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {(purchase.ingredient as any)?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {purchase.quantity} {purchase.unit} - ${purchase.cost.toFixed(2)}
                        {purchase.supplier && ` from ${purchase.supplier}`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeletePurchase(purchase.id)}
                      className="text-red-600 hover:text-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
