import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Sidebar({
  active,
  setActive,
  collapsed = false,
  onToggleCollapse
}: {
  active: "atlas" | "dss" | "docs" | "claims" | "analytics";
  setActive: (a: "atlas" | "dss" | "docs" | "claims" | "analytics") => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [_isCollapseHovered, setIsCollapseHovered] = useState(false);

  // Save active panel when it changes
  useEffect(() => {
    sessionStorage.setItem('activePanel', active);
  }, [active]);

  // Load saved panel on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('activePanel');
    if (saved && ['atlas', 'dss', 'docs', 'claims', 'analytics'].includes(saved)) {
      setActive(saved as "atlas" | "dss" | "docs" | "claims" | "analytics");
    }
  }, [setActive]);

  // Custom SVG Icons with tribal-inspired design
  const CustomIcons = {
    claims: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* Tribal pattern element */}
        <path d="M19 15l-2-2 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"
          className="opacity-60" />
      </svg>
    ),
    atlas: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"
          stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 12h20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40" />
        <path d="M12 2v20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40" />
        <circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-70" />
        {/* Geographic markers */}
        <path d="M16 8l2-2-2-2" stroke="currentColor" strokeWidth="1" className="opacity-60" />
        <path d="M8 16l-2 2 2 2" stroke="currentColor" strokeWidth="1" className="opacity-60" />
      </svg>
    ),
    dss: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 4.21l4.5 2.6 4.5-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M7.5 19.79V14.6L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 12l-4.5 2.6v5.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* Decision tree elements */}
        <path d="M9 16l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="opacity-70" />
      </svg>
    ),
    docs: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* AI/Processing element */}
        <path d="M18 14l1.5 1.5L18 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
          className="opacity-70" />
        <circle cx="19" cy="12" r="0.5" fill="currentColor" className="opacity-70" />
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        {/* Tribal pattern background */}
        <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="0.5" className="opacity-20" />
        <path d="M21 9H3" stroke="currentColor" strokeWidth="0.3" className="opacity-20" />
        <path d="M21 15H3" stroke="currentColor" strokeWidth="0.3" className="opacity-20" />
      </svg>
    )
  };

  const menuItems = [
    {
      id: "claims" as const,
      name: t("claim_tracker"),
      description: t("fra_workflow"),
      icon: CustomIcons.claims,
      color: "text-amber-700",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      activeBg: "bg-amber-500",
      activeColor: "text-amber-600"
    },
    {
      id: "atlas" as const,
      name: t("interactive_atlas"),
      description: t("geospatial_analysis"),
      icon: CustomIcons.atlas,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      activeBg: "bg-emerald-600",
      activeColor: "text-emerald-600"
    },
    {
      id: "dss" as const,
      name: t("dss"),
      description: t("decision_support"),
      icon: CustomIcons.dss,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activeBg: "bg-blue-600",
      activeColor: "text-blue-600"
    },
    {
      id: "docs" as const,
      name: t("documents"),
      description: t("ocr_processing"),
      icon: CustomIcons.docs,
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      activeBg: "bg-purple-600",
      activeColor: "text-purple-600"
    },
    {
      id: "analytics" as const,
      name: t("analytics_dashboard"),
      description: t("fra_implementation_insights"),
      icon: CustomIcons.analytics,
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      activeBg: "bg-indigo-600",
      activeColor: "text-indigo-600"
    }
  ];

  // Tribal pattern background component
  const TribalPattern = () => (
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
      <svg width="100%" height="100%" className="text-forest-900">
        <pattern id="tribal-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q10 15 20 20 T40 20" stroke="currentColor" fill="none" strokeWidth="0.5" />
          <path d="M20 0 Q15 10 20 20 T20 40" stroke="currentColor" fill="none" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#tribal-pattern)" />
      </svg>
    </div>
  );

  // Collapse/Expand Button Component
  const CollapseButton = () => (
    <button
      onClick={onToggleCollapse}
      onMouseEnter={() => setIsCollapseHovered(true)}
      onMouseLeave={() => setIsCollapseHovered(false)}
      className={`
        flex items-center justify-center transition-all duration-300 group
        ${collapsed
          ? 'w-12 h-12 mx-auto mb-4 rounded-xl border border-forest-600/30 bg-forest-700/50 hover:bg-forest-600/50 hover:border-forest-500/50'
          : ''
        }
      `}
    >
      <svg
        className={`transition-all duration-300 ${collapsed
            ? 'w-5 h-5 text-forest-300 group-hover:text-forest-200'
            : 'w-5 h-5 text-forest-400 group-hover:text-forest-300'
          } ${collapsed ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
      </svg>
    </button>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        ${collapsed ? 'w-20 lg:w-20' : 'w-80 lg:w-80 xl:w-96'}
        bg-gradient-to-b from-forest-900 to-forest-800
        border-r border-forest-700 shadow-2xl lg:shadow-xl
        transform transition-all duration-300 ease-in-out
        ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        relative overflow-hidden
      `}>
        {/* Tribal Pattern Background */}
        <TribalPattern />

        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-forest-800/50 to-transparent pointer-events-none" />

        <div className="flex flex-col h-full relative z-10">
          {/* Sidebar Header with Official Branding */}
          <div className={`border-b border-forest-700/50 bg-forest-800/30 backdrop-blur-sm ${collapsed ? 'p-4' : 'p-6'
            }`}>
            <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
              {!collapsed ? (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-white truncate">{t("navigation")}</h2>
                      {/* Collapse Button positioned appropriately */}
                      <div className={collapsed ? 'px-3 mt-4' : 'px-4 mt-6'}>
                        <CollapseButton />
                      </div>
                    </div>
                    <p className="text-xs text-forest-200">{t("select_module")}</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  {/* Ministry Logo - Collapsed */}

                  <div className="w-12 h-12 bg-gradient-to-br from-forest-700 to-forest-800 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  </svg>
                </div>
                  {/* Active indicator dot */}
                  {/* Collapse Button positioned appropriately */}
                  <div className={collapsed ? 'px-3 mt-4' : 'px-4 mt-6'}>
                    <CollapseButton />
                  </div>
                </div>
              )}
            </div>

            {/* Ministry Badge - Expanded */}
            {!collapsed && (
              <div className="mt-4 flex items-center justify-between px-3 py-2 bg-forest-700/50 rounded-lg border border-forest-600/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium text-forest-100">MoTA</span>
                </div>
                <span className="text-xs text-forest-300">FRA Platform</span>
              </div>
            )}
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className={collapsed ? 'p-3' : 'p-4'}>
              {/* Section Header - Expanded */}
              {!collapsed && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-forest-200 uppercase tracking-wider">
                    {t("main_modules")}
                  </h3>
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${delay}s` }}
                      ></div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Items */}
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const isActive = active === item.id;
                  const isHoveredItem = isHovered === item.id;

                  return (
                    <li key={item.id}>
                      <button
                        className={`
                          w-full text-left transition-all duration-300 group relative overflow-hidden
                          ${collapsed
                            ? 'p-3 rounded-xl justify-center'
                            : 'p-4 rounded-xl'
                          }
                          ${isActive
                            ? collapsed
                              ? 'bg-forest-700 border border-forest-500 shadow-lg shadow-forest-900/30'
                              : 'bg-forest-300 text-forest-900 shadow-lg transform scale-[1.02]'
                            : 'bg-forest-500/30 text-forest-100 border border-forest-600/30 hover:bg-forest-700/50 hover:border-forest-500/50 hover:transform hover:scale-[1.01]'
                          }
                        `}
                        onClick={() => setActive(item.id)}
                        onMouseEnter={() => setIsHovered(item.id)}
                        onMouseLeave={() => setIsHovered(null)}
                      >
                        {/* Active state indicator bar - Collapsed */}
                        {collapsed && isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-r-full shadow-lg shadow-amber-500/25"></div>
                        )}

                        {/* Hover effect */}
                        {isHoveredItem && !isActive && (
                          <div className="absolute inset-0 bg-forest-600/20 animate-pulse"></div>
                        )}

                        <div className={`flex items-center relative z-10 ${collapsed ? 'justify-center' : 'gap-4'
                          }`}>
                          <div className={`
                            rounded-lg transition-all duration-300 shadow-sm flex items-center justify-center
                            ${collapsed ? 'p-2' : 'p-2.5'}
                            ${isActive
                              ? collapsed
                                ? `${item.activeColor} bg-white/90 shadow-md`
                                : `${item.bgColor} ${item.color} shadow-md`
                              : 'bg-forest-600/50 text-forest-200 group-hover:bg-forest-500/50 group-hover:text-forest-100'
                            }
                          `}>
                            {item.icon}
                          </div>

                          {/* Text Content - Expanded */}
                          {!collapsed && (
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-sm truncate transition-colors ${isActive ? "text-forest-900" : "text-forest-100"
                                }`}>
                                {item.name}
                              </div>
                              <div className={`text-xs mt-1 transition-colors ${isActive ? "text-forest-700" : "text-forest-300"
                                }`}>
                                {item.description}
                              </div>
                            </div>
                          )}

                          {/* Active indicator - Expanded */}
                          {!collapsed && isActive && (
                            <div className="w-2 h-2 bg-forest-900 rounded-full opacity-60"></div>
                          )}
                        </div>

                        {/* Enhanced Tooltip for collapsed state */}
                        {collapsed && isHoveredItem && (
                          <div className="absolute left-full ml-3 px-3 py-2 bg-forest-800 text-forest-100 text-sm rounded-lg shadow-xl border border-forest-700 z-50 whitespace-nowrap backdrop-blur-sm">
                            <div className="font-semibold flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${item.activeColor}`}></div>
                              {item.name}
                            </div>
                            <div className="text-xs text-forest-300 mt-1 max-w-[200px]">
                              {item.description}
                            </div>
                            {/* Tooltip arrow */}
                            <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-forest-800 rotate-45 border-l border-t border-forest-700"></div>
                          </div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>



            {/* System Status - Expanded Only */}
            {!collapsed && (
              <div className="p-4 border-t border-forest-700/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-forest-200 uppercase tracking-wider">
                    {t("system_status")}
                  </h3>
                  <div className="flex gap-1">
                    {[0, 0.2, 0.4].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"
                        style={{ animationDelay: `${delay}s` }}
                      ></div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-forest-100">{t("all_systems")}</span>
                    </div>
                    <span className="text-xs text-emerald-300 font-semibold bg-emerald-500/20 px-2 py-1 rounded">
                      {t("operational")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      t("analytics_services"),
                      t("dss_engine"),
                      t("map_services"),
                      t("ocr_processing_status")
                    ].map((service) => (
                      <div key={service} className="flex items-center gap-2 p-2 bg-forest-700/20 rounded border border-forest-600/30">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></div>
                        <span className="text-forest-300 truncate">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className={`border-t border-forest-700/30 bg-forest-800/40 backdrop-blur-sm ${collapsed ? 'p-3' : 'p-4'
            }`}>
            {!collapsed ? (
              <>
                <div className="flex items-center justify-between text-xs text-forest-400 mb-2">
                  <span className="font-medium">{t("fra_platform_version")}</span>
                  <span>v2.1.0</span>
                </div>
                <div className="flex items-center justify-between text-xs text-forest-500 mb-3">
                  <span>Ministry of Tribal Affairs</span>
                  <span>© 2025</span>
                </div>

                {/* Geographic Focus Badge */}
                <div className="flex flex-wrap gap-1">
                  {['MP', 'TR', 'OD', 'TS'].map((state) => (
                    <div key={state} className="px-2 py-1 bg-forest-700/30 rounded text-xs text-forest-300 border border-forest-600/30">
                      {state}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                {/* Version badge */}
                <div className="px-2 py-1 bg-forest-700/50 rounded text-xs text-forest-400 font-medium border border-forest-600/30">
                  v2.1.0
                </div>

                {/* Ministry logo mini */}
                <div className="w-13 h-9 rounded-lg bg-gradient-to-br from-forest-700 to-forest-800 flex items-center justify-center shadow-sm border border-forest-600/50">
                  <span className="text-xs font-semibold text-forest-300">M</span>
                </div>

                {/* Status indicator */}
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}