import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Activity, 
  ShieldCheck, 
  Database, 
  CreditCard, 
  Trophy, 
  Heart, 
  Layout, 
  Smartphone, 
  Play, 
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { QAService, TestResult } from "../services/QAService";

const QADashboard = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const qaService = QAService.getInstance();

  const runTests = () => {
    setIsRunning(true);
    // Simulate async test run
    setTimeout(() => {
      const newResults = qaService.runAllTests();
      setResults(newResults);
      setIsRunning(false);
    }, 1500);
  };

  useEffect(() => {
    runTests();
  }, []);

  const categories = [
    { id: "all", name: "All Tests", icon: Activity },
    { id: "AUTHENTICATION", name: "Auth", icon: ShieldCheck },
    { id: "SUBSCRIPTION", name: "Subscription", icon: CreditCard },
    { id: "SCORE SYSTEM", name: "Score", icon: Trophy },
    { id: "DRAW SYSTEM", name: "Draw", icon: Play },
    { id: "PRIZE SYSTEM", name: "Prize", icon: Trophy },
    { id: "CHARITY SYSTEM", name: "Charity", icon: Heart },
    { id: "RESPONSIVENESS", name: "Mobile", icon: Smartphone },
  ];

  const filteredResults = filter === "all" 
    ? results 
    : results.filter(r => r.category === filter);

  const stats = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    pending: results.filter(r => r.status === 'pending').length,
  };

  return (
    <div className="min-h-screen bg-surface p-6 md:p-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <ShieldCheck className="w-4 h-4" />
            System Health & QA
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-black italic tracking-tighter text-on-surface uppercase">
            QA Validation <span className="text-primary">Dashboard</span>
          </h1>
          <p className="text-on-surface-variant max-w-2xl">
            Automated logic validation and manual QA checklists to ensure platform reliability and PRD compliance.
          </p>
        </div>
        <button 
          onClick={runTests}
          disabled={isRunning}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-full font-headline font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {isRunning ? "Running Tests..." : "Run All Tests"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Tests", val: stats.total, icon: Activity, color: "text-on-surface" },
          { label: "Passed", val: stats.passed, icon: CheckCircle2, color: "text-secondary" },
          { label: "Failed", val: stats.failed, icon: XCircle, color: "text-error" },
          { label: "Pending", val: stats.pending, icon: AlertCircle, color: "text-on-surface-variant" },
        ].map((stat, i) => (
          <div key={i} className="p-6 rounded-3xl bg-surface-variant/10 border border-outline-variant/10 space-y-2">
            <div className="flex items-center justify-between">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div className={`text-2xl font-black ${stat.color}`}>{stat.val}</div>
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-3xl bg-surface-variant/10 border border-outline-variant/10 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Filter by Category</div>
            <div className="space-y-1">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${
                    filter === cat.id 
                    ? "bg-primary text-on-primary shadow-lg shadow-primary/20" 
                    : "text-on-surface-variant hover:bg-surface-variant/20"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Manual QA Checklist */}
          <div className="p-6 rounded-3xl bg-surface-variant/10 border border-outline-variant/10 space-y-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Manual Checklists</div>
            <div className="space-y-3">
              {[
                "Mobile Responsiveness",
                "Razorpay Sandbox Flow",
                "Email Delivery (SMTP)",
                "Admin Score Overrides",
                "Charity Image Uploads"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-variant/10 transition-colors group cursor-pointer">
                  <div className="w-4 h-4 rounded border-2 border-outline-variant group-hover:border-primary transition-colors" />
                  <div className="text-xs font-bold text-on-surface-variant group-hover:text-on-surface transition-colors">{item}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Results List */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Showing {filteredResults.length} Test Results
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <div className="text-[10px] font-black text-secondary uppercase tracking-widest">System Live</div>
            </div>
          </div>

          {filteredResults.length === 0 ? (
            <div className="p-20 text-center space-y-4 bg-surface-variant/5 rounded-[2.5rem] border-2 border-dashed border-outline-variant/20">
              <div className="w-16 h-16 bg-surface-variant/10 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-on-surface-variant/30" />
              </div>
              <div className="text-on-surface-variant font-bold italic">No tests found for this category.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <motion.div
                  key={result.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-3xl border-2 transition-all ${
                    result.status === 'passed' 
                    ? "bg-secondary/5 border-secondary/20" 
                    : result.status === 'failed'
                    ? "bg-error/5 border-error/20"
                    : "bg-surface-variant/5 border-outline-variant/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        result.status === 'passed' ? "bg-secondary/20 text-secondary" : "bg-error/20 text-error"
                      }`}>
                        {result.status === 'passed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline font-black italic uppercase tracking-tight text-on-surface">
                            {result.name}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-surface-variant/20 text-[8px] font-black uppercase tracking-widest text-on-surface-variant">
                            {result.category}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">{result.message}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setExpandedId(expandedId === result.id ? null : result.id)}
                      className="p-2 hover:bg-surface-variant/20 rounded-full transition-colors"
                    >
                      {expandedId === result.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {expandedId === result.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-6 pt-6 border-t border-outline-variant/10 grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                      <div className="space-y-2">
                        <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Expected Result</div>
                        <div className="p-4 rounded-2xl bg-surface-variant/10 font-mono text-[10px] text-on-surface break-all">
                          {typeof result.expected === 'object' ? JSON.stringify(result.expected, null, 2) : String(result.expected)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[8px] font-black uppercase tracking-widest text-on-surface-variant">Actual Result</div>
                        <div className={`p-4 rounded-2xl font-mono text-[10px] break-all ${
                          result.status === 'passed' ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"
                        }`}>
                          {typeof result.actual === 'object' ? JSON.stringify(result.actual, null, 2) : String(result.actual)}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-8 rounded-[2.5rem] bg-on-surface text-surface flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Database className="w-6 h-6 text-on-primary" />
          </div>
          <div>
            <div className="text-lg font-headline font-black italic uppercase tracking-tighter">Data Integrity Verified</div>
            <div className="text-xs text-surface/60">Last full system audit: Today, {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 rounded-full border border-surface/20 text-[10px] font-black uppercase tracking-widest hover:bg-surface/10 transition-all">
            Export Report
          </button>
          <button className="px-6 py-3 rounded-full bg-primary text-on-primary text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
            Schedule Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QADashboard;
