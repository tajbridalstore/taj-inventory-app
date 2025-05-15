
export const Spinner = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-4 h-4 rounded-full animate-ping bg-blue-500"></div>
    <div className="w-4 h-4 rounded-full animate-ping bg-blue-500 delay-75"></div>
    <div className="w-4 h-4 rounded-full animate-ping bg-blue-500 delay-150"></div>
  </div>
);
