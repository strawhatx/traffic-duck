import React from "react";

export function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
      <div className="text-2xl mb-2">🦆</div>
      <h3 className="text-gray-900 mb-1">No opportunities found</h3>
      <p className="text-gray-600">Try adjusting filters or adding more keywords.</p>
    </div>
  );
}


