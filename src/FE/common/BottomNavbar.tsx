"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoHome, IoRepeat, IoSettings, IoShareSocial } from "react-icons/io5";
import { MdSwapHorizontalCircle } from "react-icons/md";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: IoHome },
  { href: "/positions", label: "Positions", icon: IoRepeat },
  // { href: "/swap", label: "Swap", icon: MdSwapHorizontalCircle },
  { href: "/referrals", label: "Referrals", icon: IoShareSocial },
  { href: "/settings", label: "Settings", icon: IoSettings },
];

const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B] border-t border-[#262626] text-white z-50">
      <div className="flex justify-between items-center px-4 py-2 max-w-md mx-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link key={href} href={href} className="flex-1">
              <div className="flex flex-col items-center text-center">
                <Icon
                  size={24}
                  className={`mb-[2px] transition ${
                    isActive ? "text-[#E6B911]" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-[#E6B911]" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
