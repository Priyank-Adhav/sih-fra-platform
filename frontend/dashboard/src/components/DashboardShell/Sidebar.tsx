export default function Sidebar({
  active,
  setActive,
}: {
  active: "atlas" | "dss";
  setActive: (a: "atlas" | "dss") => void;
}) {
  return (
    <aside className="w-64 bg-base-100 border-r border-base-300 shadow-sm">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-base-content mb-4">Modules</h2>
        <ul className="menu menu-lg w-full p-0">
          <li>
            <button
              className={`w-full text-left rounded-lg px-2 py-1.5 transition shadow-sm
                ${active === "atlas"
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content"
                }`}

              onClick={() => setActive("atlas")}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-col items-start">
                <span className="font-medium">Atlas</span>
                <span className="text-xs opacity-70">Interactive Map</span>
              </div>
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left rounded-lg px-2 py-1.5 transition shadow-sm
                ${active === "dss"
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200 text-base-content"
                }`}
              onClick={() => setActive("dss")}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex flex-col items-start">
                <span className="font-medium">DSS</span>
                <span className="text-xs opacity-70">Decision Support</span>
              </div>
            </button>
          </li>
        </ul>
        
        {/* Additional navigation items */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-base-content/70 mb-3">Quick Actions</h3>
          <ul className="menu menu-sm w-full p-0">
            <li>
              <a className="hover:bg-base-200 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Export Data</span>
              </a>
            </li>
            <li>
              <a className="hover:bg-base-200 rounded-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Help & Support</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
