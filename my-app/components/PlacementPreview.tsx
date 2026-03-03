"use client";

// Ghost brick preview that follows the cursor, centered over the full brick footprint so it aligns with where cells will be placed.

import { ThreeEvent } from "@react-three/fiber";
import { gridToWorld, BRICK_DIMS } from "@/utils/grid";

type BrickType = "1x1" | "1x2" | "2x2" | "2x4";

interface PlacementPreviewProps {
    gridPos: { x: number; y: number; z: number } | null;
    color?: string;
    type?: BrickType;
}

export function PlacementPreview({
    gridPos,
    color = "#6366F1",
    type = "1x1",
}: PlacementPreviewProps) {
    if (!gridPos) return null;

    const dims = BRICK_DIMS[type];
    const [wx, wy, wz] = gridToWorld(gridPos.x, gridPos.y, gridPos.z);

    // Offset so the visual is centered over the entire brick footprint
    const offsetX = wx + (dims.w - 1) / 2;
    const offsetZ = wz + (dims.d - 1) / 2;

    const studs: { sx: number; sz: number }[] = [];
    for (let col = 0; col < dims.w; col++) {
        for (let row = 0; row < dims.d; row++) {
            studs.push({
                sx: col - (dims.w - 1) / 2,
                sz: row - (dims.d - 1) / 2,
            });
        }
    }

    return (
        <group position={[offsetX, wy, offsetZ]}>
            {/* Ghost brick body */}
            <mesh>
                <boxGeometry args={[dims.w * 0.95, 0.4, dims.d * 0.95]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.5}
                    depthWrite={false}
                />
            </mesh>

            {/* Ghost studs */}
            {studs.map(({ sx, sz }, i) => (
                <mesh key={i} position={[sx, 0.26, sz]}>
                    <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
                    <meshStandardMaterial
                        color={color}
                        transparent
                        opacity={0.5}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </group>
    );
}
