import React from "react";
import StartHighlight from "./start-highlight";

export default function AnnouncementBar() {
  return (
    <div className="relative flex items-center justify-between bg-primary px-6 py-[0.60rem] rounded-xs lg:rounded-md text-[0.5rem] leading-5 text-secondary lg:text-xs font-semibold">
      <StartHighlight />
      <div className="absolute left-1/2 top-1/2 flex h-5 -translate-x-1/2 -translate-y-1/2 items-center gap-2 text-nowrap uppercase">
        <p>
          <span className="font-extrabold">
            This project is under construction
          </span>
        </p>
      </div>
      <StartHighlight />
    </div>
  );
}
