import Link from 'next/link';
import React from 'react';

// Define the props type
interface SidebarListItemProps {
  href: string; // URL for the link
  icon: React.ComponentType; // A React component for the icon (e.g., SVG or icon component)
  label: string; // Label for the list item
  isActive: boolean; // Whether the item is active or not
  onClick: () => void; // Click handler function
}

const SidebarListItem: React.FC<SidebarListItemProps> = ({
  href,
  icon: Icon,
  label,
  isActive,
  onClick,
}) => {
  return (
    <li
      className={`p-2 rounded-md ${
        isActive ? 'bg-gray-100 text-blue-500' : 'hover:text-blue-400'
      }`}
      onClick={onClick}
    >
      <Link href={href} className="text-center flex items-center">
        <span className="pr-2">
          <Icon />
        </span>
        {label}
      </Link>
    </li>
  );
};

export default SidebarListItem;
