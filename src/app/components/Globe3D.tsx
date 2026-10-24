"use client";

import React, { useRef, useEffect, useState } from "react";

interface Marker {
  id: string;
  code: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  votes?: number;
  target?: number;
  isCurrent?: boolean;
}

interface Globe3DProps {
  markers: Marker[];
  onSelectLanguage?: (code: string) => void;
  selectedCode?: string | null;
  labels: {
    pause: string;
    play: string;
    dragTip: string;
    activeBadge: string;
    voteBtn: string;
    votesOf: string;
  };
}

// Simplified continent polygons for sphere projection
const CONTINENT_POINTS: [number, number][][] = [
  // Eurasia outline approximation
  [
    [70, 30], [68, 60], [65, 100], [60, 140], [55, 160], [40, 145], [30, 120],
    [20, 110], [10, 105], [15, 80], [25, 60], [30, 45], [40, 30], [45, 10],
    [55, 10], [60, 25], [70, 30]
  ],
  // Africa
  [
    [35, -5], [30, 30], [15, 45], [0, 40], [-15, 35], [-35, 20], [-30, 15],
    [-10, 10], [5, 0], [15, -15], [35, -5]
  ],
  // North America
  [
    [70, -160], [70, -100], [60, -60], [45, -60], [30, -80], [20, -100],
    [15, -90], [20, -105], [30, -120], [50, -130], [60, -150], [70, -160]
  ],
  // South America
  [
    [10, -75], [5, -50], [-10, -35], [-25, -45], [-45, -65], [-55, -70],
    [-40, -75], [-20, -70], [-5, -80], [10, -75]
  ],
  // Australia
  [
    [-15, 130], [-12, 145], [-25, 150], [-38, 145], [-35, 115], [-20, 115], [-15, 130]
  ]
];

