import React, { useState } from 'react';
import {
  Plus,
  Tags,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Check,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { useCategories } from '../../hooks/useCategories.ts';
import { countCategoryTransactions } from '../../services/categoryService.ts';
import { CategoryIcon, AVAILABLE_ICONS } from '../../components/ui/CategoryIcon.tsx';
import type { Category, CategoryType } from '../../types.ts';

export function CategoriesPage() {
  const {
    categories,
    incomeCategories,
    expenseCategories,
    loading,
    addCategory,
    editCategory,
    removeCategory,
  } = useCategories();

  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>('expense');
  const [icon, setIcon] = useState('CircleDot');
  const [error, setError] = useState<string | null>(null);

  // Deletion modal
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteRefTxCount, setDeleteRefTxCount] = useState<number>(0);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const openCreateModal = (presetType?: CategoryType) => {
    setEditingCategory(null);
    setName('');
    setType(presetType || activeTab);
    setIcon(presetType === 'income' || activeTab === 'income' ? 'Wallet' : 'CircleDot');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setIcon(cat.icon || 'CircleDot');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      if (editingCategory?.id) {
        await editCategory(editingCategory.id, {
          name: name.trim(),
          type,
          icon,
        });
      } else {
        await addCategory({
          name: name.trim(),
          type,
          icon,
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save category.');
    }
  };

  const checkAndDelete = async (cat: Category) => {
    const count = await countCategoryTransactions(cat.id!);
    setCategoryToDelete(cat);
    setDeleteRefTxCount(count);
    setDeleteError(null);
  };

  const confirmDelete = async (force: boolean = false) => {
    if (!categoryToDelete?.id) return;
    try {
      await removeCategory(categoryToDelete.id, force);
      setCategoryToDelete(null);
      setDeleteError(null);
    } catch (err: any) {
      setDeleteError(err?.message || 'Failed to delete category.');
    }
  };

  const displayedCategories = activeTab === 'expense' ? expenseCategories : incomeCategories;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Categories</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Organize transactions into custom income and expense categories
          </p>
        </div>

        <button
          id="categories-add-btn"
          type="button"
          onClick={() => openCreateModal()}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-2xs active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Category</span>
        </button>
      </div>

      {/* Segmented Tabs (Expense vs Income) */}
      <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'expense'
              ? 'bg-white text-rose-700 shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
          <span>Expense Categories ({expenseCategories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-2 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'income'
              ? 'bg-white text-emerald-700 shadow-2xs'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
          <span>Income Categories ({incomeCategories.length})</span>
        </button>
      </div>

      {/* Category List Grid */}
      {displayedCategories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-neutral-200/80 text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Tags className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700">No {activeTab} categories yet.</p>
            <p className="text-xs text-neutral-400 mt-0.5">
              Create categories to organize your {activeTab} transactions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openCreateModal(activeTab)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create {activeTab} category</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3 hover:shadow-xs transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    cat.type === 'income'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <CategoryIcon name={cat.icon} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-neutral-900 truncate">{cat.name}</h3>
                  <span className="text-[10px] text-neutral-400 capitalize">{cat.type}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                  title="Edit Category"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => checkAndDelete(cat)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
              <h2 className="text-base font-bold text-neutral-900">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Groceries, Investment, Books"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                  Category Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      type === 'expense'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all ${
                      type === 'income'
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Select Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition-colors ${
                        icon === iconName
                          ? 'bg-neutral-900 text-white shadow-2xs'
                          : 'text-neutral-600 hover:bg-neutral-200/70'
                      }`}
                      title={iconName}
                    >
                      <CategoryIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-neutral-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">
                Delete Category "{categoryToDelete.name}"?
              </h3>
            </div>

            {deleteRefTxCount > 0 ? (
              <div className="space-y-2 text-xs text-neutral-600">
                <p className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl">
                  <strong>Referenced by {deleteRefTxCount} transaction(s):</strong> Deleting will
                  reassign existing transactions to "Other" or leave them uncategorized so no
                  records are destroyed.
                </p>
              </div>
            ) : (
              <p className="text-xs text-neutral-600">
                This category is not used by any transactions and can be safely deleted.
              </p>
            )}

            {deleteError && (
              <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {deleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDelete(deleteRefTxCount > 0)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-2xs"
              >
                {deleteRefTxCount > 0 ? 'Reassign & Delete' : 'Delete Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
