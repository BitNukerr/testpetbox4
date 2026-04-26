"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured, supabase } from "@/lib/supabase-client";
import { pt } from "@/lib/translations";

type AuthMode = "signin" | "signup";

function authErrorMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login")) return "Email ou palavra-passe incorrectos.";
  if (lower.includes("email not confirmed")) return "Confirme o email antes de iniciar sessão.";
  if (lower.includes("password")) return "A palavra-passe deve ter pelo menos 6 caracteres.";
  if (lower.includes("already registered") || lower.includes("already been registered")) return "Já existe uma conta com este email.";
  if (lower.includes("rate limit")) return "Foram feitas demasiadas tentativas. Aguarde um momento e tente novamente.";
  return message || "Não foi possível concluir o pedido.";
}

export default function AuthClient() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordReady = password.length >= 6;
  const canSubmit = useMemo(() => {
    if (!email.trim() || !passwordReady) return false;
    if (mode === "signup" && password !== confirmPassword) return false;
    return true;
  }, [confirmPassword, email, mode, password, passwordReady]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUserEmail(data.session?.user.email || ""));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user.email || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function setNotice(text: string, type: "success" | "error" | "info" = "info") {
    setMessage(text);
    setMessageType(type);
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setConfirmPassword("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isSupabaseConfigured() || !supabase) {
      setNotice("Supabase ainda não está configurado no Vercel.", "error");
      return;
    }

    if (!canSubmit) {
      setNotice(mode === "signup" && password !== confirmPassword ? "As palavras-passe não coincidem." : "Preencha email e uma palavra-passe com pelo menos 6 caracteres.", "error");
      return;
    }

    setLoading(true);
    setMessage("");

    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: name.trim() }
        }
      });

    setLoading(false);

    if (result.error) {
      setNotice(authErrorMessage(result.error.message), "error");
      return;
    }

    if (mode === "signin" || result.data.session) {
      setNotice("Sessão iniciada.", "success");
      router.replace("/account");
      return;
    }

    setNotice("Conta criada. Confirme o email se a confirmação estiver activa no Supabase.", "success");
  }

  async function resetPassword() {
    if (!isSupabaseConfigured() || !supabase) {
      setNotice("Supabase ainda não está configurado no Vercel.", "error");
      return;
    }
    if (!email.trim()) {
      setNotice("Escreva o seu email para receber a ligação de recuperação.", "error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`
    });
    setLoading(false);

    if (error) {
      setNotice(authErrorMessage(error.message), "error");
      return;
    }
    setNotice("Enviámos uma ligação de recuperação para o seu email.", "success");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setNotice("Sessão terminada.", "success");
    router.replace("/login");
  }

  if (userEmail) {
    return (
      <div className="card auth-card">
        <div className="card-body auth-signed-in">
          <span className="tag">Conta activa</span>
          <h2>{pt.account.authTitle}</h2>
          <p className="muted">{pt.account.signedInAs} <strong>{userEmail}</strong></p>
          <div className="action-row wrap">
            <button className="btn btn-secondary" onClick={signOut}>{pt.account.signOut}</button>
          </div>
          {message ? <p className={`account-note ${messageType === "error" ? "error-text" : "success-text"}`}>{message}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="card auth-card">
      <div className="card-body">
        <div className="auth-tabs" role="tablist" aria-label="Entrar ou criar conta">
          <button className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")} type="button">Entrar</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} type="button">Criar conta</button>
        </div>

        <h2>{mode === "signin" ? "Entrar na PetBox" : "Criar conta PetBox"}</h2>
        <p className="muted">{mode === "signin" ? "Aceda à sua conta para consultar encomendas e subscrições." : "Crie a sua conta para guardar compras, subscrições e dados de contacto."}</p>

        <form className="auth-form" onSubmit={submit}>
          {mode === "signup" ? (
            <label>
              <span>Nome</span>
              <input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="O seu nome" />
            </label>
          ) : null}
          <label>
            <span>Email</span>
            <input autoComplete="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={pt.account.email} />
          </label>
          <label>
            <span>Palavra-passe</span>
            <div className="password-field">
              <input autoComplete={mode === "signin" ? "current-password" : "new-password"} type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={pt.account.password} />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? "Ocultar" : "Mostrar"}</button>
            </div>
          </label>
          {mode === "signup" ? (
            <label>
              <span>Confirmar palavra-passe</span>
              <input autoComplete="new-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repita a palavra-passe" />
            </label>
          ) : null}

          {mode === "signup" ? <p className="muted auth-hint">Use pelo menos 6 caracteres. Se o Supabase pedir confirmação, receberá um email.</p> : null}

          <button className="btn full" disabled={loading || !canSubmit} type="submit">
            {loading ? pt.common.loading : mode === "signin" ? pt.account.signIn : pt.account.signUp}
          </button>
          {mode === "signin" ? <button className="link-btn auth-reset" type="button" disabled={loading} onClick={resetPassword}>Esqueci-me da palavra-passe</button> : null}
        </form>

        {message ? <p className={`account-note ${messageType === "error" ? "error-text" : messageType === "success" ? "success-text" : "muted"}`}>{message}</p> : null}
      </div>
    </div>
  );
}
