import { useEffect, useState } from 'react';
import {
  supabase,
  Formulation,
  FormulationIngredient,
  Ingredient,
  InventoryPurchase,
} from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function Formulations() {
  const [formulations, setFormulations] = useState<Formulation[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedFormulation, setSelectedFormulation] = useState<string | null>(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    default_batch_size: '100',
    batch_unit: 'g',
    ph_level: '',
    shelf_life: '',
    usage_instructions: '',
    notes: '',
  });

  const [formulationIngredients, setFormulationIngredients] = useState<
    { ingredient_id: string; percentage: string; notes: string }[]
  >([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [formulationsRes, ingredientsRes] = await Promise.all([
        supabase.from('formulations').select('*').order('name'),
        supabase.from('ingredients').select('*').order('name'),
      ]);

      if (formulationsRes.error) throw formulationsRes.error;
      if (ingredientsRes.error) throw ingredientsRes.error;

      setFormulations(formulationsRes.data || []);
      setIngredients(ingredientsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalPercentage = formulationIngredients.reduce(
      (sum, ing) => sum + parseFloat(ing.percentage || '0'),
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      alert(`Total percentage must equal 100%. Current total: ${totalPercentage.toFixed(2)}%`);
      return;
    }

    try {
      const { data: formulation, error: formError } = await supabase
        .from('formulations')
        .insert([
          {
            ...formData,
            default_batch_size: parseFloat(formData.default_batch_size),
            user_id: user!.id,
          },
        ])
        .select()
        .single();

      if (formError) throw formError;

      const ingredientsToInsert = formulationIngredients.map((ing) => ({
        formulation_id: formulation.id,
        ingredient_id: ing.ingredient_id,
        percentage: parseFloat(ing.percentage),
        notes: ing.notes,
      }));

      const { error: ingredientsError } = await supabase
        .from('formulation_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) throw ingredientsError;

      resetForm();
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      default_batch_size: '100',
      batch_unit: 'g',
      ph_level: '',
      shelf_life: '',
      usage_instructions: '',
      notes: '',
    });
    setFormulationIngredients([]);
    setShowForm(false);
  };

  const addIngredientRow = () => {
    setFormulationIngredients([
      ...formulationIngredients,
      { ingredient_id: '', percentage: '', notes: '' },
    ]);
  };

  const updateIngredientRow = (
    index: number,
    field: string,
    value: string
  ) => {
    const updated = [...formulationIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setFormulationIngredients(updated);
  };

  const removeIngredientRow = (index: number) => {
    setFormulationIngredients(formulationIngredients.filter((_, i) => i !== index));
  };

  const handleDeleteFormulation = async (id: string) => {
    if (!confirm('Delete this formulation?')) return;

    try {
      const { error } = await supabase.from('formulations').delete().eq('id', id);
      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const totalPercentage = formulationIngredients.reduce(
    (sum, ing) => sum + parseFloat(ing.percentage || '0'),
    0
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Formulations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Create Formulation
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">New Formulation</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., lotion, cream, serum"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Default Batch Size *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.default_batch_size}
                  onChange={(e) =>
                    setFormData({ ...formData, default_batch_size: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Unit *
                </label>
                <select
                  value={formData.batch_unit}
                  onChange={(e) => setFormData({ ...formData, batch_unit: e.target.value })}
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
                  pH Level
                </label>
                <input
                  type="text"
                  value={formData.ph_level}
                  onChange={(e) => setFormData({ ...formData, ph_level: e.target.value })}
                  placeholder="e.g., 5.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shelf Life
                </label>
                <input
                  type="text"
                  value={formData.shelf_life}
                  onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                  placeholder="e.g., 6 months"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usage Instructions
              </label>
              <textarea
                value={formData.usage_instructions}
                onChange={(e) =>
                  setFormData({ ...formData, usage_instructions: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ingredients (Total: {totalPercentage.toFixed(2)}%)
                </label>
                <button
                  type="button"
                  onClick={addIngredientRow}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Add Ingredient
                </button>
              </div>
              {formulationIngredients.length === 0 ? (
                <p className="text-sm text-gray-500 italic">
                  No ingredients added yet. Click "Add Ingredient" to start.
                </p>
              ) : (
                <div className="space-y-2">
                  {formulationIngredients.map((ing, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <select
                          value={ing.ingredient_id}
                          onChange={(e) =>
                            updateIngredientRow(index, 'ingredient_id', e.target.value)
                          }
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select Ingredient</option>
                          {ingredients.map((ingredient) => (
                            <option key={ingredient.id} value={ingredient.id}>
                              {ingredient.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          step="0.01"
                          value={ing.percentage}
                          onChange={(e) =>
                            updateIngredientRow(index, 'percentage', e.target.value)
                          }
                          placeholder="%"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={ing.notes}
                          onChange={(e) =>
                            updateIngredientRow(index, 'notes', e.target.value)
                          }
                          placeholder="Notes (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeIngredientRow(index)}
                          className="w-full px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {totalPercentage !== 100 && formulationIngredients.length > 0 && (
                <p className="mt-2 text-sm text-orange-600">
                  Warning: Total percentage should equal 100%
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Create Formulation
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {formulations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            No formulations yet. Create your first formulation to get started.
          </div>
        ) : (
          formulations.map((formulation) => (
            <FormulationCard
              key={formulation.id}
              formulation={formulation}
              ingredients={ingredients}
              onDelete={handleDeleteFormulation}
              isExpanded={selectedFormulation === formulation.id}
              onToggle={() =>
                setSelectedFormulation(
                  selectedFormulation === formulation.id ? null : formulation.id
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

function FormulationCard({
  formulation,
  ingredients,
  onDelete,
  isExpanded,
  onToggle,
}: {
  formulation: Formulation;
  ingredients: Ingredient[];
  onDelete: (id: string) => void;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [formulationIngredients, setFormulationIngredients] = useState<
    FormulationIngredient[]
  >([]);
  const [purchases, setPurchases] = useState<InventoryPurchase[]>([]);
  const [batchSize, setBatchSize] = useState(formulation.default_batch_size.toString());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      loadFormulationDetails();
    }
  }, [isExpanded]);

  const loadFormulationDetails = async () => {
    setLoading(true);
    try {
      const [ingredientsRes, purchasesRes] = await Promise.all([
        supabase
          .from('formulation_ingredients')
          .select('*, ingredient:ingredients(*)')
          .eq('formulation_id', formulation.id)
          .order('percentage', { ascending: false }),
        supabase.from('inventory_purchases').select('*'),
      ]);

      if (ingredientsRes.error) throw ingredientsRes.error;
      if (purchasesRes.error) throw purchasesRes.error;

      setFormulationIngredients(ingredientsRes.data || []);
      setPurchases(purchasesRes.data || []);
    } catch (error) {
      console.error('Error loading formulation details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateIngredientAmount = (percentage: number) => {
    return (parseFloat(batchSize) * percentage) / 100;
  };

  const getCostForIngredient = (ingredientId: string, amount: number) => {
    const ingredientPurchases = purchases.filter((p) => p.ingredient_id === ingredientId);
    if (ingredientPurchases.length === 0) return null;

    const latestPurchase = ingredientPurchases[0];
    const costPerUnit = latestPurchase.cost / latestPurchase.quantity;
    return costPerUnit * amount;
  };

  const totalCost = formulationIngredients.reduce((sum, ing) => {
    const amount = calculateIngredientAmount(ing.percentage);
    const cost = getCostForIngredient(ing.ingredient_id, amount);
    return sum + (cost || 0);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">{formulation.name}</h2>
            {formulation.category && (
              <span className="inline-block mt-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded">
                {formulation.category}
              </span>
            )}
            {formulation.description && (
              <p className="mt-2 text-gray-600">{formulation.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onToggle}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {isExpanded ? 'Hide Details' : 'View Details'}
            </button>
            <button
              onClick={() => onDelete(formulation.id)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Default Batch:</span>
            <p className="font-medium">
              {formulation.default_batch_size} {formulation.batch_unit}
            </p>
          </div>
          {formulation.ph_level && (
            <div>
              <span className="text-gray-500">pH:</span>
              <p className="font-medium">{formulation.ph_level}</p>
            </div>
          )}
          {formulation.shelf_life && (
            <div>
              <span className="text-gray-500">Shelf Life:</span>
              <p className="font-medium">{formulation.shelf_life}</p>
            </div>
          )}
        </div>

        {isExpanded && !loading && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <label className="font-medium text-gray-700">Batch Size:</label>
              <input
                type="number"
                step="0.01"
                value={batchSize}
                onChange={(e) => setBatchSize(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg w-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="text-gray-600">{formulation.batch_unit}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Ingredient
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Percentage
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Amount ({formulation.batch_unit})
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Cost
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formulationIngredients.map((ing) => {
                    const amount = calculateIngredientAmount(ing.percentage);
                    const cost = getCostForIngredient(ing.ingredient_id, amount);
                    return (
                      <tr key={ing.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {(ing.ingredient as any)?.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {ing.percentage.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">
                          {amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-gray-700">
                          {cost ? `$${cost.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {ing.notes || '-'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3 text-sm">Total</td>
                    <td className="px-4 py-3 text-sm text-right">100.00%</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {parseFloat(batchSize).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      ${totalCost.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {formulation.usage_instructions && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Usage Instructions:</h3>
                <p className="text-sm text-gray-600">{formulation.usage_instructions}</p>
              </div>
            )}

            {formulation.notes && (
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Notes:</h3>
                <p className="text-sm text-gray-600">{formulation.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
