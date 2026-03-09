"use client";

// Renders a single placed Lego brick — body + studs. Click to stack a new brick on top.

import { ThreeEvent } from "@react-three/fiber";
import { snapToGrid } from "./Workspace";
import { DragControls, OrbitControls } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";


interface BrickProps {
    position: [number, number, number];
    dimensions: [number, number, number]; // [width, height, depth]
    color: string;
    currentTool: [number, number, number];
    onPlaceBrick?: (x: number, y: number, z: number, newDims: [number, number, number]) => void;
    onDelete?: () => void;
}

export function Brick({ position, dimensions, color, currentTool, onPlaceBrick, onDelete }: BrickProps) {

    const [dims, setDims] = useState<[number, number, number]>(dimensions);
    const [pos, setPos] = useState<[number, number, number]>(position);
    const [w, h, d] = dims;


    //For differentiating drag and place block
    const pointerStartPos = useRef<{ x: number, y: number } | null>(null);
    const startPos = useRef<[number, number, number]>(position)


    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isMoved, setIsMoved] = useState<boolean>(false);

    const studs: { sx: number; sz: number }[] = [];
    for (let col = 0; col < w; col++) {
        for (let row = 0; row < d; row++) {
            studs.push({ sx: col - (w - 1) / 2, sz: row - (d - 1) / 2 });
        }
    }

    // Rotate brick when pressing R key
        const rotateBrick = () => {
        setDims(([W, H, D]) => [D, H, W]); // Swap X/Z, keep Y
            //If a brick is even/even or odd/odd, it rotates fine. This is for odd x even blocks
            if ((dimensions[0] + dimensions[2])%2 != 0){
                if (isMoved){
                    setPos(prev => [prev[0] + 0.5, prev[1], prev[2] + 0.5]);
                } else {
                    setPos(prev => [prev[0] - 0.5, prev[1], prev[2] - 0.5]);
                }
            }
            setIsMoved(!isMoved);
        }

        useEffect(() => {
            const handleKeyDown = (e: globalThis.KeyboardEvent) => {
                if (e.key.toLowerCase() === "r" && (isHovered || isDragging)) {
                    rotateBrick();
                }
            };
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }, [isHovered, isDragging, dims, isMoved]);


    //Move brick up-down Y axis using wheel when dragging
        useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if (isDragging) {
                // Prevent the whole page or OrbitControls from scrolling
                e.preventDefault(); 
                
                setPos(([x, y, z]) => {
                    // Adjust height by the brick's height (h)
                    const direction = e.deltaY > 0 ? -h : h;
                    const newY = Math.max(0.5,Math.min(10, y + direction)); // Don't go below baseplate or above 10 blocks
                    startPos.current[1] = newY;
                    return [x, newY, z];
                });
            }
        };
        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => window.removeEventListener("wheel", handleWheel);
        }, [isDragging, h]);



    //Handles all mouse functions IE place brick, delete brick, and checks for dragging
    function handlePointerUp(e: ThreeEvent<MouseEvent>) {
        if(!pointerStartPos.current) return;

        //Determine Cursor Position
        const dx = e.screenX - pointerStartPos.current.x;
        const dy = e.screenY - pointerStartPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        pointerStartPos.current = null;

        //Handle if Delete
        if (e.button === 2) {   // right click
            e.stopPropagation();
            if (onDelete) onDelete();
            return;
        }

        //Place brick 

        //If mouse has moved do NOT place brick! we are dragging
        const isClick = distance < 5 //5 px threshold

        if (isDragging || distance > 7) {
            setIsDragging(false);
            return;
        }

        if (e.button === 0){
            if (!e.face || !onPlaceBrick) return;

            e.stopPropagation();
            const { x, y, z } = e.point;
            const newX = snapToGrid(x + e.face.normal.x * 0.1, currentTool[0]);
            const newZ = snapToGrid(z + e.face.normal.z * 0.1, currentTool[2]);
            const newY = pos[1] + h / 2 + currentTool[1] / 2;
            onPlaceBrick(newX, newY, newZ, dims)
        }
    }

    
    //Used for drag controls
    function handlePointerDown(e:ThreeEvent<PointerEvent>){
        pointerStartPos.current = { x: e.screenX, y: e.screenY };
    }

    
    return (
        <DragControls
            axisLock="y" 
            // Manual transform handling to ensure snapping
            autoTransform={false} 
            onDragStart={() =>{
                startPos.current = [...pos];
                setIsDragging(true);
            }}

            onDrag={(localMatrix) => {
                // Extract X and Z from the local translation matrix (indices 12 and 14)
                const BASEPLATE_HALF = 5
                const xLimit = BASEPLATE_HALF - w / 2;
                const zLimit = BASEPLATE_HALF - d / 2;

                const targetX = startPos.current[0] + localMatrix.elements[12];
                const targetZ = startPos.current[2] + localMatrix.elements[14];

                const clampedX = THREE.MathUtils.clamp(targetX, -xLimit, xLimit);
                const clampedZ = THREE.MathUtils.clamp(targetZ, -zLimit, zLimit);
                
                setPos([
                    snapToGrid(clampedX,w),
                    startPos.current[1], //as when it entered, unless changed specifically
                    snapToGrid(clampedZ, d)
                ]);  
            }}
            onDragEnd={() => {
                // Small delay to ensure PointerUp fires before flag resets
                setTimeout(() => setIsDragging(false), 50);
            }}
        >
            <group 
                position={pos}
                onPointerOver={() => setIsHovered(true)}
                onPointerOut={() => setIsHovered(false)}
            >
                    <mesh 
                        castShadow 
                        receiveShadow 
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}
                        >
                        <boxGeometry args={[w, h, d]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                    {studs.map(({ sx, sz }, i) => (
                        <mesh 
                        key={i} position={[sx, h / 2 + 0.06, sz]} 
                        castShadow 
                        onPointerDown={handlePointerDown}
                        onPointerUp={handlePointerUp}>
                            <cylinderGeometry args={[0.18, 0.18, 0.12, 16]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                    ))}
            </group>
        </DragControls>
    );
}
