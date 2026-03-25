import React from "react";

interface DropdownButtonProps {
  children: React.ReactNode;
  open: boolean;
  toggle: () => void;
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  open,
  toggle,
}) => {
  return (
    <div onClick={toggle} className="flex items-center w-fit">
      {children}
    </div>
  );
};

export default DropdownButton;
