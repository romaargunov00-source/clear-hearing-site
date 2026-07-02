import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-[40vw] md:text-[30vw] lg:text-[28vw] font-black leading-none text-gray-900 select-none">
        404
      </h1>
      <p className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-700 mt-4 text-center px-4">
        Запрошенный ресурс не найден.
      </p>
    </div>
  );
};

export default NotFound;
