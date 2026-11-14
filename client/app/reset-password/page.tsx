import Link from "next/link";

export default function ResetPasswordPage() {
  return <main className="auth-page auth-page-centered"><div className="auth-content"><p className="eyebrow">Account help</p><h1>Password reset is not available yet.</h1><p>The current API does not provide a reset-token endpoint, so this page cannot change your password.</p><Link className="button button-green" href="/login">Back to login</Link></div></main>;
}
