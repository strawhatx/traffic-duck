import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: "default" | "highlight";
}

export function StatCard({ label, value, variant = "default" }: StatCardProps) {
  const highlight =
    variant === "highlight"
      ? "bg-yellow-50 border-yellow-200"
      : "bg-white border-gray-200";

  return (
    <div className={`border rounded-lg p-4 ${highlight}`}>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-2xl text-gray-900">{value}</div>
    </div>
  );
}


