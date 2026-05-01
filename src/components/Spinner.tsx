import React from "react";

interface IProps {
  title?: string;
}

const Spinner = ({ title = "Loading..." }: IProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="relative">
        <div className="w-14 h-14 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute top-0 left-0 w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-700 tracking-wide animate-pulse">
        {title}
      </p>
    </div>
  );
};

export default Spinner;

//  <button type="button" className="bg-indigo-500 ..." disabled>
//      <svg className="mr-3 size-5 animate-spin ..." viewBox="0 0 24 24">
//       ...
//     </?svg>
//     Processing…
//  </button>
