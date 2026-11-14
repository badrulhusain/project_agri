"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { roleHome, useAuth } from "@/lib/auth";

const schema = z.object({
  phone: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/, "Enter your registered phone number."),
  password: z.string().min(1, "Enter your password."),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function submit(values: FormValues) {
    setServerError("");
    try {
      const user = await login(values.phone, values.password);
      router.replace(roleHome(user.role));
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Could not log in. Please try again.");
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-side">
        <Link className="auth-brand" href="/">
          <Image className="auth-logo" src="/images/vithu-logo.png" alt="" width={42} height={42} />vithu
        </Link>
        <div><p className="eyebrow eyebrow-light">Welcome back</p><h1>Let&apos;s make every harvest count.</h1><p>Your farm and market connections, all in one place.</p></div>
        <span>From farm to market, together.</span>
      </div>
      <div className="auth-main">
        <div className="auth-top"><Link href="/">← Back to home</Link><span>New to vithu? <Link href="/register">Get started</Link></span></div>
        <div className="auth-content">
          <p className="eyebrow">Your account</p>
          <h2>Log in to vithu.</h2>
          <p>Enter your details to continue.</p>
          <form className="auth-form" onSubmit={handleSubmit(submit)}>
            <label>Phone number
              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="Your registered phone number" aria-invalid={!!errors.phone} {...register("phone")} />
              {errors.phone && <small className="field-error">{errors.phone.message}</small>}
            </label>
            <label>Password
              <input type="password" autoComplete="current-password" placeholder="Your password" aria-invalid={!!errors.password} {...register("password")} />
              {errors.password && <small className="field-error">{errors.password.message}</small>}
            </label>
            <Link className="auth-help-link" href="/forgot-password">Forgot password?</Link>
            {serverError && <p className="auth-message" role="alert">{serverError}</p>}
            <button className="button button-green auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in…" : "Log in"} <span aria-hidden="true">↗</span>
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
