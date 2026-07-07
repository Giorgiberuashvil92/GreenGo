export type PromoDiscountType =
  | "percentage"
  | "free_delivery"
  | "fixed_total";

export type PromoDiscountInfo = {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderAmount?: number;
};

export type PromoPricingContext = {
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
};

export type PromoCalculationResult = {
  productDiscount: number;
  orderDiscount: number;
  deliveryDiscount: number;
  totalSavings: number;
  effectiveDeliveryFee: number;
  freeDelivery: boolean;
};

export type ValidatedPromoCode = PromoDiscountInfo & {
  valid: true;
  discountAmount: number;
  freeDelivery?: boolean;
  description?: string;
};

function normalizePromoType(
  discountType: string,
): PromoDiscountType {
  if (discountType === "fixed") {
    return "fixed_total";
  }
  return discountType as PromoDiscountType;
}

export function calculatePromoSavings(
  promo: PromoDiscountInfo,
  context: PromoPricingContext,
): PromoCalculationResult {
  const { subtotal, deliveryFee, serviceFee } = context;
  const discountType = normalizePromoType(promo.discountType);
  const minOrderAmount = promo.minOrderAmount ?? 0;

  if (subtotal <= 0 || subtotal < minOrderAmount) {
    return {
      productDiscount: 0,
      orderDiscount: 0,
      deliveryDiscount: 0,
      totalSavings: 0,
      effectiveDeliveryFee: deliveryFee,
      freeDelivery: false,
    };
  }

  if (discountType === "free_delivery") {
    const deliveryDiscount = Math.round(deliveryFee * 100) / 100;
    return {
      productDiscount: 0,
      orderDiscount: 0,
      deliveryDiscount,
      totalSavings: deliveryDiscount,
      effectiveDeliveryFee: 0,
      freeDelivery: true,
    };
  }

  if (discountType === "percentage") {
    let productDiscount = subtotal * (promo.discountValue / 100);
    if (promo.maxDiscount != null) {
      productDiscount = Math.min(productDiscount, promo.maxDiscount);
    }
    productDiscount = Math.round(Math.min(productDiscount, subtotal) * 100) / 100;

    return {
      productDiscount,
      orderDiscount: 0,
      deliveryDiscount: 0,
      totalSavings: productDiscount,
      effectiveDeliveryFee: deliveryFee,
      freeDelivery: false,
    };
  }

  const orderBase = subtotal + deliveryFee + serviceFee;
  const orderDiscount =
    Math.round(Math.min(promo.discountValue, orderBase) * 100) / 100;

  return {
    productDiscount: 0,
    orderDiscount,
    deliveryDiscount: 0,
    totalSavings: orderDiscount,
    effectiveDeliveryFee: deliveryFee,
    freeDelivery: false,
  };
}

export function calculateCheckoutTotal(
  context: PromoPricingContext,
  promo: PromoDiscountInfo | null,
  tipAmount: number,
): number {
  const savings = promo
    ? calculatePromoSavings(promo, context)
    : {
        productDiscount: 0,
        orderDiscount: 0,
        deliveryDiscount: 0,
        totalSavings: 0,
        effectiveDeliveryFee: context.deliveryFee,
        freeDelivery: false,
      };

  return Math.max(
    0,
    context.subtotal -
      savings.productDiscount +
      savings.effectiveDeliveryFee +
      context.serviceFee -
      savings.orderDiscount +
      tipAmount,
  );
}

export function formatPromoDiscountLabel(promo: PromoDiscountInfo): string {
  const discountType = normalizePromoType(promo.discountType);

  if (discountType === "free_delivery") {
    return "უფასო მიტანა";
  }

  if (discountType === "percentage") {
    return `-${promo.discountValue}%`;
  }

  return `-${promo.discountValue.toFixed(2).replace(".", ",")} ₾`;
}
