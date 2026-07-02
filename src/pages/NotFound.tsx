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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 bg-cover bg-center relative" style={{ backgroundImage: "url('/image%20copy%20copy.png')" }}>
      <div className="absolute inset-0 bg-black/40" />
      <h1 className="relative text-[40vw] md:text-[30vw] lg:text-[28vw] font-black leading-none text-white select-none drop-shadow-2xl">
        404
      </h1>
      <p className="relative text-2xl md:text-4xl lg:text-5xl font-bold text-white mt-4 text-center px-4 drop-shadow-lg">
        Запрошенный ресурс не найден.
      </p>
    </div>
  );
};

export default NotFound;
