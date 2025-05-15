import React, { useState } from "react";
import { MenuItems } from "./MenuItems";
import { Menu, X } from "lucide-react";
import SidebarItems from "./SidebarItems";
const Sidebar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);
  return (
    <aside
      className={`${
        toggleMenu ? "w-6" : "w-52"
      }  h-screen bg-[#0f172a] text-white relative`}
    >
      {!toggleMenu && (
        <h2 className="text-xl border-b-2 border-amber-50 p-2">Dashboard</h2>
      )}

      <div
        className="absolute top-0 right-0"
        onClick={() => setToggleMenu(!toggleMenu)}
      >
        {toggleMenu ? (
           <Menu className="cursor-pointer" />
        ) : (
         
          <X className="cursor-pointer" />
        )}
      </div>

      <ul>
        {MenuItems &&
          MenuItems.map((item, index) => (
            <SidebarItems key={index} item={item} toggleMenu={toggleMenu} />
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
