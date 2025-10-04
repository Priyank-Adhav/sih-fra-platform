import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

export default function Sidebar({
  active,
  setActive,
  collapsed = false
}: {
  active: "atlas" | "dss" | "docs" | "claims" | "analytics";
  setActive: (a: "atlas" | "dss" | "docs" | "claims" | "analytics") => void;
  collapsed?: boolean;
}) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState<string | null>(null);

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
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Tribal pattern element */}
        <path d="M19 15l-2-2 2-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" 
              className="opacity-60"/>
      </svg>
    ),
    atlas: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" 
              stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 12h20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40"/>
        <path d="M12 2v20" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-40"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-70"/>
        {/* Geographic markers */}
        <path d="M16 8l2-2-2-2" stroke="currentColor" strokeWidth="1" className="opacity-60"/>
        <path d="M8 16l-2 2 2 2" stroke="currentColor" strokeWidth="1" className="opacity-60"/>
      </svg>
    ),
    dss: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" 
              stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7.5 4.21l4.5 2.6 4.5-2.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7.5 19.79V14.6L3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M21 12l-4.5 2.6v5.19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 22.08V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Decision tree elements */}
        <path d="M9 16l3-3 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="opacity-70"/>
      </svg>
    ),
    docs: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" 
              stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M16 13H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M16 17H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M10 9H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* AI/Processing element */}
        <path d="M18 14l1.5 1.5L18 17" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" 
              className="opacity-70"/>
        <circle cx="19" cy="12" r="0.5" fill="currentColor" className="opacity-70"/>
      </svg>
    ),
    analytics: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M18 20V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M12 20V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M6 20v-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Tribal pattern background */}
        <path d="M3 3h18v18H3V3z" stroke="currentColor" strokeWidth="0.5" className="opacity-20"/>
        <path d="M21 9H3" stroke="currentColor" strokeWidth="0.3" className="opacity-20"/>
        <path d="M21 15H3" stroke="currentColor" strokeWidth="0.3" className="opacity-20"/>
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
      activeBg: "bg-amber-500"
    },
    {
      id: "atlas" as const,
      name: t("interactive_atlas"),
      description: t("geospatial_analysis"),
      icon: CustomIcons.atlas,
      color: "text-emerald-700",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      activeBg: "bg-emerald-600"
    },
    {
      id: "dss" as const,
      name: t("dss"),
      description: t("decision_support"),
      icon: CustomIcons.dss,
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      activeBg: "bg-blue-600"
    },
    {
      id: "docs" as const,
      name: t("documents"),
      description: t("ocr_processing"),
      icon: CustomIcons.docs,
      color: "text-purple-700",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      activeBg: "bg-purple-600"
    },
    {
      id: "analytics" as const,
      name: t("analytics_dashboard"),
      description: t("fra_implementation_insights"),
      icon: CustomIcons.analytics,
      color: "text-indigo-700",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      activeBg: "bg-indigo-600"
    }
  ];

  const quickActions = [
    {
      name: t("export_data"),
      icon: "📊",
      description: t("export_current_analysis"),
      color: "text-cyan-700"
    },
    {
      name: t("new_report"),
      icon: "📋",
      description: t("create_new_report"),
      color: "text-orange-700"
    },
    {
      name: t("help_center"),
      icon: "❓",
      description: t("get_support"),
      color: "text-yellow-700"
    }
  ];

  // Tribal pattern background component
  const TribalPattern = () => (
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
      <svg width="100%" height="100%" className="text-forest-900">
        <pattern id="tribal-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M0 20 Q10 15 20 20 T40 20" stroke="currentColor" fill="none" strokeWidth="0.5"/>
          <path d="M20 0 Q15 10 20 20 T20 40" stroke="currentColor" fill="none" strokeWidth="0.5"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#tribal-pattern)"/>
      </svg>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 lg:w-80 xl:w-96
        bg-gradient-to-b from-forest-900 to-forest-800
        border-r border-forest-700 shadow-2xl lg:shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        relative overflow-hidden
      `}>
        {/* Tribal Pattern Background */}
        <TribalPattern />
        
        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-forest-800/50 to-transparent pointer-events-none" />
        
        <div className="flex flex-col h-full relative z-10">
          {/* Sidebar Header with Official Branding */}
          <div className="p-6 border-b border-forest-700/50 bg-forest-800/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white truncate">{t("navigation")}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-forest-200 truncate">{t("select_module")}</p>
                </div>
              </div>
            </div>
            
            {/* Ministry Badge */}
            <div className="flex items-center justify-between px-3 py-2 bg-forest-700/50 rounded-lg border border-forest-600/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-forest-100">MoTA</span>
              </div>
              <span className="text-xs text-forest-300">FRA Platform</span>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-forest-200 uppercase tracking-wider">
                  {t("main_modules")}
                </h3>
                <div className="w-2 h-2 bg-forest-400 rounded-full"></div>
              </div>
              
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`w-full text-left rounded-xl p-4 transition-all duration-300 group relative overflow-hidden
                        ${active === item.id
                          ? `bg-forest-300 text-forest-900 shadow-lg transform scale-[1.02] border-l-4 ${item.borderColor}`
                          : "bg-forest-500/30 text-forest-100 border border-forest-600/30 hover:bg-forest-700/50 hover:border-forest-500/50 hover:transform hover:scale-[1.01]"
                        }`}
                      onClick={() => setActive(item.id)}
                      onMouseEnter={() => setIsHovered(item.id)}
                      onMouseLeave={() => setIsHovered(null)}
                    >
                      {/* Active state indicator */}
                      {active === item.id && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent"></div>
                      )}
                      
                      {/* Hover effect */}
                      {isHovered === item.id && active !== item.id && (
                        <div className="absolute inset-0 bg-forest-600/20 animate-pulse"></div>
                      )}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`
                          p-2.5 rounded-lg transition-all duration-300 shadow-sm
                          ${active === item.id 
                            ? `${item.bgColor} ${item.color} shadow-md` 
                            : "bg-forest-600/50 text-forest-200 group-hover:bg-forest-500/50"
                          }
                        `}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm truncate transition-colors ${
                            active === item.id ? "text-forest-900" : "text-forest-100"
                          }`}>
                            {item.name}
                          </div>
                          <div className={`text-xs mt-1 transition-colors ${
                            active === item.id ? "text-forest-700" : "text-forest-300"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        {active === item.id && (
                          <div className={`w-2 h-2 rounded-full ${item.activeBg} shadow-sm`}></div>
                        )}
                        {!active && isHovered === item.id && (
                          <div className="w-1.5 h-1.5 bg-forest-400 rounded-full opacity-60"></div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-forest-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-forest-200 uppercase tracking-wider">
                  {t("quick_actions")}
                </h3>
                <div className="w-2 h-2 bg-forest-400 rounded-full opacity-60"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-forest-400/20 border border-forest-600/30 hover:bg-forest-700/40 hover:border-forest-500/50 transition-all duration-200 group"
                  >
                    <span className="text-lg transition-transform group-hover:scale-110">{action.icon}</span>
                    <div className="text-left flex-1">
                      <div className={`text-sm font-medium ${action.color} group-hover:text-forest-100 transition-colors`}>
                        {action.name}
                      </div>
                      <div className="text-xs text-forest-400 group-hover:text-forest-300 transition-colors">
                        {action.description}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-forest-500 opacity-0 group-hover:opacity-100 transition-all" 
                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 border-t border-forest-700/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-forest-200 uppercase tracking-wider">
                  {t("system_status")}
                </h3>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
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
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-2 bg-forest-700/20 rounded border border-forest-600/30">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></div>
                    <span className="text-forest-300 truncate">{t("analytics_services")}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-forest-700/20 rounded border border-forest-600/30">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></div>
                    <span className="text-forest-300 truncate">{t("dss_engine")}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-forest-700/20 rounded border border-forest-600/30">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></div>
                    <span className="text-forest-300 truncate">{t("map_services")}</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-forest-700/20 rounded border border-forest-600/30">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0"></div>
                    <span className="text-forest-300 truncate">{t("ocr_processing_status")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-forest-700/30 bg-forest-800/40 backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-forest-400 mb-2">
              <span className="font-medium">{t("fra_platform_version")}</span>
              <span>v2.1.0</span>
            </div>
            <div className="flex items-center justify-between text-xs text-forest-500">
              <span>Ministry of Tribal Affairs</span>
              <span>© 2025</span>
            </div>
            
            {/* Geographic Focus Badge */}
            <div className="mt-3 flex flex-wrap gap-1">
              {['MP', 'TR', 'OD', 'TS'].map((state) => (
                <div key={state} className="px-2 py-1 bg-forest-700/30 rounded text-xs text-forest-300 border border-forest-600/30">
                  {state}
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}