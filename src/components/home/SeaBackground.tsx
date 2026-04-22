"use client";

import { useEffect, useRef, useState } from "react";
import { Coral } from "./Coral";

export function SeaBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<unknown>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          w: containerRef.current.offsetWidth,
          h: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !size.w || p5Ref.current) return;

    import("p5").then(({ default: p5 }) => {
      p5Ref.current = new p5((p: InstanceType<typeof p5>) => {
        let t = 0;

        p.setup = () => {
          const canvas = p.createCanvas(size.w, size.h);
          canvas.parent(containerRef.current!);
          canvas.style("position", "absolute");
          canvas.style("top", "0");
          canvas.style("left", "0");
          canvas.style("z-index", "0");
          p.pixelDensity(1);
          p.noStroke();
        };

        p.draw = () => {
          const topColor = [30, 130, 180];
          const bottomColor = [8, 30, 60];

          const res = 6;
          for (let y = 0; y < p.height; y += res) {
            const depthRatio = y / p.height;
            for (let x = 0; x < p.width; x += res) {
              const n = p.noise(x * 0.008, y * 0.006, t * 0.2);
              const lightFade = 1 - depthRatio;
              const caustic = n * lightFade * 0.5;

              const r = p.lerp(topColor[0], bottomColor[0], depthRatio) + caustic * 60;
              const g = p.lerp(topColor[1], bottomColor[1], depthRatio) + caustic * 100;
              const b = p.lerp(topColor[2], bottomColor[2], depthRatio) + caustic * 80;

              p.fill(r, g, b);
              p.rect(x, y, res, res);
            }
          }
          t += p.deltaTime * 0.001;
        };
      });
    });

    return () => {
      if (p5Ref.current) {
        (p5Ref.current as { remove: () => void }).remove();
        p5Ref.current = null;
      }
    };
  }, [size.w, size.h]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    >
      {/* Coral layer on top of sea */}
      {size.w > 0 && (
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "40%", zIndex: 1 }}>
          <Coral containerW={size.w} containerH={size.h * 0.4} />
        </div>
      )}
    </div>
  );
}