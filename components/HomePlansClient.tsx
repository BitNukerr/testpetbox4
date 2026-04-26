"use client";

import { useEffect, useState } from "react";
import PlanCard from "@/components/PlanCard";
import type { Plan } from "@/data/products";
import { adminStore } from "@/lib/admin-store";

export default function HomePlansClient() {
  const [plans, setPlans] = useState<Plan[]>(() => adminStore.plans.get());

  useEffect(() => {
    const refresh = () => setPlans(adminStore.plans.get());
    refresh();
    window.addEventListener("petbox-admin-changed", refresh);
    return () => window.removeEventListener("petbox-admin-changed", refresh);
  }, []);

  return <div className="grid two">{plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}</div>;
}
