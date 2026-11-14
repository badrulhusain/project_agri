"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState("");
  return <main className="auth-page"><div className="auth-side"><Link className="auth-brand" href="/"><Image className="auth-logo" src="/images/vithu-logo.png" alt="" width={42} height={42} />vithu</Link><div><p className="eyebrow eyebrow-light">Welcome back</p><h1>Let&apos;s make every harvest count.</h1><p>Your farm and market connections, all in one place.</p></div><span>From farm to market, together.</span></div><div className="auth-main"><div className="auth-top"><Link href="/">← Back to home</Link><span>New to vithu? <Link href="/register">Get started</Link></span></div><div className="auth-content"><p className="eyebrow">Your account</p><h2>Log in to vithu.</h2><p>Enter your details to continue.</p><form className="auth-form" onSubmit={event => { event.preventDefault(); setMessage("Login is not connected to the backend yet. Your details were not submitted."); }}><label>Email or phone<input name="identifier" type="text" autoComplete="username" required placeholder="Email or phone number" /></label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Your password" /></label><button className="button button-green auth-submit" type="submit">Log in <span aria-hidden="true">↗</span></button>{message && <p className="auth-message" role="status">{message}</p>}</form></div></div></main>;
}

