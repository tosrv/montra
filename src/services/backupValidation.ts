export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats?: {
    accountsCount: number;
    categoriesCount: number;
    transactionsCount: number;
  };
}

/**
 * Validates a parsed JSON backup object against strict integrity rules.
 */
export function validateBackupData(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['File does not contain a valid JSON object.'], warnings: [] };
  }

  const payload = data as Record<string, unknown>;

  if (payload.schemaVersion && typeof payload.schemaVersion !== 'number') {
    errors.push('Invalid schemaVersion format.');
  }

  if (!Array.isArray(payload.accounts)) {
    errors.push('Missing or invalid "accounts" array.');
  }

  if (!Array.isArray(payload.categories)) {
    errors.push('Missing or invalid "categories" array.');
  }

  if (!Array.isArray(payload.transactions)) {
    errors.push('Missing or invalid "transactions" array.');
  }

  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  const accounts = payload.accounts as any[];
  const categories = payload.categories as any[];
  const transactions = payload.transactions as any[];

  // Validate Accounts
  const accountIdSet = new Set<number>();
  for (let i = 0; i < accounts.length; i++) {
    const acc = accounts[i];
    if (!acc.name || typeof acc.name !== 'string') {
      errors.push(`Account at index ${i} is missing a valid name.`);
    }
    if (!acc.id && acc.id !== 0) {
      warnings.push(`Account "${acc.name || i}" has no ID and will receive a new one.`);
    } else {
      if (accountIdSet.has(acc.id)) {
        errors.push(`Duplicate account ID detected: ${acc.id}`);
      }
      accountIdSet.add(acc.id);
    }
  }

  // Validate Categories
  const categoryIdSet = new Set<number>();
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    if (!cat.name || typeof cat.name !== 'string') {
      errors.push(`Category at index ${i} is missing a valid name.`);
    }
    if (!['income', 'expense'].includes(cat.type)) {
      errors.push(`Category "${cat.name || i}" has invalid type "${cat.type}".`);
    }
    if (cat.id !== undefined) {
      if (categoryIdSet.has(cat.id)) {
        errors.push(`Duplicate category ID detected: ${cat.id}`);
      }
      categoryIdSet.add(cat.id);
    }
  }

  // Validate Transactions
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (!['income', 'expense', 'transfer'].includes(tx.type)) {
      errors.push(`Transaction at index ${i} has invalid type "${tx.type}".`);
    }
    if (typeof tx.amount !== 'number' || tx.amount <= 0 || isNaN(tx.amount)) {
      errors.push(`Transaction at index ${i} has invalid amount "${tx.amount}". Must be > 0.`);
    }
    if (typeof tx.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
      errors.push(`Transaction at index ${i} is missing a valid date (expected YYYY-MM-DD).`);
    }
    if (tx.accountId === undefined || !accountIdSet.has(tx.accountId)) {
      warnings.push(
        `Transaction at index ${i} references account ID ${tx.accountId} which is not in the accounts list.`
      );
    }
    if (tx.type === 'transfer') {
      if (!tx.destinationAccountId) {
        errors.push(`Transfer transaction at index ${i} is missing destinationAccountId.`);
      } else if (tx.destinationAccountId === tx.accountId) {
        errors.push(
          `Transfer transaction at index ${i} has identical source and destination account.`
        );
      } else if (!accountIdSet.has(tx.destinationAccountId)) {
        warnings.push(
          `Transfer transaction at index ${i} references destination account ID ${tx.destinationAccountId} which is not found.`
        );
      }
    } else if (tx.categoryId !== undefined && !categoryIdSet.has(tx.categoryId)) {
      warnings.push(
        `Transaction at index ${i} references category ID ${tx.categoryId} which is not found.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    stats: {
      accountsCount: accounts.length,
      categoriesCount: categories.length,
      transactionsCount: transactions.length,
    },
  };
}
