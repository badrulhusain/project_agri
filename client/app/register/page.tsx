"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Role = "farmer" | "buyer" | "agency";

const roles: { id: Role; title: string; description: string }[] = [
  { id: "farmer", title: "I grow food", description: "Share your harvest and reach more buyers." },
  { id: "buyer", title: "I buy produce", description: "Find fresh supply for your business." },
  { id: "agency", title: "I support farmers", description: "Help local growers access new markets." },
];

function ChooseRole() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");
  const initialRole = roles.find((item) => item.id === requestedRole)?.id ?? null;
  const [role, setRole] = useState<Role | null>(initialRole);

  return (
    <main className="auth-page register-page">
      <div className="auth-side">
        <Link className="auth-brand" href="/"><Image className="auth-logo" src="/images/vithu-logo.png" alt="" width={42} height={42} />vithu</Link>
        <div>
          <p className="eyebrow eyebrow-light">Grow together</p>
          <h1>Good harvests begin with good connections.</h1>
          <p>One simple place for farmers, buyers, and the people helping them move forward.</p>
        </div>
        <span>From farm to market, together.</span>
      </div>
      <div className="auth-main">
        <div className="auth-top">
          <Link href="/">← Back to home</Link>
          <span>Already a member? <Link href="/login">Log in</Link></span>
        </div>
        <div className="auth-content">
          <div className="auth-progress" aria-label="Step 1 of 2"><span className="auth-progress-active" /><span /></div>
          <p className="eyebrow">Step 1 of 2 · Create your account</p>
          <h2>How will you use vithu?</h2>
          <p>Choose the option that fits you best.</p>
          <div className="role-options" role="group" aria-label="Account type">
            {roles.map((item) => (
              <button
                type="button"
                className={`role-option ${role === item.id ? "role-option-selected" : ""}`}
                onClick={() => setRole(item.id)}
                key={item.id}
                aria-pressed={role === item.id}
              >
                <span className="role-radio" aria-hidden="true" />
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>
          {role ? (
            <Link className="button button-green auth-submit" href={`/register/details?role=${role}`}>
              Continue <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <button className="button button-green auth-submit" type="button" disabled>
              Choose an option to continue
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return <Suspense fallback={<main className="auth-page" aria-busy="true" />}><ChooseRole /></Suspense>;
}
