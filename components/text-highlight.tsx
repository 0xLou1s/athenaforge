import React from "react";

export default function TextHighlight({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="bg-primary text-secondary px-1">{children}</span>;
}
