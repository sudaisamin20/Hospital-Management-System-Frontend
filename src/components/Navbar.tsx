const Navbar = () => {
  // Navbar links for main sections
  const navLinks: { name: string; href: string }[] = [
    { name: "Home", href: "/" },
    { name: "Appointments", href: "#appointments" },
    { name: "Patients", href: "#patients" },
    { name: "Doctors", href: "#doctors" },
    { name: "Billing", href: "#billing" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <div className="px-4 py-4 flex justify-between items-center shadow-md fixed w-full bg-white z-20">
      <h1 className="text-2xl font-bold text-blue-600">HMS</h1>
      <nav>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a
                href={link.href}
                className="hover:text-blue-600 transition-colors duration-300"
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
