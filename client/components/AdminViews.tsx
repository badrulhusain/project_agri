"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, ArrowRight, BookOpen, ClipboardList, Package, Sprout, Users } from "lucide-react";
import { useState } from "react";
import { ApiError, api, getPage, type Order, type Product, type Role } from "@/lib/api";
import { money, ViewState } from "./PortalCommon";

type AdminUser = {
  id: string; name: string; email: string | null; phone: string;
  role: Role; isActive: boolean; createdAt: string;
};
type ActivityItem = { id: string; action: string; actorName?: string; subject?: string; createdAt: string };
type Overview = {
  totalUsers: number; farmers: number; buyers: number; agencies: number;
  activeProducts: number; totalOrders: number; pendingOrders: number;
  completedOrders: number; publishedSchemes: number; openSurplus: number;
  recentActivity: ActivityItem[];
};
type Scheme = {
  id: string; name: string; department: string; benefit: string;
  eligibility: string; applicationUrl: string; deadline: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};
type Surplus = {
  id: string; productId: string; productName: string; farmerName: string;
  location: string; originalQuantity: string; soldQuantity: string;
  remainingQuantity: string; unit: string; status: string;
};

const date = (value?: string | null) => value ? new Date(value).toLocaleDateString("en-IN") : "—";

function AdminDataState({ loading, error, empty, children, retry }: {
  loading: boolean; error?: Error | null; empty?: string; children: React.ReactNode; retry: () => void;
}) {
  if (error instanceof ApiError && error.status === 404) {
    return <div className="portal-state portal-unavailable"><h2>Admin API needed</h2><p>This screen is ready for the admin endpoint. The current backend does not expose it yet.</p></div>;
  }
  return <ViewState loading={loading} error={error} empty={empty} retry={retry}>{children}</ViewState>;
}

