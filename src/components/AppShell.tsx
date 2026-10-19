import {
  Activity, ChevronDown, CircleHelp, Command, FilePlus2,
  Menu, Sparkles, X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/logs", label: "Flow monitoring", icon: Activity, end: true },
  { to: "/create", label: "Create incident", icon: FilePlus2, end: true },
  { to: "/insights", label: "Analysis insights", icon: Sparkles },
];

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${menuOpen ? "is-open" : ""}`} onClick={() => setMenuOpen(false)} />
      <aside className={`sidebar ${menuOpen ? "mobile-open" : ""}`}>
        <div className="brand"><div className="brand-mark"><Activity size={18} strokeWidth={2.4} /></div><span>signal<span className="brand-period">.</span></span><button className="mobile-close icon-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="workspace-switcher"><div className="workspace-avatar">N</div><div className="workspace-text"><strong>Northstar Cloud</strong><span>Production workspace</span></div><ChevronDown size={15} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-navigation">{navigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setMenuOpen(false)} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
            <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
          </NavLink>
        ))}</nav>
        <div className="sidebar-spacer" />
        <div className="pipeline-health">
          <div className="health-heading"><span className="health-indicator" />Pipeline overview</div>
          <p>Follow event processing from intake through analysis and response.</p>
          <div className="pipeline-stages"><span>API</span><i /><span>Kafka</span><i /><span>AI</span><i /><span>HTTP</span></div>
        </div>
        <button className="help-link"><CircleHelp size={16} />Help &amp; documentation</button>
        <div className="sidebar-user"><div className="user-avatar">AM</div><div className="user-meta"><strong>Alex Morgan</strong><span>Platform engineer</span></div><ChevronDown size={15} /></div>
      </aside>
      <div className="main-column">
        <header className="topbar">
          <button className="mobile-menu icon-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Incident intelligence</strong></div>
          <div className="topbar-actions">
            <span className="connection-badge connection-live"><span />LIVE API</span>
            <button className="keyboard-hint" aria-label="Keyboard shortcuts"><Command size={13} /><span>K</span></button>
            <div className="top-avatar">AM</div>
          </div>
        </header>
        <main className="main-content"><Outlet /></main>
        <footer className="app-footer"><span><span className="footer-status" />Backend API</span><span>Signal <span className="footer-divider">·</span> Incident intelligence</span></footer>
      </div>
    </div>
  );
}
