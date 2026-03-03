export const UNIT = 1;
export const STUD_HEIGHT = 0.4;

export const BRICK_DIMS: Record<string, { w: number; d: number }> = {
    "1x1": { w: 1, d: 1 },
    "1x2": { w: 1, d: 2 },
    "2x2": { w: 2, d: 2 },
    "2x4": { w: 2, d: 4 },
};

// Converts integer grid coordinates to a Three.js world-space position tuple; called when positioning a brick mesh in the scene.
export function gridToWorld(x: number, y: number, z: number): [number, number, number] {
    return [
        x * UNIT,
        y * STUD_HEIGHT + STUD_HEIGHT / 2,
        z * UNIT,
    ];
}

// Converts a raw raycaster intersection point (float world coords) to snapped integer grid coordinates; called on mouse move/click to determine which cell the cursor is targeting.
export function snapToGrid(point: { x: number; y: number; z: number }): { x: number; y: number; z: number } {
    return {
        x: Math.round(point.x / UNIT),
        y: Math.round(point.y / STUD_HEIGHT),
        z: Math.round(point.z / UNIT),
    };
}

// Returns a deterministic string key for a grid position; used as React key props on brick components and as map keys when storing brick data.
export function cellKey(x: number, y: number, z: number): string {
    return `${x}:${y}:${z}`;
}

// Checks whether any brick in the scene already occupies a given grid cell; called before placing a new brick to prevent overlapping placements.
export function isCellOccupied(
    bricks: Array<{ x: number; y: number; z: number }>,
    x: number,
    y: number,
    z: number
): boolean {
    return bricks.some((b) => b.x === x && b.y === y && b.z === z);
}

// Returns all grid cells a brick occupies based on its origin and type; used by wouldOverlap and for future highlight logic.
export function getOccupiedCells(
    x: number,
    y: number,
    z: number,
    type: "1x1" | "1x2" | "2x2" | "2x4"
): Array<{ x: number; y: number; z: number }> {
    const dims = BRICK_DIMS[type];
    const cells: Array<{ x: number; y: number; z: number }> = [];
    for (let dx = 0; dx < dims.w; dx++) {
        for (let dz = 0; dz < dims.d; dz++) {
            cells.push({ x: x + dx, y, z: z + dz });
        }
    }
    return cells;
}

// Checks if any cell a new brick would occupy is already taken; replaces isCellOccupied for size-aware collision detection.
export function wouldOverlap(
    bricks: Array<{ x: number; y: number; z: number; type: "1x1" | "1x2" | "2x2" | "2x4" }>,
    x: number,
    y: number,
    z: number,
    type: "1x1" | "1x2" | "2x2" | "2x4"
): boolean {
    const incomingCells = getOccupiedCells(x, y, z, type);
    return bricks.some((brick) => {
        const existingCells = getOccupiedCells(brick.x, brick.y, brick.z, brick.type);
        return incomingCells.some((ic) =>
            existingCells.some((ec) => ec.x === ic.x && ec.y === ic.y && ec.z === ic.z)
        );
    });
}
