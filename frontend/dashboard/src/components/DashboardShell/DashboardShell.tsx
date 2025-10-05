import React, { Suspense, useState } from "react";
import Sidebar from "./Sidebar";
import { useTranslation } from "react-i18next";

// Lazy load components (your existing imports remain the same)
const Atlas = React.lazy(() => import("../Atlas/AtlasMap"));
const DSS = React.lazy(() => import("../DSS/DSSPanel"));
const Documents = React.lazy(() => import("../Doc-Management/DocManagementPanel.tsx"));
const ClaimProcess = React.lazy(() => import("../ClaimProcessTracker/ClaimProcessTracker.tsx"));
const AnalyticsDashboard = React.lazy(() => import("../AnalyticsDashboard/AnalyticsDashboard.tsx"));

export default function DashboardShell() {
  const [active, setActive] = useState<"atlas" | "dss" | "docs" | "claims" | "analytics">(() => {
    const saved = sessionStorage.getItem('activePanel');
    if (saved && ['atlas', 'dss', 'docs', 'claims', 'analytics'].includes(saved)) {
      return saved as "atlas" | "dss" | "docs" | "claims" | "analytics";
    }
    return 'claims';
  });

  // Add sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { t, i18n } = useTranslation();
  const [notifications] = useState(3);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getActiveModuleName = () => {
    switch (active) {
      case "atlas":
        return t("atlas");
      case "dss":
        return t("dss");
      case "docs":
        return t("documents");
      case "claims":
        return t("claim_tracker");
      case "analytics":
        return t("analytics_dashboard");
      default:
        return t("module");
    }
  };

  const getModuleIcon = () => {
    const icons = {
      claims: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      atlas: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
            stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-70" />
        </svg>
      ),
      dss: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      docs: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      ),
      analytics: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
          <path d="M18 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    };
    return icons[active] || icons.claims;
  };

  // Mock recent activities
  const recentActivities = [
    { id: 1, action: t("recent_activities.claim_approved"), village: "Sundarpur", time: t("time_ago.minutes", { count: 2 }) },
    { id: 2, action: t("recent_activities.document_processed"), village: "Bhilwara", time: t("time_ago.minutes", { count: 5 }) },
    { id: 3, action: t("recent_activities.new_recommendation"), village: "Koraput", time: t("time_ago.minutes", { count: 10 }) }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4 bg-gradient-to-br from-forest-00 to-forest-200">
          <div className="flex items-center justify-between">
            {/* Left Section - Branding */}
            <div className="flex items-center gap-4">
              {/* Ministry Logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-forest-700 to-forest-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-gray-900">{t("app_title")}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-600 font-medium">{t("mota_fra_platform")}</span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{t("app_subtitle")}</span>
                  </div>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="hidden lg:block h-8 w-px bg-gray-300"></div>

              {/* Breadcrumb */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-forest-50 rounded-lg border border-forest-200">
                  <div className="text-forest-600">
                    {getModuleIcon()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-forest-800">{getActiveModuleName()}</div>
                    <div className="text-xs text-forest-600">{t("active_module")}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Section - Quick Stats */}
            <div className="hidden xl:flex items-center gap-3">
              {/* Active Claims */}
              <div className="flex items-center gap-2 px-3 py-2 bg-forest-50 rounded-lg border border-forest-200">
                <div className="text-left">
                  <div className="text-sm font-semibold text-forest-900">1,247</div>
                  <div className="text-xs text-forest-600">{t("active_claims")}</div>
                </div>
              </div>

              {/* Processing Rate */}
              <div className="flex items-center gap-2 px-3 py-2 bg-forest-50 rounded-lg border border-forest-200">
                <div className="text-left">
                  <div className="text-sm font-semibold text-forest-900">89%</div>
                  <div className="text-xs text-forest-600">{t("processing_rate")}</div>
                </div>
              </div>

              {/* Focus States */}
              <div className="flex items-center gap-2 px-3 py-2 bg-forest-50 rounded-lg border border-forest-200">
                <div className="text-left">
                  <div className="text-sm font-semibold text-forest-900">4</div>
                  <div className="text-xs text-forest-600">{t("focus_states")}</div>
                </div>
              </div>
            </div>

            {/* Right Section - User Controls */}
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle Button for Desktop */}
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors shadow-sm"
                title={isSidebarCollapsed ? t("expand_sidebar") : t("collapse_sidebar")}
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${isSidebarCollapsed ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              {/* Language Selector */}
              <div className="hidden sm:block">
                <select
                  className="select select-bordered select-sm bg-white border-gray-300 text-gray-700 focus:border-forest-500 focus:ring-forest-500"
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  value={i18n.language}
                >
                  <option value="en">🇺🇸 English</option>
                  <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                  <option value="bn">🇧🇩 বাংলা (Bengali)</option>
                  <option value="or">🇮🇳 ଓଡ଼ିଆ (Odia)</option>
                  <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                </select>
              </div>

              {/* Notifications */}
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm relative">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 0-6 6v2.25l-2 2V15h16.5v-.75l-2-2V9.75a6 6 0 0 0-6-6z" />
                  </svg>
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications}
                    </span>
                  )}
                </div>
                <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-80 mt-3 border border-gray-200">
                  <div className="p-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">{t("recent_activities.title")}</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{activity.village}</p>
                          </div>
                          <span className="text-xs text-gray-400">{activity.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <button className="btn btn-sm btn-ghost w-full text-forest-600 hover:text-forest-700">
                      {t("view_all_activities")}
                    </button>
                  </div>
                </div>
              </div>

              {/* User Profile */}
              <div className="dropdown dropdown-end">
                <div
                  tabIndex={0}
                  role="button"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer bg-white"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-600 to-forest-700 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-semibold text-white">AD</span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900">{t("admin_user")}</div>
                    <div className="text-xs text-gray-500">{t("mota_official")}</div>
                  </div>
                  <svg className={`w-4 h-4 text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-white rounded-box w-56 mt-2 border border-gray-200">
                  <li className="border-b border-gray-100">
                    <div className="px-3 py-2">
                      <div className="text-sm font-medium text-gray-900">{t("admin_user")}</div>
                      <div className="text-xs text-gray-500">admin@mota.gov.in</div>
                    </div>
                  </li>
                  <li><a className="text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>{t("profile")}</a></li>
                  <li><a className="text-gray-700 hover:bg-gray-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>{t("settings")}</a></li>
                  <li className="border-t border-gray-100 mt-1"><a className="text-red-600 hover:bg-red-50"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>{t("logout")}</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Breadcrumb */}
          <div className="lg:hidden mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{t("dashboard")}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-forest-700">{getActiveModuleName()}</span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-700 px-6 py-2 border-t border-forest-600">
          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span>{t("system_operational")}</span>
              </div>
              <span className="text-forest-300">•</span>
              <span>{t("last_sync")}: {new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-forest-300">{t("focus_states")}:</span>
              <div className="flex gap-1">
                {['MP', 'TR', 'OD', 'TS'].map((state) => (
                  <span key={state} className="px-2 py-0.5 bg-forest-600 rounded text-xs border border-forest-500">
                    {state}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex h-[calc(100vh-112px)]">
        <Sidebar
          active={active}
          setActive={setActive}
          collapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto bg-white transition-all duration-300 
        }`}>
          <Suspense fallback={
            <div className="flex justify-center items-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-forest-200 border-t-forest-600 rounded-full animate-spin mb-4"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-forest-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <p className="text-gray-600 mt-4 font-medium">{t("loading", { module: getActiveModuleName() })}</p>
                <p className="text-sm text-gray-400 mt-2">{t("fra_platform_mota")}</p>
              </div>
            </div>
          }>
            {active === "atlas" && <Atlas />}
            {active === "dss" && <DSS />}
            {active === "docs" && <Documents />}
            {active === "claims" && <ClaimProcess />}
            {active === "analytics" && <AnalyticsDashboard />}
          </Suspense>
        </main>
      </div>
    </div>
  );
}