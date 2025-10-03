import { useTranslation } from "react-i18next";

export default function Sidebar({
  active,
  setActive,
  collapsed = false
}: {
  active: "atlas" | "dss" | "docs" | "claims";
  setActive: (a: "atlas" | "dss" | "docs" | "claims") => void;
  collapsed?: boolean;
}) {
  const { t } = useTranslation();

  const menuItems = [
    {
      id: "atlas",
      name: t("interactive_atlas"),
      description: t("geospatial_analysis"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447-2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "dss",
      name: t("dss"),
      description: t("decision_support"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "docs",
      name: t("documents"),
      description: t("ocr_processing"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: "from-purple-500 to-pink-500"
    },
    {
      id: "claims",
      name: t("claim_tracker"),
      description: t("fra_workflow"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "from-orange-500 to-red-500"
    }
  ];

  const quickActions = [
    {
      name: t("export_data"),
      icon: "📊",
      description: t("export_current_analysis")
    },
    {
      name: t("new_report"),
      icon: "📋",
      description: t("create_new_report")
    },
    {
      name: t("help_center"),
      icon: "❓",
      description: t("get_support")
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-80 lg:w-80 xl:w-96
        bg-base-100/95 lg:bg-base-100 backdrop-blur-lg lg:backdrop-blur-none
        border-r border-base-300/30 shadow-2xl lg:shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-base-300/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
              <h2 className="text-lg font-bold text-base-content">{t("navigation")}</h2>
            </div>
            <p className="text-sm text-base-content/60">{t("select_module")}</p>
          </div>

          {/* Main Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-base-content/70 mb-3 uppercase tracking-wider">{t("main_modules")}</h3>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      className={`w-full text-left rounded-xl p-4 transition-all duration-200 group relative overflow-hidden
                        ${active === item.id
                          ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-[1.02]`
                          : "hover:bg-base-200/80 text-base-content border border-transparent hover:border-base-300/30"
                        }`}
                      onClick={() => setActive(item.id as "atlas" | "dss" | "docs" | "claims")}
                    >
                      {/* Active indicator */}
                      {active === item.id && (
                        <div className="absolute inset-0 bg-white/10"></div>
                      )}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div className={`
                          p-2 rounded-lg transition-colors duration-200
                          ${active === item.id 
                            ? "bg-white/20" 
                            : `bg-gradient-to-r ${item.color} text-white`
                          }
                        `}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{item.name}</div>
                          <div className={`text-xs mt-0.5 ${
                            active === item.id ? "text-white/80" : "text-base-content/60"
                          }`}>
                            {item.description}
                          </div>
                        </div>
                        {active === item.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-base-300/20">
              <h3 className="text-sm font-semibold text-base-content/70 mb-3 uppercase tracking-wider">{t("quick_actions")}</h3>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200/50 transition-colors duration-150 group"
                  >
                    <span className="text-lg">{action.icon}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium text-base-content">{action.name}</div>
                      <div className="text-xs text-base-content/50">{action.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 border-t border-base-300/20">
              <h3 className="text-sm font-semibold text-base-content/70 mb-3 uppercase tracking-wider">{t("system_status")}</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{t("all_systems")}</span>
                  </div>
                  <span className="text-xs text-success font-semibold">{t("operational")}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t("dss_engine")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t("map_services")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t("ocr_processing_status")}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{t("claim_tracker_service")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-base-300/20">
            <div className="flex items-center justify-between text-xs text-base-content/40">
              <span>{t("fra_platform_version")}</span>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}