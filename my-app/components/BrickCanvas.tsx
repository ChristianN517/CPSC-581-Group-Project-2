"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Baseplate } from "@/components/Baseplate";
import { FloorPlane } from "@/components/FloorPlane";
import { Brick } from "@/components/Brick";
import { snapToGrid, wouldOverlap, cellKey } from "@/utils/grid";

const BOARD_SIZE = 12;

export type BrickData = {
    id: string;
    x: number;
    y: number;
    z: number;
    color: string;
    type: "1x1" | "1x2" | "2x2" | "2x4";
};

interface BrickCanvasProps {
    studentId: string;
    selectedColor: string | null;
    selectedType: "1x1" | "1x2" | "2x2" | "2x4" | null;
    onSnap?: (brick: BrickData, stepIndex: number) => void;
}

export function BrickCanvas({ studentId: _, selectedColor, selectedType, onSnap }: BrickCanvasProps) {
    const [bricks, setBricks] = useState<BrickData[]>([]);
    const [hoverPos, setHoverPos] = useState<{ x: number; y: number; z: number } | null>(null);

    function handlePointerMove(e: ThreeEvent<PointerEvent>) {
        setHoverPos(snapToGrid(e.point));
    }

    function handlePointerDown(e: ThreeEvent<PointerEvent>) {
        // No tool selected — do nothing
        if (!selectedColor || !selectedType) return;

        const snapped = snapToGrid(e.point);

        // Reject placement outside fixed board bounds
        const half = BOARD_SIZE / 2;
        if (
            snapped.x < -half || snapped.x >= half ||
            snapped.z < -half || snapped.z >= half
        ) return;

        if (wouldOverlap(bricks, snapped.x, snapped.y, snapped.z, selectedType)) return;

        const newBrick: BrickData = {
            id: cellKey(snapped.x, snapped.y, snapped.z),
            x: snapped.x,
            y: snapped.y,
            z: snapped.z,
            color: selectedColor,
            type: selectedType,
        };

        setBricks((prev) => {
            const next = [...prev, newBrick];
            onSnap?.(newBrick, prev.length);
            return next;
        });
    }

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Canvas
                camera={{ position: [10, 10, 10], fov: 50 }}
                shadows
                style={{ width: "100%", height: "100%", background: "#F1F2F4" }}
            >
                <ambientLight intensity={0.9} />
                <directionalLight position={[10, 20, 10]} intensity={0.5} castShadow />

                <Baseplate size={BOARD_SIZE} />
                <FloorPlane size={BOARD_SIZE} onPointerMove={handlePointerMove} onPointerDown={handlePointerDown} />

                {bricks.map((brick) => (
                    <Brick key={brick.id} {...brick} />
                ))}

                <OrbitControls
                    makeDefault
                    mouseButtons={{
                        LEFT: undefined as unknown as THREE.MOUSE,
                        MIDDLE: THREE.MOUSE.DOLLY,
                        RIGHT: THREE.MOUSE.ROTATE,
                    }}
                />
            </Canvas>
        </div>
    );
}
