function Svg({ children }: { children: React.ReactNode }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {children}
    </svg>
  );
}

export function LoginIcon() {
  return (
    <Svg>
      <path
        d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function RegisterIcon() {
  return (
    <Svg>
      <path
        d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM3 21c0-4 2.7-7 6-7s6 3 6 7M19 8v6M16 11h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function KeyIcon() {
  return (
    <Svg>
      <path
        d="M14.5 9.5a3.5 3.5 0 1 1-4.95-4.95 3.5 3.5 0 0 1 4.95 4.95ZM11 13 3 21m4-4 2 2m2-6 2 2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ResetIcon() {
  return (
    <Svg>
      <path
        d="M3 12a9 9 0 1 1 2.6 6.3M3 12v6m0-6h6M12 8v4l2.5 2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
