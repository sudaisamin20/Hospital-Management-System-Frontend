import React, { useState, useEffect, useRef } from "react";
import DropdownButton from "./DropdownButton";
import DropdownContent from "./DropdownContent";

interface DropdownProps {
  buttonText: React.ReactNode;
  content: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({ buttonText, content }) => {
  const [open, setOpen] = useState<boolean>(false);
  const toggleDropdown = () => setOpen((prev) => !prev);

  // Use proper typing for the ref
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-10 inline-block">
      <DropdownButton toggle={toggleDropdown} open={open}>
        {buttonText}
      </DropdownButton>
      {open && <DropdownContent open={open}>{content}</DropdownContent>}
    </div>
  );
};

export default Dropdown;
