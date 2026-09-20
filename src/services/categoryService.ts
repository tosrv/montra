import { db } from '../db/database.ts';
import type { Category, CategoryType } from '../types.ts';

export async function getAllCategories(): Promise<Category[]> {
  return await db.categories.toArray();
}

export async function getCategoriesByType(type: CategoryType): Promise<Category[]> {
  return await db.categories.where('type').equals(type).toArray();
}

export async function createCategory(data: {
  name: string;
  type: CategoryType;
  icon?: string;
}): Promise<number> {
  const now = new Date().toISOString();
  const id = await db.categories.add({
    name: data.name.trim(),
    type: data.type,
    icon: data.icon || (data.type === 'income' ? 'Wallet' : 'CircleDot'),
    createdAt: now,
  });

  return id;
}

export async function updateCategory(
  id: number,
  data: { name: string; type: CategoryType; icon?: string }
): Promise<void> {
  await db.categories.update(id, {
    name: data.name.trim(),
    type: data.type,
    icon: data.icon || (data.type === 'income' ? 'Wallet' : 'CircleDot'),
  });
}

export async function countCategoryTransactions(categoryId: number): Promise<number> {
  return await db.transactions.where('categoryId').equals(categoryId).count();
}

export async function deleteCategory(
  categoryId: number,
  force: boolean = false
): Promise<{ success: boolean; error?: string }> {
  const txCount = await countCategoryTransactions(categoryId);
  if (txCount > 0 && !force) {
    return {
      success: false,
      error: `Cannot delete this category because it is used by ${txCount} transaction(s). Reassign them first or select a fallback category.`,
    };
  }

  if (force) {
    // Reassign transactions to an 'Other' category or remove categoryId
    const otherCategory = await db.categories
      .filter((c) => c.name.toLowerCase() === 'other' && c.id !== categoryId)
      .first();
    const fallbackId = otherCategory?.id;

    const txs = await db.transactions.where('categoryId').equals(categoryId).toArray();
    for (const tx of txs) {
      if (tx.id) {
        await db.transactions.update(tx.id, { categoryId: fallbackId });
      }
    }
  }

  await db.categories.delete(categoryId);
  await db.budgetCategories.where('categoryId').equals(categoryId).delete();
  return { success: true };
}
