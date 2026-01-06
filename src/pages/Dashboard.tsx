import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    formulations: 0,
    ingredients: 0,
    categories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [formulations, ingredients, categories] = await Promise.all([
        supabase.from('formulations').select('id', { count: 'exact', head: true }),
        supabase.from('ingredients').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        formulations: formulations.count || 0,
        ingredients: ingredients.count || 0,
        categories: categories.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Formulations"
          count={stats.formulations}
          link="/formulations"
          color="purple"
        />
        <StatCard
          title="Ingredients"
          count={stats.ingredients}
          link="/ingredients"
          color="pink"
        />
        <StatCard
          title="Categories"
          count={stats.categories}
          link="/categories"
          color="indigo"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ActionButton to="/formulations" text="Create New Formulation" />
          <ActionButton to="/ingredients" text="Add Ingredient" />
          <ActionButton to="/categories" text="Manage Categories" />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  count,
  link,
  color,
}: {
  title: string;
  count: number;
  link: string;
  color: string;
}) {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
    pink: 'bg-pink-50 border-pink-200 text-pink-600',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-600',
  };

  return (
    <Link
      to={link}
      className={`${colorClasses[color as keyof typeof colorClasses]} border-2 rounded-lg p-6 hover:shadow-md transition-shadow`}
    >
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-4xl font-bold">{count}</p>
    </Link>
  );
}

function ActionButton({ to, text }: { to: string; text: string }) {
  return (
    <Link
      to={to}
      className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors"
    >
      {text}
    </Link>
  );
}
