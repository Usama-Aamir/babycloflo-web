"use client";

const dotPattern = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <circle cx="12" cy="20" r="2.5" fill="#4FA9D1" opacity="0.45"/>
    <circle cx="45" cy="60" r="2" fill="#D4537E" opacity="0.45"/>
    <circle cx="30" cy="10" r="2.5" fill="#5DCAA5" opacity="0.45"/>
    <circle cx="65" cy="35" r="2" fill="#EF9F27" opacity="0.45"/>
    <circle cx="22" cy="50" r="2.5" fill="#7F77DD" opacity="0.45"/>
    <circle cx="55" cy="15" r="2" fill="#F0997B" opacity="0.45"/>
  </svg>`
)}")`;

export function CustomerBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: "linear-gradient(135deg, #EAF6FB 0%, #FBEAF0 100%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: dotPattern,
          backgroundSize: "80px 80px",
        }}
      />
    </div>
  );
}
