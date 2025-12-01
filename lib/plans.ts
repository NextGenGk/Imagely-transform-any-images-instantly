
export interface PlanFeature {
    key: string;
    value: string;
}

export interface Plan {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    features: Record<string, string>;
}

export const PLANS: Record<string, Plan> = {
    basic: {
        id: 'basic',
        name: 'Free',
        slug: 'basic',
        price: 0,
        currency: '₹',
        features: {
            monthly_requests: '10',
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        slug: 'pro',
        price: 199,
        currency: '₹',
        features: {
            monthly_requests: '500',
        },
    },
};

export function getPlanBySlug(slug: string): Plan | undefined {
    return PLANS[slug];
}
