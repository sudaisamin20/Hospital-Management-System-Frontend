import React from "react";

interface DropdownItemProps {
  children: React.ReactNode;
  onClick: () => void;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ children, onClick }) => {
  return (
    <div
      className="px-4 py-2 w-full cursor-pointer rounded-md text-black duration-300 ease-in-out transform hover:bg-gray-100"
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default DropdownItem;
