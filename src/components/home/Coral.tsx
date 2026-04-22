"use client";

import { useEffect, useRef } from "react";
import { spawnCount, scaleSize } from "@/lib/p5-utils";

// L-System rules
function generateLSystem(axiom: string, rules: Record<string, string>, iterations: number): string {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = "";
    for (const ch of current) {
      next += rules[ch] || ch;
    }
    current = next;
  }
  return current;
}

interface CoralInstance {
  x: number;       // 0~1 relative
  baseLen: number;
  hueBase: number;
  sentence: string;
  angleVar: number;
}

export function Coral({ containerW, containerH }: { containerW: number; containerH: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    import("p5").then(({ default: p5 }) => {
      // Generate coral instances based on container size
      const coralSize = scaleSize(80, containerW);
      const count = spawnCount(containerW, containerH, coralSize, 0.02, 2, 8);

      const corals: CoralInstance[] = [];
      const rules: Record<string, string>[] = [
        { "F": "FF+[+F-F-F]-[-F+F+F]" },   // bushy
        { "F": "F[+F]F[-F][F]" },            // dense
        { "F": "FF-[-F+F+F]+[+F-F-F]" },    // symmetric
      ];

      for (let i = 0; i < count; i++) {
        const ruleSet = rules[Math.floor(Math.random() * rules.length)];
        const iterations = Math.random() < 0.5 ? 3 : 4;
        corals.push({
          x: 0.1 + (i / (count - 1 || 1)) * 0.8 + (Math.random() - 0.5) * 0.1,
          baseLen: scaleSize(4 + Math.random() * 3, containerW),
          hueBase: Math.random() * 60 + 300, // pinks, purples, reds (300-360)
          sentence: generateLSystem("F", ruleSet, iterations),
          angleVar: 20 + Math.random() * 15,
        });
      }

      // Use p5 in instance mode just for drawing
      const sketch = new p5((p: InstanceType<typeof p5>) => {
        p.setup = () => {
          const c = p.createCanvas(containerW, containerH);
          c.parent(canvas.parentElement!);
          canvas.remove(); // replace placeholder
          p.colorMode(p.HSB, 360, 100, 100, 100);
          p.noLoop();
          drawCorals(p, corals);
        };
      });

      function drawCorals(p: InstanceType<typeof p5>, corals: CoralInstance[]) {
        p.clear();

        for (const coral of corals) {
          p.push();
          p.translate(coral.x * p.width, p.height); // bottom of canvas
          p.rotate(p.radians(-90 + (Math.random() - 0.5) * 10)); // mostly upward

          drawBranch(p, coral.sentence, coral.baseLen, coral.angleVar, coral.hueBase, 0);
          p.pop();
        }
      }

      function drawBranch(
        p: InstanceType<typeof p5>,
        sentence: string,
        len: number,
        angleVar: number,
        hueBase: number,
        depth: number
      ) {
        const stack: { x: number; y: number; angle: number }[] = [];
        let currentAngle = 0;

        for (const ch of sentence) {
          if (ch === "F") {
            // Color: shift hue with depth, vary brightness
            const hue = (hueBase + depth * 8 + p.random(-10, 10)) % 360;
            const sat = 50 + p.random(20);
            const bri = 60 + p.random(30);
            const thickness = Math.max(1, scaleSize(3 - depth * 0.4, p.width));

            p.stroke(hue, sat, bri, 80);
            p.strokeWeight(thickness);

            const thisLen = len * (1 - depth * 0.1) + p.random(-1, 1);
            const x2 = thisLen;
            const y2 = 0;

            p.line(0, 0, x2, y2);
            p.translate(x2, y2);

          } else if (ch === "+") {
            currentAngle = angleVar + p.random(-8, 8);
            p.rotate(p.radians(currentAngle));

          } else if (ch === "-") {
            currentAngle = -(angleVar + p.random(-8, 8));
            p.rotate(p.radians(currentAngle));

          } else if (ch === "[") {
            stack.push({ x: 0, y: 0, angle: 0 });
            p.push();
            depth++;

          } else if (ch === "]") {
            // Spiky tips at branch ends
            drawSpikes(p, hueBase, depth, len);
            p.pop();
            stack.pop();
            depth--;
          }
        }
      }

      function drawSpikes(
        p: InstanceType<typeof p5>,
        hueBase: number,
        depth: number,
        baseLen: number
      ) {
        if (depth < 2) return; // only at deeper branches

        const spikeCount = Math.floor(p.random(3, 7));
        const spikeLen = scaleSize(baseLen * p.random(0.5, 1.5), p.width, 1440, 0.8);

        for (let i = 0; i < spikeCount; i++) {
          const angle = p.random(-60, 60);
          const hue = (hueBase + p.random(-20, 20) + depth * 5) % 360;
          const sat = 40 + p.random(30);
          const bri = 70 + p.random(25);

          p.push();
          p.rotate(p.radians(angle));
          p.stroke(hue, sat, bri, 60);
          p.strokeWeight(Math.max(0.5, scaleSize(1, p.width)));
          p.line(0, 0, spikeLen, 0);

          // Tiny sub-spikes
          if (p.random() > 0.5) {
            p.translate(spikeLen * 0.7, 0);
            const subAngle = p.random(-40, 40);
            p.rotate(p.radians(subAngle));
            p.line(0, 0, spikeLen * 0.4, 0);
          }
          p.pop();
        }
      }

      return () => {
        sketch.remove();
      };
    });
  }, [containerW, containerH]);

  return <canvas ref={canvasRef} />;
}