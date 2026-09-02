import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  Mail,
  Menu,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import "./styles.css";
import "./admin.css";
import "./contact.css";

const logo = "/assets/ravion-logo.png";
const categories = [
  "All",
  "Web Services",
  "AI Product Photography",
  "Social Media",
  "Photoshop / Design",
  "Video",
];
async function api(path, options = {}) {
  const token = sessionStorage.getItem("ravion-admin-token");
  const headers = options.body instanceof FormData ? {} : { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, { ...options, headers: { ...headers, ...options.headers } });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || "Something went wrong.");
  return data;
}
function useSamples(admin = false) {
  const [samples, setSamples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = async () => { try { setLoading(true); setSamples(await api(admin ? "/api/admin/samples" : "/api/samples")); setError(""); } catch (err) { setError(err.message); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, [admin]);
  return { samples, loading, error, refresh };
}

function Brand({ small = false }) {
  return (
    <Link className={"brand " + (small ? "small" : "")} to="/">
      <img src={logo} alt="Ravion" />
    </Link>
  );
}
function Splash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    show && (
      <div className="splash">
        <img src={logo} alt="Ravion" />
        <span>BUILD · CREATE · INNOVATE</span>
      </div>
    )
  );
}
function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["About", "about"],
    ["Services", "services"],
    ["Work", "work"],
    ["Contact", "contact"],
  ];
  return (
    <header>
      <nav className="nav shell">
        <Brand />
        <button
          aria-label="Open navigation"
          className="menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <div className={"navlinks " + (open ? "open" : "")}>
          {links.map(([label, id]) => (
            <a key={id} href={"/#" + id} onClick={() => setOpen(false)}>
              {label}
            </a>
          ))}
          <Link className="nav-cta" to="/samples">
            Explore work <ArrowUpRight size={15} />
          </Link>
        </div>
      </nav>
    </header>
  );
}
function HeroArt() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="glass-card">
        <span>RAVION / 01</span>
        <strong>
          Ideas that
          <br />
          move people.
        </strong>
        <i />
      </div>
      <div className="ring" />
    </div>
  );
}
function Home() {
  const { samples } = useSamples();
  return (
    <>
      <Splash />
      <Nav />
      <main>
        <section className="hero shell">
          <div className="eyebrow">
            <Sparkles size={15} /> Digital experiences, distinctly made
          </div>
          <h1>
            Build something
            <br />
            <em>worth feeling.</em>
          </h1>
          <p>
            Ravion turns ambitious ideas into elevated digital experiences,
            visual worlds and work that gets remembered.
          </p>
          <div className="hero-actions">
            <a className="button" href="#contact">
              Start a project <ArrowRight size={17} />
            </a>
            <Link className="text-link" to="/samples">
              View our work <ArrowUpRight size={16} />
            </Link>
          </div>
          <HeroArt />
        </section>
        <section id="about" className="intro shell">
          <p className="section-label">01 / ABOUT RAVION</p>
          <div>
            <h2>
              We make brands feel <em>impossible to ignore.</em>
            </h2>
            <p className="lead">
              Not a factory. Not a template. A small, sharp creative partner for
              businesses ready to show up with more intent.
            </p>
          </div>
        </section>
        <section id="services" className="services">
          <div className="shell">
            <p className="section-label">02 / WHAT WE DO</p>
            <div className="service-grid">
              {[
                [
                  "01",
                  "Web experiences",
                  "Websites, landing pages and link-in-bio spaces designed to convert attention into action.",
                ],
                [
                  "02",
                  "Visual direction",
                  "AI product imagery and visual systems that give your offering a point of view.",
                ],
                [
                  "03",
                  "Content that travels",
                  "Social content, campaign creative and motion that carries your brand further.",
                ],
              ].map(([n, t, d]) => (
                <article key={n} className="service">
                  <span>{n}</span>
                  <ArrowUpRight />
                  <h3>{t}</h3>
                  <p>{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="work" className="work shell">
          <div className="section-head">
            <div>
              <p className="section-label">03 / SELECTED WORK</p>
              <h2>
                Made to make a <em>mark.</em>
              </h2>
            </div>
            <Link to="/samples" className="text-link">
              All projects <ArrowRight size={16} />
            </Link>
          </div>
          <div className="work-grid">
            {samples.slice(0, 6).map((s, i) => (
              <SampleCard key={s.slug} sample={s} index={i} />
            ))}
          </div>
        </section>
        <section className="why">
          <div className="shell why-inner">
            <p className="section-label">04 / THE RAVION WAY</p>
            <div className="why-copy">
              <h2>
                Original, considered
                <br />
                and <em>built with care.</em>
              </h2>
              <p>
                We stay close to the idea from first thought to final detail.
                That means less noise, more clarity—and creative work with a
                real reason to exist.
              </p>
              <div className="metrics">
                <div>
                  <b>01</b>
                  <span>Clear creative direction</span>
                </div>
                <div>
                  <b>02</b>
                  <span>Made for real outcomes</span>
                </div>
                <div>
                  <b>03</b>
                  <span>Detail without the drama</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <ContactV2 />
        <FooterV2 />
      </main>
    </>
  );
}
function SampleCard({ sample, index = 0 }) {
  return (
    <Link
      to={"/samples/" + sample.slug}
      className={"sample-card sample-" + (index % 6)}
    >
      <div
        className="sample-visual"
        style={{ "--a": sample.colors?.[0] || "#c49a5d", "--b": sample.colors?.[1] || "#173a36", backgroundImage: sample.thumbnail ? `linear-gradient(#082d2a22,#082d2a22), url(${sample.thumbnail})` : undefined, backgroundSize: sample.thumbnail ? "cover" : undefined, backgroundPosition: "center" }}
      >
        <span className="sample-mark">R</span>
        <div className="product-shape" />
      </div>
      <div className="sample-info">
        <span>{sample.category}</span>
        <h3>{sample.title}</h3>
        <p>{sample.type}</p>
        <ArrowUpRight />
      </div>
    </Link>
  );
}
function Contact() {
  return (
    <section id="contact" className="contact shell">
      <div>
        <p className="section-label">05 / LET'S TALK</p>
        <h2>
          Have a good
          <br />
          <em>idea?</em>
        </h2>
        <p>Tell us what you are building. We will bring the curiosity.</p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.currentTarget.reset();
          alert(
            "Thank you — your inquiry is ready to send. Connect this form to your email service when you go live.",
          );
        }}
      >
        <label>
          Name
          <input required placeholder="Your name" />
        </label>
        <label>
          Email
          <input required type="email" placeholder="you@company.com" />
        </label>
        <label>
          What can we help with?
          <select defaultValue="">
            <option value="" disabled>
              Select a service
            </option>
            {categories.slice(1).map((c) => (
              <option key={c}>{c}</option>
            ))}
            <option>Other</option>
          </select>
        </label>
        <label>
          Tell us a little
          <textarea
            required
            placeholder="Your project, your goals, your timeline…"
            rows="3"
          />
        </label>
        <button className="button">
          Send inquiry <ArrowRight size={17} />
        </button>
      </form>
    </section>
  );
}
function Footer() {
  return (
    <footer>
      <div className="shell footer-inner">
        <Brand small />
        <p>© {new Date().getFullYear()} Ravion. Build. Create. Innovate.</p>
        <div>
          <a href="mailto:ruchitthakkar12@gmail.com">Email</a>
          <a href="https://www.instagram.com/ravion.ai/" target="_blank" rel="noreferrer">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}

function ContactV2() {
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const submit = async (event) => { event.preventDefault(); setSending(true); setNotice(""); try { await api("/api/inquiries", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) }); event.currentTarget.reset(); setNotice("Thank you — your inquiry has reached Ravion."); } catch (error) { setNotice(error.message); } finally { setSending(false); } };
  return <section id="contact" className="contact contact-v2 shell"><div><p className="section-label">05 / LET'S TALK</p><h2>Let’s make the<br/><em>next thing matter.</em></h2><p>Start with a thought, a challenge or a rough sketch. We will bring structure, energy and a point of view.</p><div className="contact-direct"><a href="https://wa.me/917990774831" target="_blank" rel="noreferrer"><MessageCircle size={17}/> WhatsApp +91 79907 74831</a><a href="mailto:ruchitthakkar12@gmail.com"><Mail size={17}/> ruchitthakkar12@gmail.com</a></div></div><form onSubmit={submit}><label>Name<input name="name" required placeholder="Your name" /></label><label>Email<input name="email" required type="email" placeholder="you@company.com" /></label><label>Phone / WhatsApp<input name="phone" type="tel" placeholder="Your number" /></label><label>What can we help with?<select name="service" defaultValue=""><option value="" disabled>Select a service</option>{categories.slice(1).map((c) => <option key={c}>{c}</option>)}<option>Other</option></select></label><label>Tell us a little<textarea name="message" required placeholder="Your project, goals and timeline…" rows="3" /></label><button className="button" disabled={sending}>{sending ? "Sending…" : "Send inquiry"} <ArrowRight size={17}/></button>{notice && <p className="form-message">{notice}</p>}</form></section>;
}
function FooterV2() {
  return <footer className="footer-v2"><div className="shell"><div className="footer-top"><Brand small/><h2>Build. Create.<br/><em>Innovate.</em></h2><a className="button" href="#contact">Start a project <ArrowRight size={17}/></a></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Ravion. All rights reserved.</p><div><a href="https://www.instagram.com/ravion.ai/" target="_blank" rel="noreferrer">@ravion.ai</a><a href="tel:+917990774831">+91 79907 74831</a><a href="mailto:ruchitthakkar12@gmail.com">Email us</a></div></div></div></footer>;
}
function Samples() {
  const [filter, setFilter] = useState("All");
  const { samples: all, loading, error } = useSamples();
  const shown =
    filter === "All" ? all : all.filter((s) => s.category === filter);
  return (
    <>
      <Nav />
      <main className="page shell">
        <div className="page-hero">
          <p className="section-label">RAVION / PORTFOLIO</p>
          <h1>
            Work with a <em>pulse.</em>
          </h1>
          <p>A growing collection of digital experiences and visual stories.</p>
        </div>
        <div className="filters">
          {categories.map((c) => (
            <button
              className={filter === c ? "active" : ""}
              onClick={() => setFilter(c)}
              key={c}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="work-grid all-work">
          {shown.map((s, i) => (
            <SampleCard key={s.slug} sample={s} index={i} />
          ))}
        </div>
        {!loading && !shown.length && <p className="empty-state">{error || "No published work yet. Your first published sample will appear here."}</p>}
      </main>
      <FooterV2 />
    </>
  );
}
function SampleDetail() {
  const { slug } = useParams();
  const { samples: all, loading } = useSamples();
  const s = all.find((x) => x.slug === slug);
  if (loading) return <><Nav /><main className="not-found shell"><p>Loading project…</p></main></>;
  if (!s)
    return (
      <>
        <Nav />
        <main className="not-found shell">
          <h1>
            That project is <em>elsewhere.</em>
          </h1>
          <Link className="button" to="/samples">
            Back to work
          </Link>
        </main>
      </>
    );
  return (
    <>
      <Nav />
      <main className="detail shell">
        <Link className="back" to="/samples">
          <ChevronLeft size={17} /> All work
        </Link>
        <div className="detail-title">
          <div>
            <p className="section-label">{s.category}</p>
            <h1>{s.title}</h1>
          </div>
          <p>{s.description}</p>
        </div>
        <div
          className="detail-art sample-visual"
          style={{ "--a": s.colors?.[0] || "#c49a5d", "--b": s.colors?.[1] || "#173a36", backgroundImage: s.thumbnail ? `linear-gradient(#082d2a22,#082d2a22), url(${s.thumbnail})` : undefined, backgroundSize: s.thumbnail ? "cover" : undefined, backgroundPosition: "center" }}
        >
          <span className="sample-mark">R</span>
          <div className="product-shape" />
        </div>
        <div className="detail-copy">
          <span>THE BRIEF</span>
          <p>
            {s.type}. Crafted to balance a strong concept with an approachable,
            memorable finish.
          </p>
          <span>MADE WITH INTENT</span>
          <p>
            Every element was considered as part of one consistent, expressive
            visual language.
          </p>
        </div>
        <div className="project-cta">
          <p>Interested in something like this?</p>
          <a href="/#contact" className="button">
            Get a quote <ArrowRight size={17} />
          </a>
        </div>
      </main>
      <FooterV2 />
    </>
  );
}
function Bio({ personal = false }) {
  const name = personal ? "Ruchit Thakkar" : "Ravion";
  const sub = personal
    ? "Creative designer & digital builder"
    : "Build · Create · Innovate";
  return (
    <main className={"bio " + (personal ? "personal" : "")}>
      <div className="bio-glow one" />
      <div className="bio-glow two" />
      <div className="bio-content">
        {personal ? (
          <div className="avatar">RT</div>
        ) : (
          <img className="bio-logo" src={logo} alt="Ravion" />
        )}
        <p className="bio-sub">{sub}</p>
        <h1>
          {personal ? "Making ideas feel alive." : "Made with imagination."}
        </h1>
        <div className="bio-links">
          <a href="/">
            Visit Ravion <ArrowUpRight />
          </a>
          <a href="/samples">
            View latest work <ArrowUpRight />
          </a>
          <a href="https://wa.me/917990774831" target="_blank" rel="noreferrer">
            <MessageCircle /> WhatsApp <ArrowUpRight />
          </a>
          <a href="https://www.instagram.com/ravion.ai/" target="_blank" rel="noreferrer">
            <Sparkles /> Instagram <ArrowUpRight />
          </a>
          <a href="mailto:ruchitthakkar12@gmail.com">
            <Mail /> Contact <ArrowUpRight />
          </a>
        </div>
        <p className="bio-foot">© Ravion / {name}</p>
      </div>
    </main>
  );
}
function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const login = (event) => {
    event.preventDefault();
    sessionStorage.setItem("ravion-admin", "demo-session");
    navigate("/admin");
  };
  return <main className="admin-login"><div className="login-card"><Brand /><p className="section-label">PRIVATE / ADMIN ACCESS</p><h1>Welcome <em>back.</em></h1><p>Sign in to manage your portfolio, samples and inquiries.</p><form onSubmit={login}><label>Email address<input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@ravion.in" /></label><label>Password<input type="password" required placeholder="••••••••" /></label><button className="button">Enter dashboard <ArrowRight size={17} /></button></form><small>Demo login: any valid email and password opens the local dashboard.</small></div></main>;
}
function Admin() {
  if (!sessionStorage.getItem("ravion-admin")) return <Navigate to="/admin/login" replace />;
  const [samples, setSamples] = useState(getSamples());
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[1]);
  const [status, setStatus] = useState("Published");
  const add = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const item = {
      slug: title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      title,
      category,
      status,
      type: "New Ravion project",
      colors: ["#c79a61", "#103733"],
      description: "A new project from the Ravion studio.",
    };
    const updated = [item, ...samples];
    setSamples(updated);
    saveSamples(updated);
    setTitle("");
  };
  const remove = (slug) => {
    const u = samples.filter((s) => s.slug !== slug);
    setSamples(u);
    saveSamples(u);
  };
  return (
    <main className="admin">
      <aside>
        <Brand />
        <p>PORTFOLIO CONTROL</p>
        <a className="active">Samples</a>
        <a>Categories</a>
        <a>Inquiries</a>
        <a>Settings</a>
        <Link to="/">
          View site <ArrowUpRight size={15} />
        </Link>
      </aside>
      <section className="admin-body">
        <p className="section-label">ADMIN / SAMPLES</p>
        <h1>
          Keep your work <em>moving.</em>
        </h1>
        <div className="admin-flow" aria-label="Sample publishing flow"><span className="flow-current">1. Add sample</span><ArrowRight size={15}/><span>2. Upload assets</span><ArrowRight size={15}/><span>3. Save metadata</span><ArrowRight size={15}/><span>4. Publish</span></div>
        <div className="admin-layout">
          <form className="add-sample" onSubmit={add}>
            <h2>Add new sample</h2>
            <label>
              Project title
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. New product launch"
              />
            </label>
            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categories.slice(1).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Published</option>
                <option>Draft</option>
              </select>
            </label>
            <button className="button">
              Save sample <ArrowRight size={17} />
            </button>
            <small>
              Demo storage is local to this browser. Connect ImageKit and
              MongoDB for production.
            </small>
          </form>
          <div className="sample-list">
            <h2>
              All samples <span>{samples.length}</span>
            </h2>
            {samples.map((s) => (
              <div className="admin-row" key={s.slug}>
                <div className="mini" style={{ background: s.colors?.[0] }} />
                <div>
                  <b>{s.title}</b>
                  <span>
                    {s.category} · {s.status || "Published"}
                  </span>
                </div>
                <button onClick={() => remove(s.slug)}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
function AdminLoginV2() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const login = async (event) => { event.preventDefault(); setBusy(true); setError(""); try { const { token } = await api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); sessionStorage.setItem("ravion-admin-token", token); navigate("/admin"); } catch (err) { setError(err.message); } finally { setBusy(false); } };
  return <main className="admin-login"><div className="login-card"><Brand/><p className="section-label">PRIVATE / ADMIN ACCESS</p><h1>Welcome <em>back.</em></h1><p>Sign in to manage your portfolio, samples and inquiries.</p><form onSubmit={login}><label>Email address<input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@ravion.in"/></label><label>Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" required placeholder="Your password"/></label><button className="button" disabled={busy}>{busy ? "Checking…" : "Enter dashboard"} <ArrowRight size={17}/></button></form>{error && <p className="form-message">{error}</p>}<small>Credentials are securely verified by the server using your `.env` configuration.</small></div></main>;
}
function AdminV2() {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("ravion-admin-token");
  const { samples, loading, error, refresh } = useSamples(true);
  const [title, setTitle] = useState(""); const [category, setCategory] = useState(categories[1]); const [description, setDescription] = useState(""); const [status, setStatus] = useState("Published"); const [files, setFiles] = useState([]); const [notice, setNotice] = useState(""); const [saving, setSaving] = useState(false);
  if (!token) return <Navigate to="/admin/login" replace />;
  const add = async (event) => { event.preventDefault(); setSaving(true); setNotice(""); try { let images = []; if (files.length) { const form = new FormData(); files.forEach(file => form.append("images", file)); ({ images } = await api("/api/uploads", { method: "POST", body: form })); } await api("/api/admin/samples", { method: "POST", body: JSON.stringify({ title, category, description, status, images }) }); setTitle(""); setDescription(""); setFiles([]); event.currentTarget.reset(); await refresh(); setNotice(status === "Published" ? "Published — it is now visible on the website." : "Saved as a draft."); } catch (err) { setNotice(err.message); } finally { setSaving(false); } };
  const remove = async (id) => { if (!window.confirm("Delete this sample?")) return; try { await api(`/api/admin/samples/${id}`, { method: "DELETE" }); refresh(); } catch (err) { setNotice(err.message); } };
  const logout = () => { sessionStorage.removeItem("ravion-admin-token"); navigate("/admin/login"); };
  return <main className="admin"><aside><Brand/><p>PORTFOLIO CONTROL</p><a className="active">Samples</a><a>Categories</a><a>Inquiries</a><a>Settings</a><button className="admin-logout" onClick={logout}>Sign out</button><Link to="/">View site <ArrowUpRight size={15}/></Link></aside><section className="admin-body"><p className="section-label">ADMIN / SAMPLES</p><h1>Keep your work <em>moving.</em></h1><div className="admin-flow"><span className="flow-current">1. Add sample</span><ArrowRight size={15}/><span>2. Upload to ImageKit</span><ArrowRight size={15}/><span>3. Save to MongoDB</span><ArrowRight size={15}/><span>4. Publish</span></div><div className="admin-layout"><form className="add-sample" onSubmit={add}><h2>Add new sample</h2><label>Project title<input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. New product launch"/></label><label>Category<select value={category} onChange={e => setCategory(e.target.value)}>{categories.slice(1).map(c => <option key={c}>{c}</option>)}</select></label><label>Description<textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="What makes this project distinct?"/></label><label>Images <small>Uploads directly to ImageKit</small><input type="file" accept="image/*" multiple onChange={e => setFiles([...e.target.files])}/></label><label>Status<select value={status} onChange={e => setStatus(e.target.value)}><option>Published</option><option>Draft</option></select></label><button className="button" disabled={saving}>{saving ? "Uploading…" : "Save sample"} <ArrowRight size={17}/></button>{notice && <p className="form-message">{notice}</p>}</form><div className="sample-list"><h2>All samples <span>{samples.length}</span></h2>{loading && <p>Loading samples…</p>}{error && <p className="form-message">{error}</p>}{samples.map(s => <div className="admin-row" key={s._id}><div className="mini" style={{ backgroundImage: s.thumbnail ? `url(${s.thumbnail})` : undefined, backgroundColor: "#c79a61", backgroundSize: "cover" }}/><div><b>{s.title}</b><span>{s.category} · {s.status}</span></div><button onClick={() => remove(s._id)}>Delete</button></div>)}</div></div></section></main>;
}
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/samples" element={<Samples />} />
      <Route path="/samples/:slug" element={<SampleDetail />} />
      <Route path="/bio" element={<Bio />} />
      <Route path="/ruchit" element={<Bio personal />} />
      <Route path="/admin/login" element={<AdminLoginV2 />} />
      <Route path="/admin" element={<AdminV2 />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
