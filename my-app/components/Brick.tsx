"use client";

// Renders a single placed Lego brick — a flat body with procedurally generated studs on top based on brick type.

import { gridToWorld } from "@/utils/grid";

type BrickType = "1x1" | "1x2" | "2x2" | "2x4";

interface BrickProps {
    x: number;
    y: number;
    z: number;
    color: string;
    type?: BrickType;
}

const BRICK_DIMS: Record<BrickType, { w: number; d: number }> = {
    "1x1": { w: 1, d: 1 },
    "1x2": { w: 1, d: 2 },
    "2x2": { w: 2, d: 2 },
    "2x4": { w: 2, d: 4 },
};

export function Brick({ x, y, z, color, type = "2x4" }: BrickProps) {
    const { w, d } = BRICK_DIMS[type];
    const [wx, wy, wz] = gridToWorld(x, y, z);

    const studs: { sx: number; sz: number }[] = [];
    for (let col = 0; col < w; col++) {
        for (let row = 0; row < d; row++) {
            studs.push({
                sx: col - (w - 1) / 2,
                sz: row - (d - 1) / 2,
            });
        }
    }

    return (
        <group position={[wx, wy, wz]}>
            {/* Brick body */}
            <mesh castShadow receiveShadow>
                <boxGeometry args={[w * 0.95, 0.4, d * 0.95]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Studs — one per grid unit of width × depth */}
            {studs.map(({ sx, sz }, i) => (
                <mesh key={i} position={[sx, 0.26, sz]} castShadow>
                    <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            ))}
        </group>
    );
}
