import { 
  calculateConcrete,
  calculateSoilBearing,
  calculateHydrology,
  calculateTraffic
} from "./src/lib/physics/models";

console.log("=== CONCRETE ===");
console.log(calculateConcrete(25, 15));

console.log("\n=== HYDROLOGY ===");
console.log(calculateHydrology(50, 10, 0.65));

console.log("\n=== SOIL BEARING ===");
console.log(calculateSoilBearing(1.0, 20.0, 15.0));

console.log("\n=== TRAFFIC ===");
console.log(calculateTraffic(2500, 2));

