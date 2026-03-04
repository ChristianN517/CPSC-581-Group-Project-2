"use client";

import { ThreeEvent } from "@react-three/fiber";

interface FloorPlaneProps {
    onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
}

// Invisible floor plane to place the bricks
export function FloorPlane({ onPointerMove, onPointerDown }: FloorPlaneProps) {
    return (
        <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.02, 0]}
            onPointerMove={(e) => {
                e.stopPropagation();
                onPointerMove(e);
            }}
            onPointerDown={(e) => {
                e.stopPropagation();
                onPointerDown(e);
            }}
        >
            <planeGeometry args={[40, 40]} />
            <meshStandardMaterial visible={false} />
        </mesh>
    );
}
