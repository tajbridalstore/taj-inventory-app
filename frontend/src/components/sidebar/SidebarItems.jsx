import React, { useState } from "react";
import { Link } from "react-router"; // Fixed import for routing

const SidebarItems = ({ item,toggleMenu }) => {
  const [openInventory, setOpenInventory] = useState(false);

  return (
    <li className="space-y-3 px-2 py-4">
      {/* Main menu item */}
      <div
        className="flex gap-2 cursor-pointer"
        onClick={() => setOpenInventory(!openInventory)}
      >
        {<item.icon />} {!toggleMenu && <Link to={item?.path}>{item.name}</Link>}
      </div>

      {/* Show submenu only when openInventory is true */}
      {item?.submenu && openInventory && (
        <ul className="ml-4 mt-2 border-l-2 border-gray-500 pl-2">
          {item.submenu.map((menu, index) => (
            <li key={index} className="flex gap-2 py-2">
              <menu.icon />
              <Link to={menu.path}>{menu.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default SidebarItems;
