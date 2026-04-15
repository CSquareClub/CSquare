export type StallCategory = "products_games" | "food_beverage";

export const STALL_PREMIUM_PRICE_PER_DAY = 2000;

export function getStallBasePrice(category: StallCategory, isCuStudent: boolean): number {
  if (category === "products_games") {
    return isCuStudent ? 2500 : 3000;
  }

  return isCuStudent ? 3500 : 4000;
}

export function getStallCategoryLabel(category: StallCategory): string {
  return category === "food_beverage" ? "Food & Beverage" : "Products or Games";
}

export function getStallTotalPrice(params: {
  category: StallCategory;
  isCuStudent: boolean;
  isPremium: boolean;
  numberOfDays: number;
}): number {
  const basePrice = getStallBasePrice(params.category, params.isCuStudent);
  const premiumPrice = params.isPremium ? STALL_PREMIUM_PRICE_PER_DAY : 0;

  return (basePrice + premiumPrice) * params.numberOfDays;
}
