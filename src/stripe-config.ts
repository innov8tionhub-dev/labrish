export interface StripeProduct {
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
}

export const stripeProducts: StripeProduct[] = [
  {
    priceId: 'price_1RczlFBXth0JnBQhx6IQppen',
    name: 'Labrish Pro Monthly',
    description: 'Labrish Subscription - Monthly',
    mode: 'subscription'
  },
  {
    priceId: 'price_annual_placeholder',
    name: 'Labrish Pro Annual',
    description: 'Labrish Subscription - Annual',
    mode: 'subscription'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};