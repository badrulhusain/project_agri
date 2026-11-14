"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { roleHome, useAuth } from "@/lib/auth";

<<<<<<< HEAD
const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.union([z.email("Enter a valid email address."), z.literal("")]).optional(),
  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, "Enter a phone number with 8 to 15 digits, optionally starting with +."),
  password: z.string().min(10, "Use at least 10 characters.").max(72, "Use 72 characters or fewer."),
});
type FormValues = z.infer<typeof schema>;
=======
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
>>>>>>> 98e1e03b8776b58bf3e2b5b63783954755a122f0

function RegistrationDetails() {
  const router = useRouter();
  const searchParams = useSearchParams();
<<<<<<< HEAD
  const role = searchParams.get("role");
  const { register: createAccount } = useAuth();
  const [serverError, setServerError] = useState("");
  const [registered, setRegistered] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
=======
  const requestedRole = searchParams.get("role");
  const role: Role | null =
    requestedRole === "farmer" || requestedRole === "buyer" || requestedRole === "agency"
      ? requestedRole
      : null;
  const [message, setMessage] = useState("");
  const [fields, setFields] = useState<RegistrationFields>({ name: "", phone: "", password: "" });
>>>>>>> 98e1e03b8776b58bf3e2b5b63783954755a122f0

  if (role !== "farmer" && role !== "buyer") {
    return (
      <main className="auth-page auth-page-centered register-page">
        <div className="auth-content">
          <p className="eyebrow">Create your account</p>
          <h1>Choose how you will use vithu.</h1>
          <p>Select an available account type before entering your details.</p>
          <Link className="button button-green" href="/register">Choose account type <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  if (registered) {
    return <main className="auth-page auth-page-centered register-page"><div className="auth-content"><p className="eyebrow">Account created</p><h1>You&apos;re ready to log in.</h1><p>Your registration was accepted by the backend. Use your phone number and password to enter your workspace.</p><Link className="button button-green" href="/login">Go to login <span aria-hidden="true">↗</span></Link></div></main>;
  }

  async function submit(values: FormValues) {
    setServerError("");
    try {
      const user = await createAccount({
        name: values.name,
        ...(values.email ? { email: values.email } : {}),
        phone: values.phone,
        password: values.password,
        role: role === "farmer" ? "FARMER" : "BUYER",
      });
      if (user) router.replace(roleHome(user.role));
      else setRegistered(true);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  }

  return (
    <main className="auth-page register-page">
      <div className="auth-side">
        <Link className="auth-brand" href="/"><Image className="auth-logo" src="/images/vithu-logo.png" alt="" width={42} height={42} />vithu</Link>
        <div><p className="eyebrow eyebrow-light">Almost there</p><h1>A new connection starts here.</h1><p>Add your details so you can join the vithu community.</p></div>
        <span>From farm to market, together.</span>
      </div>
      <div className="auth-main">
        <div className="auth-top"><Link href={`/register?role=${role}`}>← Change account type</Link><span>Already a member? <Link href="/login">Log in</Link></span></div>
        <div className="auth-content">
          <div className="auth-progress" aria-label="Step 2 of 2"><span className="auth-progress-active" /><span className="auth-progress-active" /></div>
          <p className="eyebrow">Step 2 of 2 · {role === "farmer" ? "Farmer" : "Buyer"} account</p>
          <h2>Tell us about yourself.</h2>
          <p>Enter your details to get started.</p>
<<<<<<< HEAD
          <form className="auth-form" onSubmit={handleSubmit(submit)}>
            <label>Full name<input type="text" autoComplete="name" placeholder="Your name" aria-invalid={!!errors.name} {...register("name")} />{errors.name && <small className="field-error">{errors.name.message}</small>}</label>
            <label>Phone number<input type="tel" autoComplete="tel" inputMode="tel" placeholder="e.g. +919000000001" aria-invalid={!!errors.phone} {...register("phone")} />{errors.phone && <small className="field-error">{errors.phone.message}</small>}</label>
            <label>Email address <span className="optional-label">(optional)</span><input type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} {...register("email")} />{errors.email && <small className="field-error">{errors.email.message}</small>}</label>
            <label>Password<input type="password" autoComplete="new-password" placeholder="At least 10 characters" aria-invalid={!!errors.password} {...register("password")} />{errors.password && <small className="field-error">{errors.password.message}</small>}</label>
            {serverError && <p className="auth-message" role="alert">{serverError}</p>}
            <button className="button button-green auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account…" : "Create account"} <span aria-hidden="true">↗</span></button>
=======
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
>>>>>>> 98e1e03b8776b58bf3e2b5b63783954755a122f0
          </form>
        </div>
      </div>
    </main>
  );
}

export default function RegistrationDetailsPage() {
  return <Suspense fallback={<main className="auth-page" aria-busy="true" />}><RegistrationDetails /></Suspense>;
}