export default function Globe3D({ markers, onSelectLanguage, selectedCode, labels }: Globe3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isRotating, setIsRotating] = useState(true);
  const [hoveredMarker, setHoveredMarker] = useState<Marker | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Rotation angles (radians)
  const rotationY = useRef(0.5); // longitude rotation
  const rotationX = useRef(0.25); // tilt (latitude)
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    const radius = () => Math.min(width, height) * 0.42;

    // Convert lat/lng to 3D projected x, y, z
    const project = (latDeg: number, lngDeg: number, r: number) => {
      const lat = (latDeg * Math.PI) / 180;
      const lng = (lngDeg * Math.PI) / 180 + rotationY.current;

      // 3D coordinates on sphere
      const x0 = r * Math.cos(lat) * Math.sin(lng);
      const y0 = -r * Math.sin(lat);
      const z0 = r * Math.cos(lat) * Math.cos(lng);

      // Tilt around X axis
      const cosX = Math.cos(rotationX.current);
      const sinX = Math.sin(rotationX.current);
      const y1 = y0 * cosX - z0 * sinX;
      const z1 = y0 * sinX + z0 * cosX;

      const centerX = width / 2;
      const centerY = height / 2;

      return {
        x: centerX + x0,
        y: centerY + y1,
        z: z1,
        visible: z1 > -r * 0.1, // Front hemisphere
      };
    };

    let pulse = 0;

    const render = () => {
      pulse += 0.04;
      if (isRotating && !isDragging.current) {
        rotationY.current += 0.006;
      }

      ctx.clearRect(0, 0, width, height);

      const r = radius();
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Atmosphere Glow (Outer shadow)
      const glowGrad = ctx.createRadialGradient(centerX, centerY, r * 0.8, centerX, centerY, r * 1.25);
      glowGrad.addColorStop(0, "rgba(168, 85, 247, 0.2)");
      glowGrad.addColorStop(0.6, "rgba(59, 130, 246, 0.12)");
      glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Base Globe Sphere (Dark cosmic gradient)
      const globeGrad = ctx.createRadialGradient(
        centerX - r * 0.35,
        centerY - r * 0.35,
        r * 0.1,
        centerX,
        centerY,
        r
      );
      globeGrad.addColorStop(0, "#1f1d36");
      globeGrad.addColorStop(0.7, "#0c0a1a");
      globeGrad.addColorStop(1, "#05040d");
      ctx.fillStyle = globeGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      ctx.fill();

      // Sphere border rim
      ctx.strokeStyle = "rgba(168, 85, 247, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 3. Grid Lines (Latitude & Longitude)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;

      // Latitudes (-60, -30, 0, 30, 60)
      [-60, -30, 0, 30, 60].forEach((latDeg) => {
        ctx.beginPath();
        let first = true;
        for (let lngDeg = -180; lngDeg <= 180; lngDeg += 10) {
          const pt = project(latDeg, lngDeg, r);
          if (pt.z > 0) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      });

      // Longitudes (every 30 degrees)
      for (let lngDeg = -180; lngDeg < 180; lngDeg += 30) {
        ctx.beginPath();
        let first = true;
        for (let latDeg = -90; latDeg <= 90; latDeg += 8) {
          const pt = project(latDeg, lngDeg, r);
          if (pt.z > 0) {
            if (first) {
              ctx.moveTo(pt.x, pt.y);
              first = false;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      }

      // 4. Continent Outlines
      ctx.fillStyle = "rgba(139, 92, 246, 0.12)";
      ctx.strokeStyle = "rgba(168, 85, 247, 0.35)";
      ctx.lineWidth = 1.2;

      CONTINENT_POINTS.forEach((poly) => {
        ctx.beginPath();
        let started = false;
        poly.forEach(([lat, lng]) => {
          const pt = project(lat, lng, r);
          if (pt.z > -r * 0.15) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          }
        });
        if (started) {
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      });

      // 5. Render Markers / Pins
      // Sort by Z so front markers render on top of back markers
      const projectedMarkers = markers.map((m) => {
        const pt = project(m.lat, m.lng, r);
        return { marker: m, pt };
      }).sort((a, b) => a.pt.z - b.pt.z);

      projectedMarkers.forEach(({ marker, pt }) => {
        if (!pt.visible || pt.z <= 0) return;

        const isHovered = hoveredMarker?.code === marker.code;
        const isSelected = selectedCode === marker.code;
        const scale = 0.7 + 0.3 * (pt.z / r); // depth scale
        const baseRadius = (marker.isCurrent ? 6 : 7) * scale;

        // Pulse ring
        if (isHovered || isSelected || !marker.isCurrent) {
          const ringSize = baseRadius + Math.sin(pulse) * 3 + 4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ringSize, 0, Math.PI * 2);
          ctx.strokeStyle = marker.isCurrent
            ? "rgba(16, 185, 129, 0.5)"
            : "rgba(236, 72, 153, 0.5)";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Pin body
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = marker.isCurrent ? "#10b981" : isSelected ? "#eab308" : "#a855f7";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5 * scale;
        ctx.stroke();

        // Pin Label (Flag + Short Name)
        ctx.font = `${Math.round(11 * scale)}px sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(marker.flag, pt.x, pt.y - baseRadius - 4);
      });

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener("resize", resize);
    };
  }, [isRotating, markers, hoveredMarker, selectedCode]);

  // Handle Drag to Rotate Globe
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (isDragging.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;
      rotationY.current += deltaX * 0.008;
      rotationX.current = Math.max(-0.8, Math.min(0.8, rotationX.current + deltaY * 0.008));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Check hit-test for markers
    const width = rect.width;
    const height = rect.height;
    const r = Math.min(width, height) * 0.42;
    const centerX = width / 2;
    const centerY = height / 2;

    let found: Marker | null = null;
    let foundPos: { x: number; y: number } | null = null;

    for (const m of markers) {
      const lat = (m.lat * Math.PI) / 180;
      const lng = (m.lng * Math.PI) / 180 + rotationY.current;

      const x0 = r * Math.cos(lat) * Math.sin(lng);
      const y0 = -r * Math.sin(lat);
      const z0 = r * Math.cos(lat) * Math.cos(lng);

      const cosX = Math.cos(rotationX.current);
      const sinX = Math.sin(rotationX.current);
      const y1 = y0 * cosX - z0 * sinX;
      const z1 = y0 * sinX + z0 * cosX;

      if (z1 > 0) {
        const px = centerX + x0;
        const py = centerY + y1;
        const dist = Math.hypot(mouseX - px, mouseY - py);
        if (dist < 18) {
          found = m;
          foundPos = { x: px, y: py };
          break;
        }
      }
    }

    if (found && foundPos) {
      setHoveredMarker(found);
      setTooltipPos(foundPos);
    } else {
      setHoveredMarker(null);
      setTooltipPos(null);
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Touch Support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging.current && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - lastMousePos.current.x;
      const deltaY = e.touches[0].clientY - lastMousePos.current.y;
      rotationY.current += deltaX * 0.008;
      rotationX.current = Math.max(-0.8, Math.min(0.8, rotationX.current + deltaY * 0.008));
      lastMousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = () => {
    isDragging.current = false;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto aspect-[16/11] select-none">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full cursor-grab active:cursor-grabbing block"
      />

      {/* Floating Interactive Marker Tooltip */}
      {hoveredMarker && tooltipPos && (
        <div
          className="absolute z-30 pointer-events-auto transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="bg-[#181824]/95 backdrop-blur-xl border border-purple-500/50 p-3.5 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] min-w-[200px] text-center animate-fade-in">
            <div className="text-2xl mb-1">{hoveredMarker.flag}</div>
            <div className="text-sm font-extrabold text-white">{hoveredMarker.name}</div>
            
            {hoveredMarker.isCurrent ? (
              <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                <span>✓</span>
                <span>{labels.activeBadge}</span>
              </div>
            ) : (
              <div className="mt-2">
                <div className="text-xs text-purple-300 font-bold mb-1">
                  {hoveredMarker.votes || 0} {labels.votesOf} {hoveredMarker.target || 50}
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${Math.min(100, Math.round(((hoveredMarker.votes || 0) / (hoveredMarker.target || 50)) * 100))}%` }}
                  />
                </div>
                {onSelectLanguage && (
                  <button
                    onClick={() => onSelectLanguage(hoveredMarker.code)}
                    className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md"
                  >
                    {labels.voteBtn}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Control Bar Overlay (Play/Pause & Hint) */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="pointer-events-auto px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/10 text-xs text-white font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-lg"
        >
          <span>{isRotating ? "⏸️" : "▶️"}</span>
          <span>{isRotating ? labels.pause : labels.play}</span>
        </button>

        <span className="text-[11px] text-gray-400 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 hidden sm:inline">
          {labels.dragTip}
        </span>
      </div>
    </div>
  );
}
