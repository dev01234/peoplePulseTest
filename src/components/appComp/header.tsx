"use client";
import ThemeToggler from "../theme-toggler";
import Link from "next/link";
import { useUserStore } from "@/store/userStore";
import { Separator } from "../ui/separator";
import Image from "next/image";


const Header: React.FC = () => {
  const { user } = useUserStore()

  return (
    <header
      className="flex items-center justify-between px-6 py-4 
      bg-gradient-to-l from-blue-200 to-white
      dark:bg-gradient-to-l dark:from-gray-900 dark:to-gray-700
      border-b w-full shadow-bottom"
    >
      <div className="flex items-center space-x-3">
        <Image
          src="/PeoplePulseFinal1.png"
          height={70}
          width={70}
          alt="Logo"
        />
        <Separator orientation="vertical" className="w-px h-4 bg-gray-400" />
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          PEOPLE PULSE
        </h1>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          WORKFORCE MANAGEMENT
        </h1>
      </div>
      {/* User Greeting & Profile Image */}
      <div className="flex items-center space-x-3">
        <ThemeToggler />
        <span className="text-sm text-gray-700 dark:text-green-100">
          Welcome, <strong>{user?.name || "Guest"}</strong>
        </span>
        <Link href= {`/${user?.role}/profile`}>
          <Image
            src={user?.userProfileUrl || "https://github.com/shadcn.png"}
            alt="User Profile"
            height={60}
          width={60}
            className="rounded-full border-2 border-gray-300"
          />
        </Link>
      </div>
    </header>
  );
};

export default Header;
