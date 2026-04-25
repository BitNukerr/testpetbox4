"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase, supabaseConfigError } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

type UserState = { email?: string } | null;

export default function AuthClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<UserState>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setCheckingSession(false);
      return;
    }

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ? { email: data.user.email || "" } : null);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email || "" } : null);
      setCheckingSession(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function submit(mode: "signin" | "signup") {
    if (!isSupabaseConfigured() || !supabase) {
      setMessage(`${supabaseConfigError} Actualize as variáveis de ambiente da Supabase no Vercel e volte a publicar o site.`);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (result.error) setMessage(result.error.message);
      else setMessage(mode === "signup" ? "Conta criada. Verifique o email, caso a Supabase peça confirmação." : "Sessão iniciada.");
    } catch {
      setMessage("Não foi possível contactar a Supabase. Confirme que NEXT_PUBLIC_SUPABASE_URL usa o URL completo do projecto, por exemplo https://your-project-ref.supabase.co.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    if (!supabase) return;

    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div className="card auth-card">
      <div className="card-body">
        <h2>{pt.account.authTitle}</h2>
        <p className="muted">{pt.account.authIntro}</p>
        {checkingSession ? (
          <div className="detail-box"><p className="muted">{pt.common.loading}</p></div>
        ) : user ? (
          <div className="detail-box">
            <p><strong>{pt.account.signedInAs}:</strong> {user.email}</p>
            <button className="btn btn-secondary" onClick={signOut}>{pt.account.signOut}</button>
          </div>
        ) : (
          <div className="form-grid">
            <input type="email" placeholder={pt.account.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder={pt.account.password} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn" disabled={loading} onClick={() => submit("signin")}>{loading ? pt.common.loading : pt.account.signIn}</button>
            <button className="btn btn-secondary" disabled={loading} onClick={() => submit("signup")}>{pt.account.signUp}</button>
          </div>
        )}
        {message ? <p className="muted top-gap">{message}</p> : null}
      </div>
    </div>
  );
}
