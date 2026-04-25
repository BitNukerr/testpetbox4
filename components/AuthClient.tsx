"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

export default function AuthClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email || ""));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(mode: "signin" | "signup") {
    if (!isSupabaseConfigured() || !supabase) {
      setMessage("Supabase ainda não está configurado no Vercel.");
      return;
    }

    setLoading(true);
    setMessage("");
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }
    setMessage(mode === "signin" ? "Sessão iniciada." : "Conta criada. Verifique o email se for necessário confirmar.");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessage("Sessão terminada.");
  }

  return (
    <div className="card auth-card">
      <div className="card-body">
        <h2>{pt.account.authTitle}</h2>
        <p className="muted">{pt.account.authIntro}</p>
        {userEmail ? (
          <div className="action-row wrap">
            <p className="muted">{pt.account.signedInAs} <strong>{userEmail}</strong></p>
            <button className="btn btn-secondary" onClick={signOut}>{pt.account.signOut}</button>
          </div>
        ) : (
          <div className="form-grid">
            <input placeholder={pt.account.email} value={email} onChange={(event) => setEmail(event.target.value)} />
            <input placeholder={pt.account.password} type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <button className="btn" disabled={loading} onClick={() => submit("signin")}>{pt.account.signIn}</button>
            <button className="btn btn-secondary" disabled={loading} onClick={() => submit("signup")}>{pt.account.signUp}</button>
          </div>
        )}
        {message ? <p className="muted account-note">{message}</p> : null}
      </div>
    </div>
  );
}
