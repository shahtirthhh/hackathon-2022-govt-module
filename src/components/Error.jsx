import React from "react";
import { Link } from "react-router-dom";
const Error = () => {
  return (
    <div className="ani-1 scrollbar_div flex flex-col items-center">
      <h1 className="font-SFProItalic text-4xl text-red-500">ERROR 404</h1>
      <h1 className="font-SFProItalic text-2xl text-red-500">
        The page you are looking or does not exist !!
      </h1>
      <div className="flex gap-6">
        <Link
          to="/"
          className="font-SFProItalic text-blue-400 text-xl underline underline-offset-2 mt-10"
        >
          homepage
        </Link>
        <Link
          to="/login"
          className="font-SFProItalic text-blue-400 text-xl underline underline-offset-2 mt-10"
        >
          login
        </Link>
      </div>
    </div>
  );
};

export default Error;
