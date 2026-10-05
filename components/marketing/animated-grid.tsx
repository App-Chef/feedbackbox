export function AnimatedGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Main grid pattern */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle grid pattern */}
          <pattern
            id="grid-pattern"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 32V.5H32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-line-soft/60"
            />
          </pattern>

          {/* Animated gradient for accent lines */}
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0" className="text-accent">
              <animate
                attributeName="stop-opacity"
                values="0;0.6;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" className="text-accent">
              <animate
                attributeName="stop-opacity"
                values="0.6;1;0.6"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-accent">
              <animate
                attributeName="stop-opacity"
                values="0;0.6;0"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>


        </defs>

        {/* Base grid */}
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />

        {/* Animated accent lines - horizontal */}
        <line
          x1="0"
          y1="20%"
          x2="100%"
          y2="20%"
          stroke="url(#line-gradient)"
          strokeWidth="1"
        >
          <animate
            attributeName="y1"
            values="20%;25%;20%"
            dur="8s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="20%;25%;20%"
            dur="8s"
            repeatCount="indefinite"
          />
        </line>

        <line
          x1="0"
          y1="60%"
          x2="100%"
          y2="60%"
          stroke="url(#line-gradient)"
          strokeWidth="1"
        >
          <animate
            attributeName="y1"
            values="60%;65%;60%"
            dur="10s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="60%;65%;60%"
            dur="10s"
            repeatCount="indefinite"
          />
        </line>

        {/* Animated accent lines - vertical */}
        <line
          x1="30%"
          y1="0"
          x2="30%"
          y2="100%"
          stroke="url(#line-gradient)"
          strokeWidth="1"
        >
          <animate
            attributeName="x1"
            values="30%;35%;30%"
            dur="12s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="30%;35%;30%"
            dur="12s"
            repeatCount="indefinite"
          />
        </line>

        <line
          x1="70%"
          y1="0"
          x2="70%"
          y2="100%"
          stroke="url(#line-gradient)"
          strokeWidth="1"
        >
          <animate
            attributeName="x1"
            values="70%;75%;70%"
            dur="14s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="70%;75%;70%"
            dur="14s"
            repeatCount="indefinite"
          />
        </line>
      </svg>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/50 to-bg" />
    </div>
  );
}
