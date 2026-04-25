"use client";

import { Plan } from "@/data/products";
import { money } from "@/lib/helpers";
import { addToCart } from "@/lib/client-store";
import { pt } from "@/lib/translations";

export default function PlanCard({ plan }: { plan: Plan }) {
  return (
    <div className="card plan-card">
      <div className="card-body">
        <span className="tag">{plan.cadence === "monthly" ? "Mais flexível" : "Melhor valor"}</span>
        <h3>{plan.name}</h3>
        <p>{plan.description}</p>
        <p className="price">{money(plan.price)} <small>/{plan.cadence === "monthly" ? pt.configure.monthly : pt.configure.quarterly}</small></p>
        <ul className="perks">
          {plan.perks.map((perk) => <li key={perk}>{perk}</li>)}
        </ul>
        <button
          className="btn"
          onClick={() => addToCart({
            id: `${plan.id}-${Date.now()}`,
            slug: plan.id,
            title: plan.name,
            price: plan.price,
            quantity: 1,
            type: "plan",
            cadence: plan.cadence,
            category: pt.cart.subscription
          })}
        >
          Adicionar subscrição
        </button>
      </div>
    </div>
  );
}
