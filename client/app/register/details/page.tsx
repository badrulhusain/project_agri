"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type Role = "farmer" | "buyer" | "agency";

type RegistrationFields = {
  name: string;
  phone: string;
  email?: string;
  password: string;
};

const roleNames: Record<Role, string> = {
  farmer: "Farmer",
  buyer: "Buyer",
  agency: "Agency",
};

function RegistrationDetails() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams.get("role");
  const role: Role | null =
    requestedRole === "farmer" || requestedRole === "buyer" || requestedRole === "agency"
      ? requestedRole
      : null;
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState<RegistrationFields>({ name: "", phone: "", password: "" });

  if (!role) {
    return (
      <main className="auth-page auth-page-centered register-page">
        <div className="auth-content">
          <p className="eyebrow">Create your account</p>
          <h1>Choose how you will use vithu.</h1>
          <p>Select an account type before entering your details.</p>
          <Link className="button button-green" href="/register">Choose account type <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page register-page">
      <div className="auth-side">
        <Link className="auth-brand" href="/"><Image className="auth-logo" src="/images/vithu-logo.png" alt="" width={42} height={42} />vithu</Link>
        <div>
          <p className="eyebrow eyebrow-light">Almost there</p>
          <h1>A new connection starts here.</h1>
          <p>Add your details so you can join the vithu community.</p>
        </div>
        <span>From farm to market, together.</span>
      </div>
      <div className="auth-main">
        <div className="auth-top">
          <Link href={`/register?role=${role}`}>← Change account type</Link>
          <span>Already a member? <Link href="/login">Log in</Link></span>
        </div>
        <div className="auth-content">
          <div className="auth-progress" aria-label="Step 2 of 2"><span className="auth-progress-active" /><span className="auth-progress-active" /></div>
          <p className="eyebrow">Step 2 of 2 · {roleNames[role]} account</p>
          <h2>Tell us about yourself.</h2>
          <p>Enter your details to get started.</p>
          <form
            className="auth-form"
            onSubmit={(event) => {
              event.preventDefault();
              setMessage("Account registration is not connected to the backend yet. No details were submitted.");
            }}
          >
            <label>Full name<input name="name" type="text" autoComplete="name" required value={fields.name} onChange={(event) => setFields({ ...fields, name: event.target.value })} placeholder="Your name" /></label>
            <label>Phone number<input name="phone" type="tel" autoComplete="tel" required value={fields.phone} onChange={(event) => setFields({ ...fields, phone: event.target.value })} pattern={"\\+?[1-9]\\d{7,14}"} title="Enter 8 to 15 digits, optionally starting with +" placeholder="Your phone number" /></label>
            {role !== "farmer" && (
              <label>
                {role === "buyer" ? "Business name" : "Agency name"}
                <input name="organization" type="text" required placeholder={role === "buyer" ? "Your business" : "Your agency"} />
              </label>
            )}
            <label>Email address (optional)<input name="email" type="email" autoComplete="email" value={fields.email ?? ""} onChange={(event) => setFields({ ...fields, email: event.target.value || undefined })} placeholder="you@example.com" /></label>
            <label>Password<input name="password" type="password" autoComplete="new-password" minLength={8} required value={fields.password} onChange={(event) => setFields({ ...fields, password: event.target.value })} placeholder="At least 8 characters" /></label>
            <button className="button button-green auth-submit" type="submit">Create account <span aria-hidden="true">↗</span></button>
            {message && <p className="auth-message" role="status">{message}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}

export default function RegistrationDetailsPage() {
  return <Suspense fallback={<main className="auth-page" aria-busy="true" />}><RegistrationDetails /></Suspense>;
}
