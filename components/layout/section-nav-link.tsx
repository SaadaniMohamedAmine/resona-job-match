"use client";

export function SectionNavLink({
  sectionId,
  className,
  children,
  onClick,
}: {
  sectionId: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const section = document.getElementById(sectionId);
    if (section) {
      e.preventDefault();
      section.scrollIntoView({ behavior: "smooth" });
    }
    onClick?.();
  }

  return (
    <a href={`/#${sectionId}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
