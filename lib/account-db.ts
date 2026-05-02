"use client";

import type { AccountAddress, AccountPet, AccountSubscription, SavedOrder } from "@/lib/client-store";
import { supabase } from "@/lib/supabase-client";

type ProfileRow = {
  user_id: string;
  email: string | null;
  full_name: string | null;
};

type PetRow = {
  id: string;
  name: string;
  species: AccountPet["species"];
  size: AccountPet["size"];
  birthday: string | null;
  allergies: string | null;
  preferences: string | null;
};

type AddressRow = {
  name: string | null;
  phone: string | null;
  mbway_phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  nif: string | null;
};

type SubscriptionRow = {
  id: string;
  status: AccountSubscription["status"];
  plan_id: string | null;
  cadence: AccountSubscription["cadence"];
  pet_id: string | null;
  next_box_date: string | null;
  renewal_date: string | null;
  price: number | string | null;
  extras: string | null;
};

type OrderRow = {
  id: string;
  title: string;
  total: number | string;
  status: string;
  payment_method: string | null;
  easypay_checkout_id: string | null;
  easypay_payment_id: string | null;
  created_at: string;
};

export type RemoteAccountData = {
  profile: ProfileRow | null;
  pets: AccountPet[];
  address: AccountAddress | null;
  subscription: AccountSubscription | null;
  orders: SavedOrder[];
};

function requireSupabase() {
  if (!supabase) throw new Error("Supabase is not configured.");
  return supabase;
}

function petFromRow(row: PetRow): AccountPet {
  return {
    id: row.id,
    name: row.name || "",
    species: row.species,
    size: row.size,
    birthday: row.birthday || "",
    allergies: row.allergies || "",
    preferences: row.preferences || ""
  };
}

function addressFromRow(row: AddressRow): AccountAddress {
  return {
    name: row.name || "",
    phone: row.phone || "",
    mbwayPhone: row.mbway_phone || "",
    address: row.address || "",
    city: row.city || "",
    zip: row.zip || "",
    nif: row.nif || ""
  };
}

function subscriptionFromRow(row: SubscriptionRow): AccountSubscription {
  return {
    id: row.id,
    status: row.status,
    plan: row.plan_id || "",
    cadence: row.cadence,
    petId: row.pet_id || "",
    nextBoxDate: row.next_box_date || "",
    renewalDate: row.renewal_date || "",
    price: Number(row.price || 0),
    extras: row.extras || ""
  };
}

function orderFromRow(row: OrderRow): SavedOrder {
  return {
    id: row.id,
    title: row.title,
    total: Number(row.total || 0),
    date: new Date(row.created_at).toLocaleDateString("pt-PT"),
    status: row.status,
    paymentMethod: row.payment_method || undefined,
    easypayCheckoutId: row.easypay_checkout_id || undefined,
    easypayPaymentId: row.easypay_payment_id || undefined
  };
}

export async function loadRemoteAccount(userId: string): Promise<RemoteAccountData> {
  const client = requireSupabase();
  const [profileResult, petsResult, addressResult, subscriptionResult, ordersResult] = await Promise.all([
    client.from("profiles").select("user_id,email,full_name").eq("user_id", userId).maybeSingle(),
    client.from("pets").select("id,name,species,size,birthday,allergies,preferences").eq("user_id", userId).order("created_at", { ascending: true }),
    client.from("account_addresses").select("name,phone,mbway_phone,address,city,zip,nif").eq("user_id", userId).maybeSingle(),
    client.from("customer_subscriptions").select("id,status,plan_id,cadence,pet_id,next_box_date,renewal_date,price,extras").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    client.from("orders").select("id,title,total,status,payment_method,easypay_checkout_id,easypay_payment_id,created_at").eq("user_id", userId).order("created_at", { ascending: false })
  ]);

  const firstError = profileResult.error || petsResult.error || addressResult.error || subscriptionResult.error || ordersResult.error;
  if (firstError) throw firstError;

  return {
    profile: profileResult.data || null,
    pets: (petsResult.data || []).map((pet) => petFromRow(pet as PetRow)),
    address: addressResult.data ? addressFromRow(addressResult.data as AddressRow) : null,
    subscription: subscriptionResult.data ? subscriptionFromRow(subscriptionResult.data as SubscriptionRow) : null,
    orders: (ordersResult.data || []).map((order) => orderFromRow(order as OrderRow))
  };
}

export async function saveRemoteProfile(userId: string, email: string, fullName: string) {
  const client = requireSupabase();
  const { error } = await client.from("profiles").upsert({ user_id: userId, email, full_name: fullName }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function saveRemotePet(userId: string, pet: AccountPet) {
  const client = requireSupabase();
  const payload = {
    user_id: userId,
    name: pet.name,
    species: pet.species,
    size: pet.size,
    birthday: pet.birthday || null,
    allergies: pet.allergies || null,
    preferences: pet.preferences || null
  };
  const query = pet.id && !pet.id.startsWith("pet-")
    ? client.from("pets").update(payload).eq("id", pet.id).select("id,name,species,size,birthday,allergies,preferences").single()
    : client.from("pets").insert(payload).select("id,name,species,size,birthday,allergies,preferences").single();
  const { data, error } = await query;
  if (error) throw error;
  return petFromRow(data as PetRow);
}

export async function deleteRemotePet(id: string) {
  const client = requireSupabase();
  const { error } = await client.from("pets").delete().eq("id", id);
  if (error) throw error;
}

export async function saveRemoteAddress(userId: string, address: AccountAddress) {
  const client = requireSupabase();
  const { error } = await client.from("account_addresses").upsert({
    user_id: userId,
    name: address.name,
    phone: address.phone,
    mbway_phone: address.mbwayPhone,
    address: address.address,
    city: address.city,
    zip: address.zip,
    nif: address.nif
  }, { onConflict: "user_id" });
  if (error) throw error;
}
