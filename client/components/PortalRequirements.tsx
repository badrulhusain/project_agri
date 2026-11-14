"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  PhoneCall,
  Plus,
  Search,
  Share2,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { money, ProductCard, useProducts, ViewState } from "./PortalCommon";
import {
  useRequirements,
  type BuyerRequirement,
  type RequirementInput,
} from "@/lib/requirements";
import { useWishlist } from "@/lib/wishlist";

// ==========================================
// 1. BUYER: List Requirements Page
// ==========================================
export function BuyerRequirementsPage() {
  const { user } = useAuth();
  const { requirements, deleteRequirement, updateStatus } = useRequirements();
  const [tab, setTab] = useState<"my" | "all">("my");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const myRequirements = useMemo(() => {
    return requirements.filter(
      (r) => r.buyerId === user?.id || (user?.email && r.email === user.email) || (user?.phone && r.phone === user.phone)
    );
  }, [requirements, user]);

  const displayed = useMemo(() => {
    const list = tab === "my" ? myRequirements : requirements;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [tab, myRequirements, requirements, search]);

  const urgentCount = myRequirements.filter((r) => r.urgency === "URGENT").length;
  const openCount = myRequirements.filter((r) => r.status === "OPEN").length;

  return (
    <div className="portal-stack">
      {notice && (
        <div className="portal-notice" role="status" style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} style={{ border: 0, background: "none", cursor: "pointer" }}>✕</button>
        </div>
      )}

      {/* Overview Stats */}
      <div className="portal-stat-grid">
        <div className="portal-stat">
          <span><FileText size={18} /> My Posted Requests</span>
          <strong>{myRequirements.length}</strong>
          <small>Active produce requirements</small>
        </div>
        <div className="portal-stat">
          <span><Clock size={18} /> Open Requirements</span>
          <strong>{openCount}</strong>
          <small>Awaiting farmer offers</small>
        </div>
        <div className="portal-stat">
          <span><Plus size={18} /> Urgent Demands</span>
          <strong>{urgentCount}</strong>
          <small>High priority procurement</small>
        </div>
      </div>

      {/* Action Banner */}
      <div className="portal-promo" style={{ background: "#0c5339" }}>
        <div>
          <strong style={{ fontSize: 20 }}>Can&apos;t find what you need in the marketplace?</strong>
          <small style={{ fontSize: 13, color: "#d2ebd6", display: "block", marginTop: 4 }}>
            Post a requirement describing the produce, desired quantity, and target price. Local farmers will see your demand and contact you directly.
          </small>
        </div>
        <Link className="portal-button" href="/buyer/requirements/new" style={{ background: "#7cd34b", color: "#063825" }}>
          <Plus size={17} /> Post requirement
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="portal-panel" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div className="portal-tab-bar" style={{ margin: 0, border: 0, padding: 0 }}>
            <button
              type="button"
              className={`portal-tab-btn ${tab === "my" ? "active" : ""}`}
              onClick={() => setTab("my")}
            >
              My Postings ({myRequirements.length})
            </button>
            <button
              type="button"
              className={`portal-tab-btn ${tab === "all" ? "active" : ""}`}
              onClick={() => setTab("all")}
            >
              All Market Demands ({requirements.length})
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ position: "relative", width: 260 }}>
              <input
                type="text"
                placeholder="Search produce, location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  height: 38,
                  padding: "0 12px 0 32px",
                  borderRadius: 8,
                  border: "1px solid #d4e1d4",
                  fontSize: 13,
                }}
              />
              <Search size={15} style={{ position: "absolute", left: 10, top: 12, color: "#7a8e7e" }} />
            </div>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                style={{ border: 0, background: "none", color: "#136d49", fontSize: 12, cursor: "pointer", fontWeight: 700 }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requirements List */}
      {displayed.length === 0 ? (
        <div className="portal-state">
          <FileText size={32} />
          <h2>No requirements found</h2>
          <p>
            {tab === "my"
              ? "You haven't posted any produce requirements yet. Tell farmers what you need to receive offers."
              : "No market requirements match your search filter."}
          </p>
          {tab === "my" && (
            <Link className="portal-button" href="/buyer/requirements/new" style={{ marginTop: 12 }}>
              <Plus size={17} /> Post your first requirement
            </Link>
          )}
        </div>
      ) : (
        <div className="portal-req-grid">
          {displayed.map((req) => {
            const isOwner = req.buyerId === user?.id || (user?.phone && req.phone === user.phone);
            return (
              <div key={req.id} className="portal-req-card">
                <div>
                  <div className="portal-req-head">
                    <span className="portal-chip">{req.category}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span className={`portal-badge portal-badge-${req.urgency.toLowerCase()}`}>
                        {req.urgency}
                      </span>
                      <span className={`portal-badge portal-badge-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <h3>{req.productName}</h3>

                  <div className="portal-req-meta-row">
                    <div className="portal-req-meta-item">
                      <span>Quantity needed</span>
                      <strong>{req.quantity} {req.unit}</strong>
                    </div>
                    <div className="portal-req-meta-item">
                      <span>Target price</span>
                      <strong>{req.targetPrice ? money(req.targetPrice) : "Open to quotes"}</strong>
                    </div>
                  </div>

                  <p className="portal-req-desc">{req.description}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#687c6f", marginBottom: 10 }}>
                    <MapPin size={14} />
                    <span>{req.location}</span>
                    {req.neededBy && <span>• Needed: {req.neededBy}</span>}
                  </div>
                </div>

                <div className="portal-req-buyer-info">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span className="portal-req-buyer-name">{req.buyerName}</span>
                      {req.businessName && <div className="portal-req-buyer-sub">{req.businessName}</div>}
                    </div>
                    <small style={{ color: "#8a9c8f" }}>
                      {new Date(req.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </small>
                  </div>

                  {isOwner && (
                    <div style={{ display: "flex", gap: 8, marginTop: 12, borderTop: "1px solid #edf2ec", paddingTop: 10 }}>
                      {req.status === "OPEN" ? (
                        <button
                          type="button"
                          className="portal-contact-btn"
                          onClick={() => {
                            updateStatus(req.id, "FULFILLED");
                            setNotice(`Marked "${req.productName}" as fulfilled.`);
                          }}
                        >
                          <CheckCircle2 size={14} /> Mark fulfilled
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="portal-contact-btn"
                          onClick={() => {
                            updateStatus(req.id, "OPEN");
                            setNotice(`Re-opened "${req.productName}" requirement.`);
                          }}
                        >
                          Reopen request
                        </button>
                      )}
                      <button
                        type="button"
                        className="portal-contact-btn"
                        style={{ color: "#ad4c3c" }}
                        onClick={() => {
                          if (window.confirm(`Delete requirement "${req.productName}"?`)) {
                            deleteRequirement(req.id);
                            setNotice("Requirement deleted.");
                          }
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 2. BUYER: New Requirement Form Page ("I need this product")
// ==========================================
export function BuyerRequirementFormPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addRequirement } = useRequirements();

  const [form, setForm] = useState<RequirementInput>({
    buyerId: user?.id ?? "buyer-anon",
    buyerName: user?.name ?? "",
    businessName: "",
    phone: user?.phone ?? "",
    email: user?.email ?? "",
    productName: "",
    category: "Vegetables",
    quantity: "",
    unit: "kg",
    targetPrice: "",
    neededBy: "Within a week",
    urgency: "NORMAL",
    location: "Kerala",
    deliveryAddress: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const setField = (key: keyof RequirementInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) return setError("Please enter what product or crop you need.");
    if (!form.quantity || Number(form.quantity) <= 0) return setError("Please enter a valid quantity greater than zero.");
    if (!form.location.trim()) return setError("Please enter your delivery location/district.");
    if (!form.phone?.trim()) return setError("Please provide a contact phone number so farmers can reach you.");

    setError("");
    setSubmitting(true);

    try {
      addRequirement({
        ...form,
        buyerId: user?.id ?? "buyer-anon",
        buyerName: form.buyerName.trim() || user?.name || "Buyer",
      });
      router.push("/buyer/requirements");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post requirement.");
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-stack" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="portal-form-card" style={{ padding: "28px 32px" }}>
        <div style={{ marginBottom: 24 }}>
          <p className="portal-overline">Produce Procurement</p>
          <h2 style={{ fontSize: 26, margin: "4px 0 8px", color: "#133b28" }}>
            &ldquo;I need this product&rdquo; – Post a Requirement
          </h2>
          <p className="portal-muted">
            Tell local farmers and suppliers what you want to purchase. They will see your requirement on their portal and can directly contact you with price quotes and availability.
          </p>
        </div>

        {error && <p className="portal-error" role="alert" style={{ marginBottom: 20 }}>{error}</p>}

        <form onSubmit={handleSubmit} className="portal-form-grid">
          {/* Product details */}
          <label className="portal-wide">
            Product name *
            <input
              type="text"
              required
              placeholder="e.g. Fresh Red Onions, Matta Rice, Robusta Bananas"
              value={form.productName}
              onChange={(e) => setField("productName", e.target.value)}
            />
          </label>

          <label>
            Category *
            <select value={form.category} onChange={(e) => setField("category", e.target.value)}>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Grains & Cereals">Grains & Cereals</option>
              <option value="Pulses & Lentils">Pulses & Lentils</option>
              <option value="Spices">Spices</option>
              <option value="Oilseeds">Oilseeds</option>
              <option value="Dairy & Poultry">Dairy & Poultry</option>
              <option value="Other Produce">Other Produce</option>
            </select>
          </label>

          <label>
            Urgency / Timeline
            <select value={form.urgency} onChange={(e) => setField("urgency", e.target.value as "NORMAL" | "HIGH" | "URGENT")}>
              <option value="NORMAL">Normal (Flexible schedule)</option>
              <option value="HIGH">High Priority (Within 5-7 days)</option>
              <option value="URGENT">Urgent (Immediate / 1-3 days)</option>
            </select>
          </label>

          <label>
            Required Quantity *
            <input
              type="number"
              step="any"
              min="0.1"
              required
              placeholder="e.g. 500"
              value={form.quantity}
              onChange={(e) => setField("quantity", e.target.value)}
            />
          </label>

          <label>
            Unit of Measurement *
            <select value={form.unit} onChange={(e) => setField("unit", e.target.value)}>
              <option value="kg">kg (Kilograms)</option>
              <option value="quintal">quintal (100 kg)</option>
              <option value="tonne">tonne (1000 kg)</option>
              <option value="crate">crate</option>
              <option value="piece">piece</option>
              <option value="litre">litre</option>
            </select>
          </label>

          <label>
            Target / Expected Price per {form.unit} (₹)
            <input
              type="number"
              step="any"
              placeholder="Optional budget / target price"
              value={form.targetPrice}
              onChange={(e) => setField("targetPrice", e.target.value)}
            />
          </label>

          <label>
            Needed By Timeline
            <input
              type="text"
              placeholder="e.g. Within 3 days, by 25th Nov"
              value={form.neededBy}
              onChange={(e) => setField("neededBy", e.target.value)}
            />
          </label>

          <label className="portal-wide">
            Delivery Location (District & State) *
            <input
              type="text"
              required
              placeholder="e.g. Ernakulam, Kerala"
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
            />
          </label>

          <label className="portal-wide">
            Full Delivery Address or Warehouse (Optional)
            <input
              type="text"
              placeholder="e.g. Shop #12, Wholesale Market, Kalamassery"
              value={form.deliveryAddress}
              onChange={(e) => setField("deliveryAddress", e.target.value)}
            />
          </label>

          <label className="portal-wide">
            Quality Specifications & Notes
            <textarea
              rows={3}
              placeholder="Mention size, variety, organic certification, moisture limit, packaging preferences, or payment terms..."
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
            />
          </label>

          {/* Contact Details */}
          <div className="portal-wide" style={{ borderTop: "1px solid #e2eae1", paddingTop: 18, marginTop: 8 }}>
            <h4 style={{ fontSize: 15, margin: "0 0 12px", color: "#194531" }}>Your Contact Details for Farmers</h4>
          </div>

          <label>
            Contact Person Name *
            <input
              type="text"
              required
              placeholder="Your full name"
              value={form.buyerName}
              onChange={(e) => setField("buyerName", e.target.value)}
            />
          </label>

          <label>
            Business / Company Name (Optional)
            <input
              type="text"
              placeholder="e.g. Green Harvest Foods"
              value={form.businessName}
              onChange={(e) => setField("businessName", e.target.value)}
            />
          </label>

          <label>
            Phone Number (for Calls & WhatsApp) *
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
            />
          </label>

          <label>
            Email Address (Optional)
            <input
              type="email"
              placeholder="procurement@example.com"
              value={form.email}
              onChange={(e) => setField("email", e.target.value)}
            />
          </label>

          <div className="portal-form-actions portal-wide" style={{ marginTop: 24 }}>
            <button
              type="button"
              className="portal-secondary-button"
              onClick={() => router.push("/buyer/requirements")}
            >
              <ArrowLeft size={16} /> Cancel
            </button>
            <button
              type="submit"
              className="portal-button"
              disabled={submitting}
            >
              {submitting ? "Posting requirement…" : "Publish requirement"} <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// 3. SELLER / FARMER: Buyer Requirements Page
// ==========================================
export function FarmerBuyerRequirements() {
  const { requirements } = useRequirements();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedUrgency, setSelectedUrgency] = useState("ALL");
  const [activeContactReq, setActiveContactReq] = useState<BuyerRequirement | null>(null);
  const [copied, setCopied] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    requirements.forEach((r) => set.add(r.category));
    return ["ALL", ...Array.from(set)];
  }, [requirements]);

  const filtered = useMemo(() => {
    return requirements.filter((r) => {
      if (r.status !== "OPEN") return false;
      if (selectedCategory !== "ALL" && r.category !== selectedCategory) return false;
      if (selectedUrgency !== "ALL" && r.urgency !== selectedUrgency) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.productName.toLowerCase().includes(q) ||
          r.buyerName.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          (r.businessName && r.businessName.toLowerCase().includes(q)) ||
          r.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [requirements, selectedCategory, selectedUrgency, search]);

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="portal-stack">
      {/* Stats bar */}
      <div className="portal-stat-grid">
        <div className="portal-stat">
          <span><Search size={18} /> Active Market Demands</span>
          <strong>{requirements.filter((r) => r.status === "OPEN").length}</strong>
          <small>Buyers looking for harvest today</small>
        </div>
        <div className="portal-stat">
          <span><Clock size={18} /> Urgent Procurement</span>
          <strong>{requirements.filter((r) => r.status === "OPEN" && r.urgency === "URGENT").length}</strong>
          <small>Ready for immediate delivery & payment</small>
        </div>
        <div className="portal-stat">
          <span><PhoneCall size={18} /> Direct Farmer-Buyer Contact</span>
          <strong>100%</strong>
          <small>Zero middleman commission</small>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="portal-filter-bar">
        <label>
          <span>Search produce or buyer</span>
          <input
            type="text"
            placeholder="e.g. Onions, Rice, Bananas, Ernakulam..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          <span>Category</span>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "ALL" ? "All categories" : c}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Urgency</span>
          <select value={selectedUrgency} onChange={(e) => setSelectedUrgency(e.target.value)}>
            <option value="ALL">All priorities</option>
            <option value="URGENT">Urgent only</option>
            <option value="HIGH">High priority</option>
            <option value="NORMAL">Normal</option>
          </select>
        </label>
        <button
          type="button"
          className="portal-button"
          onClick={() => {
            setSearch("");
            setSelectedCategory("ALL");
            setSelectedUrgency("ALL");
          }}
        >
          Reset
        </button>
      </div>

      {/* Results header */}
      <div className="portal-results-head">
        <p>Showing <strong>{filtered.length}</strong> active buyer requirements</p>
      </div>

      {/* Demands Grid */}
      {filtered.length === 0 ? (
        <div className="portal-state">
          <Search size={32} />
          <h2>No matching buyer requirements</h2>
          <p>Try broadening your search keyword or clearing the category filter.</p>
        </div>
      ) : (
        <div className="portal-req-grid">
          {filtered.map((req) => {
            const cleanPhone = (req.phone || "").replace(/[^0-9]/g, "");
            const whatsappUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${req.buyerName}, I saw your requirement on Vithu for "${req.productName}" (${req.quantity} ${req.unit}). I have fresh harvest available and would like to provide a quote.`
                )}`
              : "";

            return (
              <div key={req.id} className="portal-req-card">
                <div>
                  <div className="portal-req-head">
                    <span className="portal-chip">{req.category}</span>
                    <span className={`portal-badge portal-badge-${req.urgency.toLowerCase()}`}>
                      {req.urgency}
                    </span>
                  </div>

                  <h3>{req.productName}</h3>

                  <div className="portal-req-meta-row">
                    <div className="portal-req-meta-item">
                      <span>Buyer needs</span>
                      <strong>{req.quantity} {req.unit}</strong>
                    </div>
                    <div className="portal-req-meta-item">
                      <span>Target price</span>
                      <strong>{req.targetPrice ? money(req.targetPrice) : "Negotiable"}</strong>
                    </div>
                  </div>

                  <p className="portal-req-desc">{req.description}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12, color: "#687c6f", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <MapPin size={14} color="#0c6542" />
                      <span>Delivery location: <strong>{req.location}</strong></span>
                    </div>
                    {req.neededBy && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Clock size={14} color="#0c6542" />
                        <span>Needed: <strong>{req.neededBy}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="portal-req-buyer-info">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span className="portal-req-buyer-name">{req.buyerName}</span>
                      {req.businessName && <div className="portal-req-buyer-sub">{req.businessName}</div>}
                    </div>
                    <span className="portal-chip" style={{ background: "#edf7ee", color: "#166a3d" }}>
                      Verified Buyer
                    </span>
                  </div>

                  {/* Direct Contact Actions for Seller */}
                  <div className="portal-contact-actions">
                    {req.phone && (
                      <a
                        href={`tel:${req.phone}`}
                        className="portal-contact-btn portal-contact-btn-primary"
                        title="Call buyer directly"
                      >
                        <Phone size={14} /> Call
                      </a>
                    )}
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portal-contact-btn"
                        style={{ color: "#198754", borderColor: "#a3cfbb" }}
                        title="Message on WhatsApp"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      className="portal-contact-btn"
                      onClick={() => setActiveContactReq(req)}
                    >
                      <User size={14} /> Contact info
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Buyer Contact Modal */}
      {activeContactReq && (
        <div className="portal-modal-backdrop" onClick={() => setActiveContactReq(null)}>
          <div className="portal-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="portal-modal-close"
              onClick={() => setActiveContactReq(null)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <span className="portal-overline">Buyer Contact Details</span>
            <h2 style={{ fontSize: 22, margin: "4px 0 16px", color: "#113826" }}>
              {activeContactReq.buyerName}
            </h2>

            <dl className="portal-profile-list" style={{ maxWidth: "100%", marginBottom: 20 }}>
              {activeContactReq.businessName && (
                <div>
                  <dt>Business / Firm</dt>
                  <dd>{activeContactReq.businessName}</dd>
                </div>
              )}
              <div>
                <dt>Produce Wanted</dt>
                <dd>{activeContactReq.productName} ({activeContactReq.quantity} {activeContactReq.unit})</dd>
              </div>
              <div>
                <dt>Target Price</dt>
                <dd>{activeContactReq.targetPrice ? money(activeContactReq.targetPrice) : "Open to quote"}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd style={{ color: "#0d6543", fontWeight: 800 }}>
                  {activeContactReq.phone || "Not provided"}
                </dd>
              </div>
              {activeContactReq.email && (
                <div>
                  <dt>Email</dt>
                  <dd>{activeContactReq.email}</dd>
                </div>
              )}
              <div>
                <dt>Location</dt>
                <dd>{activeContactReq.location}</dd>
              </div>
              {activeContactReq.deliveryAddress && (
                <div>
                  <dt>Delivery Address</dt>
                  <dd>{activeContactReq.deliveryAddress}</dd>
                </div>
              )}
            </dl>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {activeContactReq.phone && (
                <a
                  href={`tel:${activeContactReq.phone}`}
                  className="portal-button"
                  style={{ flex: 1, minWidth: 120 }}
                >
                  <Phone size={15} /> Call now
                </a>
              )}
              {activeContactReq.phone && (
                <button
                  type="button"
                  className="portal-secondary-button"
                  onClick={() => copyToClipboard(activeContactReq.phone ?? "")}
                >
                  <Copy size={15} /> {copied ? "Copied!" : "Copy phone"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. BUYER: Functional Wishlist Page
// ==========================================
export function BuyerWishlistPage() {
  const products = useProducts("limit=100");
  const { wishlistIds, remove, count } = useWishlist();

  const wishlistedProducts = useMemo(() => {
    const all = products.data?.items ?? [];
    return all.filter((p) => wishlistIds.includes(p.id));
  }, [products.data, wishlistIds]);

  return (
    <div className="portal-stack">
      <div className="portal-results-head">
        <p>
          You have <strong>{count}</strong> {count === 1 ? "product" : "products"} saved in your wishlist
        </p>
        <Link href="/buyer/marketplace" className="portal-button" style={{ minHeight: 36, fontSize: 12 }}>
          <Search size={15} /> Browse marketplace
        </Link>
      </div>

      <ViewState
        loading={products.isPending}
        error={products.error}
        empty={
          count === 0
            ? "Your wishlist is empty. Browse the marketplace and tap the heart icon on any produce to save it for quick access."
            : undefined
        }
        retry={() => products.refetch()}
      >
        {count > 0 && wishlistedProducts.length === 0 && !products.isPending ? (
          <div className="portal-state">
            <Heart size={32} />
            <h2>Saved items out of current stock</h2>
            <p>
              Some of your saved items might have been sold out or are not on the first page of marketplace results.
            </p>
            <Link className="portal-button" href="/buyer/marketplace">
              Explore available produce
            </Link>
          </div>
        ) : (
          <div className="portal-product-grid">
            {wishlistedProducts.map((product) => (
              <div key={product.id} style={{ display: "flex", flexDirection: "column" }}>
                <ProductCard product={product} href={`/buyer/products/${product.id}`} />
                <div className="portal-card-actions" style={{ justifyContent: "space-between", marginTop: 6 }}>
                  <Link
                    href={`/buyer/products/${product.id}`}
                    className="portal-button"
                    style={{ minHeight: 32, padding: "0 14px", fontSize: 11 }}
                  >
                    Order now
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(product.id)}
                    style={{ color: "#b94a39", display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ViewState>
    </div>
  );
}
