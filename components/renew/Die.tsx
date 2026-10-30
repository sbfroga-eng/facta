const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };

export default function Die({ size, spin = "16s", dark = true }: { size: number; spin?: string; dark?: boolean }) {
  const h = size / 2;
  const faces: [string, number][] = [
    [`translateZ(${h}px)`, 1], [`rotateY(180deg) translateZ(${h}px)`, 6],
    [`rotateY(90deg) translateZ(${h}px)`, 3], [`rotateY(-90deg) translateZ(${h}px)`, 4],
    [`rotateX(90deg) translateZ(${h}px)`, 2], [`rotateX(-90deg) translateZ(${h}px)`, 5],
  ];
  return (
    <div className={`die${dark ? " dark" : ""}`} style={{ width: size, height: size, ["--spin" as string]: spin }} aria-hidden="true">
      <span className="die__cube">
        {faces.map(([t, n]) => (
          <span key={n} className="die__f" style={{ transform: t }}>
            {Array.from({ length: 9 }, (_, i) => <i key={i} className={PIPS[n].includes(i) ? "pip" : ""} />)}
          </span>
        ))}
      </span>
    </div>
  );
}
