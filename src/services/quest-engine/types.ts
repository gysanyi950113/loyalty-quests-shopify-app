import { QuestConditionType, QuestRewardType, QuestProgressStatus } from '@prisma/client';

// ============================================================================
// QUEST CONDITION CONFIGS
// ============================================================================

export interface OrderCountConditionConfig {
  targetOrderCount: number;
  timeWindowDays?: number; // Optional: orders within last X days
}

export interface TotalSpendConditionConfig {
  targetAmount: number;
  currency: string;
  timeWindowDays?: number;
}

export interface ProductCategoryConditionConfig {
  categoryId: string;
  categoryName?: string;
  minimumQuantity?: number;
}

export interface ProductSpecificConditionConfig {
  productIds: string[];
  minimumQuantity?: number;
}

export interface TimeWindowConditionConfig {
  startDate: Date;
  endDate: Date;
}

export type QuestConditionConfig =
  | OrderCountConditionConfig
  | TotalSpendConditionConfig
  | ProductCategoryConditionConfig
  | ProductSpecificConditionConfig
  | TimeWindowConditionConfig;

// ============================================================================
// QUEST REWARD CONFIGS
// ============================================================================

export interface DiscountPercentageRewardConfig {
  percentage: number; // e.g., 10 for 10% off
  maximumAmount?: number; // Optional cap
  minimumOrderValue?: number;
  expiryDays?: number; // Days until discount expires
}

export interface DiscountFixedRewardConfig {
  amount: number;
  currency: string;
  minimumOrderValue?: number;
  expiryDays?: number;
}

export interface FreeShippingRewardConfig {
  minimumOrderValue?: number;
  expiryDays?: number;
}

export interface CustomRewardConfig {
  title: string;
  description: string;
  code?: string;
  metadata?: Record<string, any>;
}

export type QuestRewardConfig =
  | DiscountPercentageRewardConfig
  | DiscountFixedRewardConfig
  | FreeShippingRewardConfig
  | CustomRewardConfig;

// ============================================================================
// QUEST PROGRESS
// ============================================================================

export interface QuestProgress {
  questId: string;
  customerId: string;
  status: QuestProgressStatus;
  currentValue: number;
  targetValue: number;
  completedAt?: Date;
  rewardId?: string;
}

// ============================================================================
// SHOPIFY ORDER DATA (simplified)
// ============================================================================

export interface ShopifyOrder {
  id: string;
  order_number: number;
  created_at: string;
  total_price: string;
  currency: string;
  customer?: {
    id: string;
    email: string;
  };
  line_items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    title: string;
    quantity: number;
    price: string;
  }>;
  financial_status: string; // paid, pending, refunded, etc.
}

// ============================================================================
// CONDITION EVALUATOR INTERFACE
// ============================================================================

export interface IConditionEvaluator {
  /**
   * Evaluate if an order contributes to quest progress
   * Returns the value to add to currentValue
   */
  evaluate(
    order: ShopifyOrder,
    condition: QuestConditionConfig,
    currentProgress: QuestProgress
  ): Promise<number>;

  /**
   * Check if quest is completed based on current progress
   */
  isCompleted(currentValue: number, targetValue: number): boolean;
}

// ============================================================================
// QUEST SERVICE INTERFACES
// ============================================================================

export interface CreateQuestInput {
  shopId: string;
  name: string;
  description?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  conditions: Array<{
    type: QuestConditionType;
    config: QuestConditionConfig;
  }>;
  rewards: Array<{
    type: QuestRewardType;
    config: QuestRewardConfig;
  }>;
}

export interface UpdateQuestInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export interface QuestWithRelations {
  id: string;
  shopId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  startDate: Date | null;
  endDate: Date | null;
  conditions: Array<{
    id: string;
    type: QuestConditionType;
    config: any;
  }>;
  rewards: Array<{
    id: string;
    type: QuestRewardType;
    config: any;
  }>;
}
