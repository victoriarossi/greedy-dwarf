import React from 'react';
import { getTileImage } from './tileImages';
import grassTexture from "../imgs/grass.png";

// Tiles that should not be grouped
const nonGroupableTiles = ["F", "G", "J", "S", "P", "D", "T", "B1", "B2", "B3", "B4", "jS", "jG", "sP"];

const MapRenderer = ({ map, tileSize, dragonPosition, selectedCharacter }) => {
    const tilesProcessed = new Set();
    const gridItems = [];
    const imagesToRender = [];

    const numRows = map.length;
    const numCols = map[0].length;

    // Helper function to perform flood fill and group adjacent tiles
    const floodFill = (startRow, startCol, tileType) => {
        if (nonGroupableTiles.includes(tileType)) {
            tilesProcessed.add(`${startRow}-${startCol}`);
            return [{ row: startRow, column: startCol }];
        }
        const stack = [{ row: startRow, col: startCol }];
        const groupTiles = [];

        while (stack.length > 0) {
            const { row, col } = stack.pop();
            const key = `${row}-${col}`;

            if (row >= 0 && row < numRows && col >= 0 && col < numCols && !tilesProcessed.has(key) && map[row][col] === tileType) {
                tilesProcessed.add(key);
                groupTiles.push({ row, col });

                // Add adjacent tiles to the stack
                stack.push({ row: row - 1, col }); // Up
                stack.push({ row: row + 1, col }); // Down
                stack.push({ row, col: col - 1 }); // Left
                stack.push({ row, col: col + 1 }); // Right
            }
        }
        return groupTiles;
    };

    // First pass: identify groups and prepare images to render
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            const key = `${rowIndex}-${colIndex}`;

            if (!tilesProcessed.has(key)) {
                const tileType = map[rowIndex][colIndex];

                if (tileType !== "" && tileType !== "x") {
                    // Group adjacent tiles of the same type
                    const groupTiles = floodFill(rowIndex, colIndex, tileType);

                    if (nonGroupableTiles.includes(tileType)) {
                        if (tileType === "D" || tileType === "T" || tileType.startsWith("B")) {
                            // Render the path tile first
                            const pathTileImage = getTileImage("P");
                            gridItems.push(
                                <img
                                    key={`path-${rowIndex}-${colIndex}`}
                                    src={pathTileImage}
                                    alt="Path Tile"
                                    className="map-tile"
                                    style={{
                                        position: "absolute",
                                        left: colIndex * tileSize,
                                        top: rowIndex * tileSize,
                                        width: tileSize,
                                        height: tileSize,
                                        zIndex: 1,
                                    }}
                                />
                            );
                            // Then render the special tile on top
                            const tileImage = getTileImage(tileType);
                            gridItems.push(
                                <img
                                    key={`tile-${tileType}-${rowIndex}-${colIndex}`}
                                    src={tileImage}
                                    alt={
                                        tileType === "D" ? "Dwarf" : tileType === "T" ? "Treasure" : "Door"
                                    }
                                    className="map-tile"
                                    style={{
                                        position: "absolute",
                                        left: colIndex * tileSize,
                                        top: rowIndex * tileSize,
                                        width: tileSize,
                                        height: tileSize,
                                        zIndex: 2,
                                    }}
                                />
                            );
                        } else {
                            // Regular non-groupable tile
                            const tileImage = getTileImage(tileType);
                            gridItems.push(
                                <img
                                    key={`tile-${tileType}-${rowIndex}-${colIndex}`}
                                    src={tileImage}
                                    alt="Tile"
                                    className="map-tile"
                                    style={{
                                        position: "absolute",
                                        left: colIndex * tileSize,
                                        top: rowIndex * tileSize,
                                        width: tileSize,
                                        height: tileSize,
                                    }}
                                />
                            );
                        }
                    } else {
                        // Calculate bounding box for groupable tiles
                        const rows = groupTiles.map((tile) => tile.row);
                        const cols = groupTiles.map((tile) => tile.col);
                        const minRow = Math.min(...rows);
                        const maxRow = Math.max(...rows);
                        const minCol = Math.min(...cols);
                        const maxCol = Math.max(...cols);

                        const imageWidthInTiles = maxCol - minCol + 1;
                        const imageHeightInTiles = maxRow - minRow + 1;

                        // Add grass tiles for the area covered
                        for (let r = minRow; r <= maxRow; r++) {
                            for (let c = minCol; c <= maxCol; c++) {
                                gridItems.push(
                                    <img
                                        key={`grass-${r}-${c}`}
                                        src={grassTexture}
                                        alt="Grass"
                                        className="map-tile"
                                        style={{
                                            position: "absolute",
                                            left: c * tileSize,
                                            top: r * tileSize,
                                            width: tileSize,
                                            height: tileSize,
                                        }}
                                    />
                                );
                            }
                        }

                        // Add the image to render
                        imagesToRender.push({
                            key: `${tileType}-${minRow}-${minCol}`,
                            src: getTileImage(tileType),
                            left: minCol * tileSize,
                            top: minRow * tileSize,
                            width: imageWidthInTiles * tileSize,
                            height: imageHeightInTiles * tileSize,
                        });
                    }
                } else if (tileType === "") {
                    // Render grass tile
                    gridItems.push(
                        <img
                            key={`grass-${rowIndex}-${colIndex}`}
                            src={grassTexture}
                            alt="Grass"
                            className="map-tile"
                            style={{
                                position: "absolute",
                                left: colIndex * tileSize,
                                top: rowIndex * tileSize,
                                width: tileSize,
                                height: tileSize,
                            }}
                        />
                    );
                    tilesProcessed.add(key);
                }
            }
        }
    }

    // Render images over the floor tiles
    imagesToRender.forEach((image) => {
        gridItems.push(
            <img
                key={image.key}
                src={image.src}
                alt="Tile"
                className="map-large-tile"
                style={{
                    position: "absolute",
                    left: image.left,
                    top: image.top,
                    width: image.width,
                    height: image.height,
                }}
            />
        );
    });

    // Render dwarf based on SelectedCharacter
    map.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
            if (tile === 'D') {
                // Render the path tile first
                const pathTileImage = getTileImage('P');
                gridItems.push(
                    <img
                        key={`path-${rowIndex}-${colIndex}`}
                        src={pathTileImage}
                        alt="Path Tile"
                        className="map-tile"
                        style={{
                            position: 'absolute',
                            left: colIndex * tileSize,
                            top: rowIndex * tileSize,
                            width: tileSize,
                            height: tileSize,
                            zIndex: 1,
                        }}
                    />
                );
                // Then render the dwarf tile with the selected character's image
                const tileImage = getTileImage(tile, selectedCharacter);
                gridItems.push(
                    <img
                        key={`tile-${tile}-${rowIndex}-${colIndex}`}
                        src={tileImage}
                        alt="Dwarf"
                        className="map-tile"
                        style={{
                            position: 'absolute',
                            left: colIndex * tileSize,
                            top: rowIndex * tileSize,
                            width: tileSize,
                            height: tileSize,
                            zIndex: 2,
                        }}
                    />
                );
            }
        });
    });

    // Render dragon based on dragonPosition
    if (dragonPosition) {
        gridItems.push(
            <img
                key={`dragon-${dragonPosition.row}-${dragonPosition.col}`}
                src={getTileImage("DR")}
                alt="Dragon"
                className="map-tile"
                style={{
                    position: "absolute",
                    left: dragonPosition.col * tileSize,
                    top: dragonPosition.row * tileSize,
                    width: tileSize,
                    height: tileSize,
                    zIndex: 2
                }}
            />
        );
    }
    
    return (
        <div
            className="map-container"
            style={{
                position: "relative",
                width: numCols * tileSize,
                height: numRows * tileSize,
            }}>
            {gridItems}
        </div>
    );
};

export default MapRenderer;