function Pager({ page, totalPages, setPage }: { page: number; totalPages: number; setPage: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <div className="portal-pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button></div>;
}

export function AdminDashboard() {
  const query = useQuery({ queryKey: ["admin", "overview"], queryFn: () => api<Overview>("admin/overview") });
  const data = query.data;
  const stats = [
    { label: "Users", value: data?.totalUsers, icon: Users, href: "/admin/users" },
    { label: "Farmers", value: data?.farmers, icon: Sprout, href: "/admin/users?role=FARMER" },
    { label: "Buyers", value: data?.buyers, icon: Users, href: "/admin/users?role=BUYER" },
    { label: "Active products", value: data?.activeProducts, icon: Package, href: "/admin/products" },
    { label: "Orders", value: data?.totalOrders, icon: ClipboardList, href: "/admin/orders" },
    { label: "Open surplus", value: data?.openSurplus, icon: Activity, href: "/admin/surplus" },
  ];
  return <AdminDataState loading={query.isPending} error={query.error} retry={() => void query.refetch()}>
    <div className="portal-stack">
      <div className="portal-stat-grid">{stats.map(({ label, value, icon: Icon, href }) => <Link className="portal-stat admin-stat" href={href} key={label}><span><Icon size={18} /> {label}</span><strong>{value ?? 0}</strong><small>Open {label.toLowerCase()} <ArrowRight size={12} /></small></Link>)}</div>
      <div className="portal-two-col">
        <section className="portal-panel"><div className="portal-panel-head"><h2>Needs attention</h2></div><div className="admin-attention"><Link href="/admin/orders"><strong>{data?.pendingOrders ?? 0}</strong><span>Pending orders</span><ArrowRight size={16} /></Link><Link href="/admin/schemes"><strong>{data?.publishedSchemes ?? 0}</strong><span>Published schemes</span><ArrowRight size={16} /></Link><Link href="/admin/surplus"><strong>{data?.openSurplus ?? 0}</strong><span>Open surplus listings</span><ArrowRight size={16} /></Link></div></section>
        <section className="portal-panel"><div className="portal-panel-head"><h2>Recent activity</h2><Link href="/admin/users">View all <ArrowRight size={16} /></Link></div>{data?.recentActivity.length ? data.recentActivity.slice(0, 5).map((entry) => <div className="portal-list-row" key={entry.id}><span>{entry.action}<small>{entry.actorName ? ` · ${entry.actorName}` : ""}</small></span><time>{date(entry.createdAt)}</time></div>) : <p className="portal-muted">No activity recorded yet.</p>}</section>
      </div>
    </div>
  </AdminDataState>;
}

export function AdminUsers({ initialRole }: { initialRole?: string }) {
  const [role, setRole] = useState(initialRole ?? "ALL");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (role !== "ALL") params.set("role", role);
  if (search) params.set("search", search);
  const query = useQuery({ queryKey: ["admin", "users", params.toString()], queryFn: () => getPage<AdminUser>(`admin/users?${params}`) });
  const status = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => api<AdminUser>(`admin/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
    onSuccess: () => { setMessage("Account status updated."); void queryClient.invalidateQueries({ queryKey: ["admin", "users"] }); void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }); },
    onError: (error: Error) => setMessage(error.message),
  });
  return <div className="portal-stack">
    <form className="admin-toolbar" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(draft.trim()); }}><label>Find a user<input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Name, phone, or email" /></label><label>Role<select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}><option value="ALL">All roles</option><option value="FARMER">Farmers</option><option value="BUYER">Buyers</option><option value="AGENCY">Agencies</option><option value="ADMIN">Admins</option></select></label><button type="submit" className="portal-button">Search</button></form>
    {message && <p className={status.isError ? "portal-error" : "portal-notice"} role="status">{message}</p>}
    <AdminDataState loading={query.isPending} error={query.error} empty={query.data?.items.length ? undefined : "No users match these filters."} retry={() => void query.refetch()}>
      <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead><tbody>{query.data?.items.map((user) => <tr key={user.id}><td><strong>{user.name}</strong><small>{user.phone}{user.email ? ` · ${user.email}` : ""}</small></td><td>{user.role.toLowerCase()}</td><td>{date(user.createdAt)}</td><td><span className={`admin-badge ${user.isActive ? "active" : "inactive"}`}>{user.isActive ? "Active" : "Inactive"}</span></td><td>{user.role === "ADMIN" ? <span className="portal-muted">Protected</span> : <button type="button" className="portal-secondary-button" disabled={status.isPending} onClick={() => { if (window.confirm(`${user.isActive ? "Deactivate" : "Reactivate"} ${user.name}?`)) status.mutate({ id: user.id, isActive: !user.isActive }); }}>{user.isActive ? "Deactivate" : "Reactivate"}</button>}</td></tr>)}</tbody></table></div>
    </AdminDataState>
    <Pager page={page} totalPages={query.data?.meta?.totalPages ?? 0} setPage={setPage} />
  </div>;
}

export function AdminActivity() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ["admin", "activity", page], queryFn: () => getPage<ActivityItem>(`admin/activity?page=${page}&limit=20`) });
  return <div className="portal-stack"><AdminDataState loading={query.isPending} error={query.error} empty={query.data?.items.length ? undefined : "No activity has been recorded."} retry={() => void query.refetch()}><div className="portal-panel">{query.data?.items.map((entry) => <div className="admin-activity-row" key={entry.id}><span className="admin-activity-icon"><Activity size={17} /></span><div><strong>{entry.action}</strong><small>{[entry.actorName, entry.subject].filter(Boolean).join(" · ") || "Platform event"}</small></div><time>{date(entry.createdAt)}</time></div>)}</div></AdminDataState><Pager page={page} totalPages={query.data?.meta?.totalPages ?? 0} setPage={setPage} /></div>;
}

export function AdminSchemes() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Scheme | null>(null);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "schemes", page], queryFn: () => getPage<Scheme>(`admin/schemes?page=${page}&limit=20`) });
  const save = useMutation({
    mutationFn: (input: Omit<Scheme, "id">) => editing
      ? api<Scheme>(`admin/schemes/${editing.id}`, { method: "PATCH", body: JSON.stringify(input) })
      : api<Scheme>("admin/schemes", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => { setMessage("Scheme saved."); setCreating(false); setEditing(null); void queryClient.invalidateQueries({ queryKey: ["admin", "schemes"] }); void queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }); },
    onError: (error: Error) => setMessage(error.message),
  });
  return <div className="portal-stack">
    <div className="admin-section-actions"><p>Publish verified scheme information with an official application link.</p><button className="portal-button" onClick={() => { setEditing(null); setCreating(true); setMessage(""); }}>Add scheme</button></div>
    {message && <p className={save.isError ? "portal-error" : "portal-notice"} role="status">{message}</p>}
    {(creating || editing) && <SchemeForm key={editing?.id ?? "new"} initial={editing} saving={save.isPending} onCancel={() => { setCreating(false); setEditing(null); }} onSave={(input) => save.mutate(input)} />}
    <AdminDataState loading={query.isPending} error={query.error} empty={query.data?.items.length ? undefined : "No schemes have been added."} retry={() => void query.refetch()}><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Scheme</th><th>Department</th><th>Deadline</th><th>Status</th><th>Action</th></tr></thead><tbody>{query.data?.items.map((scheme) => <tr key={scheme.id}><td><strong>{scheme.name}</strong><small>{scheme.benefit}</small></td><td>{scheme.department}</td><td>{date(scheme.deadline)}</td><td><span className={`admin-badge ${scheme.status === "PUBLISHED" ? "active" : "inactive"}`}>{scheme.status.toLowerCase()}</span></td><td><button className="portal-secondary-button" onClick={() => { setCreating(false); setEditing(scheme); setMessage(""); }}>Edit</button></td></tr>)}</tbody></table></div></AdminDataState>
    <Pager page={page} totalPages={query.data?.meta?.totalPages ?? 0} setPage={setPage} />
  </div>;
}

function SchemeForm({ initial, saving, onCancel, onSave }: { initial: Scheme | null; saving: boolean; onCancel: () => void; onSave: (input: Omit<Scheme, "id">) => void }) {
  const [values, setValues] = useState<Omit<Scheme, "id">>({ name: initial?.name ?? "", department: initial?.department ?? "", benefit: initial?.benefit ?? "", eligibility: initial?.eligibility ?? "", applicationUrl: initial?.applicationUrl ?? "", deadline: initial?.deadline ?? null, status: initial?.status ?? "DRAFT" });
  function set(key: keyof typeof values, value: string | null) { setValues((current) => ({ ...current, [key]: value })); }
  return <form className="portal-panel admin-scheme-form" onSubmit={(event) => { event.preventDefault(); onSave(values); }}><h2>{initial ? "Edit scheme" : "Add scheme"}</h2><div className="admin-form-grid"><label>Scheme name<input required value={values.name} onChange={(event) => set("name", event.target.value)} /></label><label>Department<input required value={values.department} onChange={(event) => set("department", event.target.value)} /></label><label className="admin-wide">Benefit summary<textarea required rows={2} value={values.benefit} onChange={(event) => set("benefit", event.target.value)} /></label><label className="admin-wide">Eligibility summary<textarea required rows={2} value={values.eligibility} onChange={(event) => set("eligibility", event.target.value)} /></label><label>Official application URL<input required type="url" pattern="https://.*" value={values.applicationUrl} onChange={(event) => set("applicationUrl", event.target.value)} /></label><label>Deadline (optional)<input type="date" value={values.deadline?.slice(0, 10) ?? ""} onChange={(event) => set("deadline", event.target.value || null)} /></label><label>Status<select value={values.status} onChange={(event) => set("status", event.target.value)}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></label></div><div className="admin-form-actions"><button type="button" className="portal-secondary-button" onClick={onCancel}>Cancel</button><button type="submit" className="portal-button" disabled={saving}>{saving ? "Saving..." : "Save scheme"}</button></div></form>;
}

export function AdminSurplus() {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ["admin", "surplus", page], queryFn: () => getPage<Surplus>(`admin/surplus?page=${page}&limit=20`) });
  return <div className="portal-stack"><AdminDataState loading={query.isPending} error={query.error} empty={query.data?.items.length ? undefined : "No surplus listings need attention."} retry={() => void query.refetch()}><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Farmer</th><th>Original</th><th>Sold</th><th>Remaining</th><th>Status</th></tr></thead><tbody>{query.data?.items.map((entry) => <tr key={entry.id}><td><strong>{entry.productName}</strong><small>{entry.location}</small></td><td>{entry.farmerName}</td><td>{entry.originalQuantity} {entry.unit}</td><td>{entry.soldQuantity} {entry.unit}</td><td><strong>{entry.remainingQuantity} {entry.unit}</strong></td><td><span className="admin-badge inactive">{entry.status.toLowerCase()}</span></td></tr>)}</tbody></table></div></AdminDataState><Pager page={page} totalPages={query.data?.meta?.totalPages ?? 0} setPage={setPage} /></div>;
}

export function AdminRecords({ kind }: { kind: "products" | "orders" }) {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ["admin", kind, page], queryFn: () => getPage<Product | Order>(`admin/${kind}?page=${page}&limit=20`) });
  return <div className="portal-stack"><AdminDataState loading={query.isPending} error={query.error} empty={query.data?.items.length ? undefined : `No ${kind} found.`} retry={() => void query.refetch()}><div className="admin-table-wrap"><table className="admin-table"><thead><tr>{kind === "products" ? <><th>Product</th><th>Farmer</th><th>Available</th><th>Price</th><th>Status</th></> : <><th>Order</th><th>Amount</th><th>Placed</th><th>Status</th></>}</tr></thead><tbody>{query.data?.items.map((entry) => kind === "products" ? <ProductRow key={entry.id} product={entry as Product} /> : <OrderRow key={entry.id} order={entry as Order} />)}</tbody></table></div></AdminDataState><Pager page={page} totalPages={query.data?.meta?.totalPages ?? 0} setPage={setPage} /></div>;
}

function ProductRow({ product }: { product: Product }) {
  return <tr><td><strong>{product.name}</strong><small>{product.category} · {product.location}</small></td><td>{product.farmer?.name ?? product.farmerId ?? "—"}</td><td>{product.availableQuantity} {product.unit}</td><td>{money(product.pricePerUnit)}</td><td><span className="admin-badge active">{product.status?.toLowerCase() ?? "available"}</span></td></tr>;
}
function OrderRow({ order }: { order: Order }) {
  return <tr><td><strong>#{order.id.slice(0, 8)}</strong><small>{order.items?.map((item) => item.productName).filter(Boolean).join(", ") || "Order"}</small></td><td>{money(order.totalAmount)}</td><td>{date(order.createdAt)}</td><td><span className={`admin-badge ${order.status === "COMPLETED" ? "active" : "inactive"}`}>{order.status.toLowerCase()}</span></td></tr>;
}

export function AdminProducts() {
  return <AdminRecords kind="products" />;
}

export function AdminOrders() {
  return <AdminRecords kind="orders" />;
}

export function AdminSettings() {
  return <div className="portal-stack"><div className="portal-panel"><div className="portal-panel-head"><h2>Platform configuration</h2></div><AdminDataState loading={false} error={null} empty={undefined} retry={() => {}}><p className="portal-muted">Platform settings are managed by the backend configuration. The current API does not expose a settings endpoint, so values cannot be edited from this interface.</p></AdminDataState></div></div>;
}
