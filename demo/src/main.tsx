import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { FullStackWizard } from "../../src/FullStackWizard";
import { PoolConnectionWizard } from "../../src/PoolConnectionWizard";
import { ThemeProvider, useTheme } from "../../src/hooks";
import { Layers, Cloud, ArrowRight, ChevronLeft } from "lucide-react";
import "./style.css";

function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle fixed top-4 right-4 z-50"
      aria-label="Toggle theme"
    >
      <svg className="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"></circle>
        <path d="M12 2v2"></path>
        <path d="M12 20v2"></path>
        <path d="m4.93 4.93 1.41 1.41"></path>
        <path d="m17.66 17.66 1.41 1.41"></path>
        <path d="M2 12h2"></path>
        <path d="M20 12h2"></path>
        <path d="m6.34 17.66-1.41 1.41"></path>
        <path d="m19.07 4.93-1.41 1.41"></path>
      </svg>
      <svg className="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
      </svg>
    </button>
  );
}

function DemoApp() {
  const [selectedWizard, setSelectedWizard] = useState<'fullstack' | 'pool' | null>(null);

  if (selectedWizard === 'fullstack') {
    return (
      <div className="demo-root">
        <div className="w-full max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedWizard(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-3"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to selection</span>
          </button>
          <FullStackWizard />
        </div>
      </div>
    );
  }

  if (selectedWizard === 'pool') {
    return (
      <div className="demo-root">
        <div className="w-full max-w-3xl mx-auto">
          <button
            onClick={() => setSelectedWizard(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-3"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to selection</span>
          </button>
          <PoolConnectionWizard />
        </div>
      </div>
    );
  }

  return (
    <div className="demo-root">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-4 text-foreground">
            SRI Deployment Wizard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a wizard to get started with Stratum V2 deployment
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button
            onClick={() => setSelectedWizard('fullstack')}
            className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all hover:scale-[1.02] text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Full Stack Deployment</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Deploy an entire mining pool locally with Job Declarator. This requires a Bitcoin Core node and is for advanced users.
            </p>
            <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          <button
            onClick={() => setSelectedWizard('pool')}
            className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all hover:scale-[1.02] text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Pool Connection</h2>
            </div>
            <p className="text-muted-foreground mb-6">
              Connect your miners to Stratum V2 pools through SRI proxies. Choose whether to use pool templates or construct your own.
            </p>
            <div className="flex items-center text-primary font-semibold group-hover:gap-3 transition-all">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ThemeToggle />
      <DemoApp />
    </ThemeProvider>
  </React.StrictMode>
);
