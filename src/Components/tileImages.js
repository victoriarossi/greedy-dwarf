import pathTexture from "../imgs/floor-tiles.png";
import villageTexture from "../imgs/dwarvenvillage3.png";
import mountainTexture1 from "../imgs/M1.png";
import mountainTexture2 from "../imgs/M2.png";
import mountainTexture3 from "../imgs/M44.png";
import caveTexture from "../imgs/escape.png";
import lavaTexture from "../imgs/lava.png";
import forestTexture from "../imgs/forest.png";
import waterTexture from "../imgs/water.png";
import grassTexture from "../imgs/grass.png";
import rockTexture from "../imgs/rock.png";
import desertTexture from "../imgs/desert.png";
import jungleTexture from "../imgs/foliage2.png";
import tallgrassTexture from "../imgs/tallgrass2.png";
import dungeonTexture from "../imgs/dungeon.png";
import crossroadsTexture from "../imgs/crossroads.png";
import junglecityTexture from "../imgs/junglecity.png";
import warriorDwarfTexture from "../imgs/dwarf.png";
import scoutDwarfTexture from "../imgs/scout_dwarf.png";
import minerDwarfTexture from "../imgs/miner_dwarf.png";
import treasureTexture from "../imgs/treasure.png";
import doorTexture from "../imgs/door.png";
import dragonTexture from "../imgs/dragon.png";
import ruby from "../imgs/ruby.png";
import gold from "../imgs/gold.png";
import sword from "../imgs/sword.png";
import diamond from "../imgs/diamond.png";
import armor from "../imgs/armor.png";
import shield from "../imgs/shield.png";
import potion from "../imgs/potion.png";
import ring from "../imgs/ring.png";
import keyTexture from "../imgs/Key.png";
import jungleHouse from "../imgs/mayanHouse1.png";
import mexicanSoil from "../imgs/mexicanSoil1.png";
import sand from "../imgs/desert.png";
import mayanPyramid from "../imgs/mayanPyramid.png"
import crossRoadsPath from "../imgs/crossroadPath.png"
import fountain from "../imgs/fountain.png"
import crossRoadHouse from "../imgs/medievalHouse.png"
import farmLand from "../imgs/farmLand1.png"
import pillar from "../imgs/pillar1.png"
import stalactites from "../imgs/stalactites.png"
import stalactites2 from "../imgs/stalactites2.png"
import wallChains1 from "../imgs/wallChains2.png"
import wallChains2 from "../imgs/wallChains3.png"
import emerald from "../imgs/emerald.png"
import crown from "../imgs/crown.png"
import scroll from "../imgs/scroll.png"
import dragonEgg from "../imgs/dragonegg.png"

// Function to get the image based on the map tile type
export const getTileImage = (tile, selectedCharacter = null) => {
    switch (tile) {
        case "V":
            return villageTexture;
        case "1":
            return mountainTexture1;
        case "2":
            return mountainTexture2;
        case "3":
            return mountainTexture3;
        case "E":
            return caveTexture;
        case "L":
            return lavaTexture;
        case "F":
            return forestTexture;
        case "W":
            return waterTexture;
        case "P":
            return pathTexture;
        case "R":
            return rockTexture;
        case "S":
            return desertTexture;
        case "J":
            return jungleTexture;
        case "G":
            return tallgrassTexture;
        case "A":
            return dungeonTexture;
        case "C":
            return crossroadsTexture;
        case "X":
            return junglecityTexture;
        case "D":
            if (selectedCharacter) {
                switch (selectedCharacter.name) {
                    case 'Miner Dwarf':
                        return minerDwarfTexture;
                    case 'Scout Dwarf':
                        return scoutDwarfTexture;
                    case 'Warrior Dwarf':
                    default:
                        return warriorDwarfTexture;
                }
            }
            return warriorDwarfTexture;
        case "T":
            return treasureTexture;
        case "ruby":
            return ruby;
        case "gold":
            return gold;
        case "sword":
            return sword;
        case "diamond":
            return diamond;
        case "armor":
            return armor;
        case "shield":
            return shield;
        case "potion":
            return potion;
        case "ring":
            return ring;
        
        // UPDATE THESE RETURNS STATEMENTS
        case "IE":
            return emerald;
        case "IC":
            return crown;
        case "IM":
            return scroll;
        case "ID":
            return dragonEgg;
        case "K1":
        case "K2":
        case "K3":
        case "K4":
            return keyTexture;
        case "B1":
        case "B2":
        case "B3":
        case "B4":
            return doorTexture;
        case "DR":
            return dragonTexture;
        // Jungle assets start here
        case "jH":
            return jungleHouse;
        case "jS":
            return mexicanSoil;
        case "jG":
            return sand;
        case "H":
            return mayanPyramid;
        // Jungle assets end here
        // Crossroads assets start here
        case "sP":
            return crossRoadsPath;
        case "cF":
            return fountain;
        case "cH":
            return crossRoadHouse;
        case "cL":
            return farmLand;
        // Crossroads assets end here
        // Dragon lair assets start here
        case "dP":
            return pillar;
        case "d1":
            return stalactites;
        case "d2":
            return stalactites2;
        case "c1":
            return wallChains1;
        case "c2":
            return wallChains2;
        // Dragon lair assets end here
        default:
            return grassTexture; // Default to grass
    }
};
