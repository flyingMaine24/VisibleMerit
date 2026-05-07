"use client";

import { useEffect, useState } from "react";

type OutlineItem = {
  id: string;
  title: string;
  meta: string;
};

type Props = {
  items: OutlineItem[];
};

export function PackOutlineNav({ items }: Props) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    function syncHash() {
      const nextId = window.location.hash.replace("#", "");
      if (nextId) setActiveId(nextId);
    }

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <nav className="section-nav" aria-label="Pack sections">
      <div className="section-nav-header">
        <span>Pack outline</span>
        <strong>{items.length} sections</strong>
      </div>
      {items.map((item, index) => (
        <a
          aria-current={activeId === item.id ? "location" : undefined}
          className={activeId === item.id ? "active" : ""}
          href={`#${item.id}`}
          key={item.id}
          onClick={() => setActiveId(item.id)}
        >
          <span>{String(index + 1).padStart(2, "0")}</span>
          <strong>{item.title}</strong>
          <em>{item.meta}</em>
        </a>
      ))}
    </nav>
  );
}
