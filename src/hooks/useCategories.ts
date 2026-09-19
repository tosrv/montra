import { useState, useEffect, useCallback } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/categoryService.ts';
import type { Category, CategoryType } from '../types.ts';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async (data: { name: string; type: CategoryType; icon?: string }) => {
    await createCategory(data);
    await fetchCategories();
  };

  const editCategory = async (
    id: number,
    data: { name: string; type: CategoryType; icon?: string }
  ) => {
    await updateCategory(id, data);
    await fetchCategories();
  };

  const removeCategory = async (id: number, force?: boolean) => {
    const res = await deleteCategory(id, force);
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete category');
    }
    await fetchCategories();
  };

  return {
    categories,
    incomeCategories: categories.filter((c) => c.type === 'income'),
    expenseCategories: categories.filter((c) => c.type === 'expense'),
    loading,
    refreshCategories: fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
  };
}
