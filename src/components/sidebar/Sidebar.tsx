import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { LogOut, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useModal from "../../hooks/useModal";
import Modal from "../Modal";
import { useDispatch } from "react-redux";
import { logout } from "../../features/auth/authSlice";

type SidebarProps = {
  sidebarElements: { title: string; path: string; icon: React.ReactNode }[];
};

const Sidebar = (props: SidebarProps) => {
  const { sidebarElements } = props;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { openModal, closeModal, isOpen: isModalOpen } = useModal();
  const dispatch = useDispatch();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
    closeModal();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white border border-gray-200 rounded-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-gray-700" />
        ) : (
          <Menu className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`
          fixed bg-white border-r border-gray-200 max-[300px]:w-full w-60 pt-4 pb-6 
          flex flex-col gap-6 h-full z-40 shadow-lg
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="px-5 mt-2 lg:mt-0">
          <div className="flex gap-3">
            <div>
              <h2 className="text-xl font-bold text-blue-600">
                Smart Hospital
                <p className="text-sm text-blue-400">Management System</p>
              </h2>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2">
          <ul className="space-y-1 pt-1">
            {sidebarElements.map((element, index) => {
              const active = isActive(element.path);
              return (
                <li key={index}>
                  <Link
                    to={element.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      group relative flex items-center gap-2 p-3 rounded-lg
                      transition-all duration-200 ease-in-out
                      ${
                        active
                          ? "bg-blue-50 text-blue-700 font-medium shadow-sm"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <div
                      className={`
                        absolute left-0 top-1/2 -translate-y-1/2
                        w-1 rounded-r-full transition-all duration-200
                        ${
                          active
                            ? "h-8 bg-blue-600 opacity-100"
                            : "h-0 bg-blue-400 opacity-0 group-hover:h-6 group-hover:opacity-50"
                        }
                      `}
                    />

                    <span
                      className={`
                        transition-all duration-200
                        ${
                          active
                            ? "scale-110 text-blue-600"
                            : "text-gray-600 group-hover:scale-105 group-hover:text-gray-800"
                        }
                      `}
                    >
                      {element.icon}
                    </span>

                    <span className="text-sm flex-1 font-semibold">
                      {element.title}
                    </span>

                    {active && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={openModal}
                className={`
                  w-full text-left group relative flex items-center gap-2 p-3 rounded-lg
                  transition-all duration-200 ease-in-out
                  text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer
                `}
              >
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 h-0 bg-blue-400 opacity-0 group-hover:h-6 group-hover:opacity-50" />

                <span className="transition-all duration-200 text-gray-600 group-hover:scale-105 group-hover:text-gray-800">
                  <LogOut className="w-5 h-5" />
                </span>

                <span className="text-sm flex-1 font-semibold">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className="px-6 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            © 2024 Smart Hospital
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Logout"
        onConfirm={handleLogout}
        confirmColor="bg-red-800 hover:bg-red-400 text-white duration-300 transition-all"
        height="h-20"
        confirmText="Logout"
        confirmIcon={<LogOut className="w-4 h-4 mr-1" />}
        onCancel={closeModal}
        cancelText="Cancel"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">
            Are you sure you want to logout?
          </h3>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
