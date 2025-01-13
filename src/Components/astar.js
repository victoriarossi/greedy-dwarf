// AStar.js
import { walkableTiles } from './constants';

class Node {
    constructor(row, col, g = 0, h = 0) {
        this.row = row;
        this.col = col;
        this.g = g; // Cost from start to current node
        this.h = h; // Estimated cost from current node to target
        this.f = g + h; // Total cost
        this.parent = null;
    }

    equals(other) {
        return this.row === other.row && this.col === other.col;
    }
}

// Manhattan distance heuristic
const heuristic = (row1, col1, row2, col2) => {
    return Math.abs(row1 - row2) + Math.abs(col1 - col2);
};

// Get walkable neighbors
const getNeighbors = (node, map) => {
    const directions = [
        { row: -1, col: 0 },  // up
        { row: 1, col: 0 },   // down
        { row: 0, col: -1 },  // left
        { row: 0, col: 1 }    // right
    ];

    return directions
        .map(dir => ({
            row: node.row + dir.row,
            col: node.col + dir.col
        }))
        .filter(pos => {
            // Check bounds
            if (pos.row < 0 || pos.row >= map.length || 
                pos.col < 0 || pos.col >= map[0].length) {
                return false;
            }
            
            // Check if walkable (including dwarf position and jungle paths)
            const tile = map[pos.row][pos.col];
            return walkableTiles.includes(tile) || tile === "D" || tile === "jP";
        });
};

export const findPath = (map, startPos, targetPos) => {
    const startNode = new Node(startPos.row, startPos.col);
    const targetNode = new Node(targetPos.row, targetPos.col);

    const openList = [startNode];
    const closedList = [];

    while (openList.length > 0) {
        // Find node with lowest f cost
        let currentNode = openList[0];
        let currentIndex = 0;
        
        openList.forEach((node, index) => {
            if (node.f < currentNode.f) {
                currentNode = node;
                currentIndex = index;
            }
        });

        // Remove current node from open list and add to closed list
        openList.splice(currentIndex, 1);
        closedList.push(currentNode);

        // Check if we reached the target
        if (currentNode.equals(targetNode)) {
            const path = [];
            let current = currentNode;
            
            while (current !== null) {
                path.unshift({ row: current.row, col: current.col });
                current = current.parent;
            }
            
            return path;
        }

        // Get neighbors
        const neighbors = getNeighbors(currentNode, map);

        for (const neighborPos of neighbors) {
            const neighbor = new Node(neighborPos.row, neighborPos.col);
            
            // Skip if neighbor is in closed list
            if (closedList.some(node => node.equals(neighbor))) {
                continue;
            }

            // Calculate costs
            const gCost = currentNode.g + 1;
            const hCost = heuristic(neighbor.row, neighbor.col, targetNode.row, targetNode.col);
            
            // Check if neighbor is in open list
            const openNode = openList.find(node => node.equals(neighbor));
            
            if (!openNode || gCost < openNode.g) {
                neighbor.g = gCost;
                neighbor.h = hCost;
                neighbor.f = gCost + hCost;
                neighbor.parent = currentNode;

                if (!openNode) {
                    openList.push(neighbor);
                }
            }
        }
    }

    // No path found
    return null;
};

// Helper function to get next move from the path
export const getNextMove = (map, currentPos, targetPos) => {
    const path = findPath(map, currentPos, targetPos);
    
    if (!path || path.length < 2) {
        return null;
    }

    // Return the next position in the path
    return path[1];
};