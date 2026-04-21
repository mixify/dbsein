"use client";

import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({ value, onChange, readonly = false, size = 20 }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <span className="inline-flex items-center">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = display >= star;
        const half = !filled && display >= star - 0.5;

        return (
          <span
            key={star}
            className={readonly ? "" : "cursor-pointer"}
            style={{ userSelect: "none", position: "relative", width: size, height: size, display: "inline-block" }}
            onMouseLeave={() => !readonly && setHover(null)}
          >
            {/* Left half - click for 0.5 */}
            <span
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "50%",
                height: "100%",
                zIndex: 1,
              }}
              onMouseEnter={() => !readonly && setHover(star - 0.5)}
              onClick={() => !readonly && onChange?.(star - 0.5)}
            />
            {/* Right half - click for 1.0 */}
            <span
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: "50%",
                height: "100%",
                zIndex: 1,
              }}
              onMouseEnter={() => !readonly && setHover(star)}
              onClick={() => !readonly && onChange?.(star)}
            />
            {/* Star SVG */}
            <svg width={size} height={size} viewBox="0 0 24 24">
              <defs>
                <clipPath id={`half-${star}`}>
                  <rect x="0" y="0" width="12" height="24" />
                </clipPath>
              </defs>
              {/* Empty star background */}
              <path
                d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                fill="none"
                stroke="#888"
                strokeWidth="1.5"
              />
              {/* Filled star */}
              {filled && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#f5c518"
                  stroke="#f5c518"
                  strokeWidth="0.5"
                />
              )}
              {/* Half star */}
              {half && (
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill="#f5c518"
                  stroke="#f5c518"
                  strokeWidth="0.5"
                  clipPath={`url(#half-${star})`}
                />
              )}
            </svg>
          </span>
        );
      })}
      {value > 0 && <span style={{ marginLeft: 4, color: "#888", fontSize: 12 }}>{value.toFixed(1)}</span>}
    </span>
  );
}
