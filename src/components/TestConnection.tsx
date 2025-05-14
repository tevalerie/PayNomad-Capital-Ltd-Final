import React from "react";

const TestConnection: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[#2c3e50] mb-4">
        Connection Test
      </h2>
      <p className="text-gray-700 mb-4">
        This component confirms that the connection is working properly.
      </p>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        Connection successful!
      </div>
    </div>
  );
};

export default TestConnection;
