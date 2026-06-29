import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for indie developers and small projects.",
    features: ["1 Project", "5 Analyses per month", "Basic Recommendations", "Community Support"],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "For professional teams needing deep insights.",
    features: ["10 Projects", "Unlimited Analyses", "Advanced AI Fixes", "Priority Support", "Historical Trends"],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Dedicated resources and advanced security.",
    features: ["Unlimited Projects", "Custom SLAs", "Dedicated Account Manager", "On-Premise Deployment"],
    cta: "Contact Sales",
    popular: false,
  }
];

export default function PricingPage() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-[#7C3AED]">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Scale your backend performance
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-[#A1A1AA]">
          Choose the plan that best fits your infrastructure needs. No hidden fees.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
          {plans.map((plan, planIdx) => (
            <div
              key={plan.name}
              className={`rounded-3xl p-8 ring-1 \${
                plan.popular ? 'bg-white/5 ring-[#7C3AED] relative' : 'ring-[#222222]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] px-3 py-1 text-center text-sm font-semibold text-white shadow-sm">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-semibold leading-8 text-white">{plan.name}</h3>
              <p className="mt-4 text-sm leading-6 text-[#A1A1AA]">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
                {plan.period && <span className="text-sm font-semibold leading-6 text-[#A1A1AA]">{plan.period}</span>}
              </p>
              <Link
                href="/dashboard"
                className={`mt-6 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors \${
                  plan.popular
                    ? 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] focus-visible:outline-[#7C3AED]'
                    : 'bg-[#222222] text-white hover:bg-[#333333] focus-visible:outline-white'
                }`}
              >
                {plan.cta}
              </Link>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-[#A1A1AA]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckCircle2 className="h-6 w-5 flex-none text-[#7C3AED]" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
