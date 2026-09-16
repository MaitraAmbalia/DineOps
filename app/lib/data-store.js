/**
 * CENTRALIZED DATA STORE
 * 
 * This file replaces hardcoded mock data in components.
 * It strictly adheres to the schemas defined in schemas.js.
 */
import { calculateMargin, classifyMenuItems, getStrategicCombos } from "./revenue-engine";

// Initial Menu Data
export const INITIAL_MENU = [
    {
        foodId: "mcd_101",
        name: "McVeggie Burger",
        price: 120,
        cost: 35,
        margin: 75,
        opCost: 10,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [4500, 4032, 657],
        spiceLevel: 2,
        ingredients: [{ name: "Veggie Patty", quantity: "1", unit: "pcs" }, { name: "Lettuce", quantity: "20", unit: "g" }],
        variants: [{ name: "Regular", price: 120 }],
        addons: [{ name: "Extra Cheese", price: 25 }],
        status: true
    },
    {
        foodId: "mcd_102",
        name: "McChicken",
        price: 135,
        cost: 50,
        margin: 73,
        opCost: 12,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [4200, 3234, 2013],
        spiceLevel: 1,
        ingredients: [{ name: "Chicken Patty", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Regular", price: 135 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_103",
        name: "Maharaja Mac (Veg)",
        price: 210,
        cost: 75,
        margin: 115,
        opCost: 20,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [1200, 943, 873],
        spiceLevel: 3,
        ingredients: [{ name: "Double Veg Patty", quantity: "2", unit: "pcs" }],
        variants: [{ name: "Regular", price: 210 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_104",
        name: "Maharaja Mac (Chicken)",
        price: 235,
        cost: 95,
        margin: 118,
        opCost: 22,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [1500, 2031, 2543],
        spiceLevel: 3,
        ingredients: [{ name: "Double Chicken Patty", quantity: "2", unit: "pcs" }],
        variants: [{ name: "Regular", price: 235 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_105",
        name: "French Fries (L)",
        price: 110,
        cost: 18,
        margin: 77,
        opCost: 15,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [6000, 6034, 1038],
        spiceLevel: 1,
        ingredients: [{ name: "Potato", quantity: "200", unit: "g" }],
        variants: [{ name: "Large", price: 110 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_106",
        name: "McNuggets (6pc)",
        price: 170,
        cost: 65,
        margin: 90,
        opCost: 15,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [2100, 1032, 4937],
        spiceLevel: 1,
        ingredients: [{ name: "Chicken Nuggets", quantity: "6", unit: "pcs" }],
        variants: [{ name: "6 pcs", price: 170 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_107",
        name: "Pizza McPuff",
        price: 55,
        cost: 15,
        margin: 32,
        opCost: 8,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [3800, 5492, 5301],
        spiceLevel: 2,
        ingredients: [{ name: "Vegetable Stuffing", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Regular", price: 55 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_108",
        name: "McAloo Tikki",
        price: 70,
        cost: 20,
        margin: 40,
        opCost: 10,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [7200, 8321, 971],
        spiceLevel: 2,
        ingredients: [{ name: "Aloo Patty", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Regular", price: 70 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_109",
        name: "Coke (M)",
        price: 90,
        cost: 8,
        margin: 80,
        opCost: 2,
        category: "Beverage",
        isVeg: true,
        dietType: "jain",
        orderHistory: [8500, 9233, 1032],
        spiceLevel: 0,
        ingredients: [{ name: "Coke Syrup", quantity: "1", unit: "unit" }],
        variants: [{ name: "Medium", price: 90 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_110",
        name: "Cold Coffee",
        price: 130,
        cost: 30,
        margin: 85,
        opCost: 15,
        category: "Beverage",
        isVeg: true,
        dietType: "veg",
        orderHistory: [2800, 933, 742],
        spiceLevel: 0,
        ingredients: [{ name: "Coffee", quantity: "1", unit: "unit" }],
        variants: [{ name: "Regular", price: 130 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_111",
        name: "Soft Serve (Cone)",
        price: 35,
        cost: 8,
        margin: 22,
        opCost: 5,
        category: "Dessert",
        isVeg: true,
        dietType: "jain",
        orderHistory: [5000, 5034, 4932],
        spiceLevel: 0,
        ingredients: [{ name: "Milk Base", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 35 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_112",
        name: "McFlurry Oreo",
        price: 115,
        cost: 40,
        margin: 65,
        opCost: 10,
        category: "Dessert",
        isVeg: true,
        dietType: "veg",
        orderHistory: [1900, 2001, 4500],
        spiceLevel: 0,
        ingredients: [{ name: "Soft Serve", quantity: "1", unit: "unit" }, { name: "Oreo Crumbs", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 115 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_113",
        name: "Filet-O-Fish",
        price: 165,
        cost: 85,
        margin: 65,
        opCost: 15,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [800, 853, 875],
        spiceLevel: 1,
        ingredients: [{ name: "Fish Patty", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 165 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_114",
        name: "Chicken Wings (2pc)",
        price: 140,
        cost: 70,
        margin: 52,
        opCost: 18,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [1100, 1283, 1433],
        spiceLevel: 2,
        ingredients: [{ name: "Chicken Wings", quantity: "2", unit: "pcs" }],
        variants: [{ name: "Standard", price: 140 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_115",
        name: "Veg McMuffin",
        price: 100,
        cost: 30,
        margin: 58,
        opCost: 12,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [900, 923, 1009],
        spiceLevel: 1,
        ingredients: [{ name: "Muffin", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 100 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_116",
        name: "Egg McMuffin",
        price: 110,
        cost: 35,
        margin: 63,
        opCost: 12,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [1150, 1223, 5932],
        spiceLevel: 1,
        ingredients: [{ name: "Egg", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 110 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_117",
        name: "Hashbrown",
        price: 50,
        cost: 12,
        margin: 28,
        opCost: 10,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [2400, 3412, 623],
        spiceLevel: 2,
        ingredients: [{ name: "Potato Hub", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 50 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_118",
        name: "Wrap (Grilled Veg)",
        price: 180,
        cost: 65,
        margin: 97,
        opCost: 18,
        category: "Snack",
        isVeg: true,
        dietType: "veg",
        orderHistory: [700, 823, 3023],
        spiceLevel: 3,
        ingredients: [{ name: "Wrap Sheet", quantity: "1", unit: "pcs" }, { name: "Veg Hub", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 180 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_119",
        name: "Wrap (Grilled Chicken)",
        price: 210,
        cost: 85,
        margin: 105,
        opCost: 20,
        category: "Snack",
        isVeg: false,
        dietType: "non-veg",
        orderHistory: [950, 1203, 2991],
        spiceLevel: 3,
        ingredients: [{ name: "Chicken HUB", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 210 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_120",
        name: "Hot Fudge Sundae",
        price: 105,
        cost: 35,
        margin: 65,
        opCost: 5,
        category: "Dessert",
        isVeg: true,
        dietType: "veg",
        orderHistory: [2300, 2383, 991],
        spiceLevel: 0,
        ingredients: [{ name: "Chocolate Syrup", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 105 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_121",
        name: "Chocolate Shake",
        price: 140,
        cost: 40,
        margin: 90,
        opCost: 10,
        category: "Beverage",
        isVeg: true,
        dietType: "veg",
        orderHistory: [3500, 5932, 1483],
        spiceLevel: 0,
        ingredients: [{ name: "Milk", quantity: "200", unit: "ml" }],
        variants: [{ name: "Standard", price: 140 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_122",
        name: "Iced Tea",
        price: 70,
        cost: 20,
        margin: 45,
        opCost: 5,
        category: "Beverage",
        isVeg: true,
        dietType: "jain",
        orderHistory: [1500, 732, 3012],
        spiceLevel: 0,
        ingredients: [{ name: "Tea Infusion", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 70 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_123",
        name: "Caramel Sundae",
        price: 120,
        cost: 30,
        margin: 80,
        opCost: 10,
        category: "Dessert",
        isVeg: true,
        dietType: "veg",
        orderHistory: [2800, 4783, 5321],
        spiceLevel: 0,
        ingredients: [{ name: "Caramel Syrup", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 120 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_124",
        name: "Apple Pie",
        price: 90,
        cost: 30,
        margin: 50,
        opCost: 10,
        category: "Dessert",
        isVeg: true,
        dietType: "veg",
        orderHistory: [1200, 3742, 983],
        spiceLevel: 0,
        ingredients: [{ name: "Apple Filling", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 90 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_125",
        name: "Bottled Water",
        price: 40,
        cost: 10,
        margin: 25,
        opCost: 5,
        category: "Beverage",
        isVeg: true,
        dietType: "jain",
        orderHistory: [4500, 6734, 3231],
        spiceLevel: 0,
        ingredients: [{ name: "Mineral Water", quantity: "1", unit: "unit" }],
        variants: [{ name: "Standard", price: 40 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_126",
        name: "Extra Cheese",
        price: 25,
        cost: 10,
        margin: 13,
        opCost: 2,
        category: "Add-on",
        isVeg: true,
        dietType: "veg",
        orderHistory: [4000, 912, 2032],
        spiceLevel: 0,
        ingredients: [{ name: "Cheese Slice", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 25 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_127",
        name: "Extra Tomato",
        price: 15,
        cost: 5,
        margin: 8,
        opCost: 2,
        category: "Add-on",
        isVeg: true,
        dietType: "jain",
        orderHistory: [1000, 2636, 4022],
        spiceLevel: 0,
        ingredients: [{ name: "Tomato Slice", quantity: "1", unit: "pcs" }],
        variants: [{ name: "Standard", price: 15 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_128",
        name: "Extra Lettuce",
        price: 15,
        cost: 5,
        margin: 8,
        opCost: 2,
        category: "Add-on",
        isVeg: true,
        dietType: "jain",
        orderHistory: [900, 2173, 3021],
        spiceLevel: 0,
        ingredients: [{ name: "Lettuce", quantity: "10", unit: "g" }],
        variants: [{ name: "Standard", price: 15 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_129",
        name: "Extra Olives",
        price: 20,
        cost: 8,
        margin: 10,
        opCost: 2,
        category: "Add-on",
        isVeg: true,
        dietType: "jain",
        orderHistory: [600, 781, 942],
        spiceLevel: 0,
        ingredients: [{ name: "Olives", quantity: "5", unit: "g" }],
        variants: [{ name: "Standard", price: 20 }],
        addons: [],
        status: true
    },
    {
        foodId: "mcd_130",
        name: "Extra Onions",
        price: 10,
        cost: 3,
        margin: 5,
        opCost: 2,
        category: "Add-on",
        isVeg: true,
        dietType: "veg",
        orderHistory: [1100, 1332, 1003],
        spiceLevel: 0,
        ingredients: [{ name: "Onions", quantity: "10", unit: "g" }],
        variants: [{ name: "Standard", price: 10 }],
        addons: [],
        status: true
    }
];

export const CATEGORIES = [
    { id: "all", name: "All Items", icon: "LayoutGrid" },
    { id: "snack", name: "Snack", icon: "Utensils" },
    { id: "beverage", name: "Beverage", icon: "Coffee" },
    { id: "dessert", name: "Dessert", icon: "IceCream" },
    { id: "combos", name: "Combos", icon: "ShoppingBag" }
];

// Mock Restaurant Data
export const MOCK_RESTAURANT = {
    name: "The Gourmet Voice Bistro",
    address: "123 AI Lane, Tech City, 560001",
    cuisine: "Modern International",
    contact: "+1 234 567 890"
};

/**
 * Processed Menu Data with Revenue Intelligence
 */
const avgMargin = INITIAL_MENU.reduce((acc, i) => acc + (i.price - i.cost), 0) / INITIAL_MENU.length;
const avgPopularity = 2500; // Updated median popularity for the thousand-scale dataset

export const PROCESSED_MENU = classifyMenuItems(INITIAL_MENU, avgMargin, avgPopularity);
export const STRATEGIC_COMBOS = getStrategicCombos(PROCESSED_MENU);

// 15-Day Revenue Data for Charts
export const REVENUE_HISTORY = Array.from({ length: 15 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (14 - i));

    // Smoother trend with minimal daily variation
    const baseRevenue = 5200;
    const trend = Math.sin(i * 0.5) * 400; // Gentle weekly wave
    const revenue = baseRevenue + trend + (Math.random() * 200 - 100);
    const profit = revenue * 0.35 + (Math.random() * 50 - 25);
    const costs = revenue - profit;

    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: Number(revenue.toFixed(2)),
        profit: Number(profit.toFixed(2)),
        costs: Number(costs.toFixed(2)),
        orders: Math.floor(110 + trend / 15 + (Math.random() * 6 - 3)),
    };
});

// Live Stats Initial State
export const LIVE_STATS = {
    todayOrders: 142,
    totalCalls: 185,
    aiSuccessRate: 94.5,
    activeTables: 12,
    totalRevenue: "₹5,240.00"
};

// Mock Auth Users
export const USERS = [
    { id: "1", name: "Admin User", email: "admin@dineops.com", role: "ADMIN" },
    { id: "2", name: "Staff Member", email: "staff@dineops.com", role: "STAFF" },
];

// Call Analytics Data
export const CALL_ANALYTICS = {
    totalCalls: 458,
    successfulCalls: 412,
    humanTransfers: 26,
    pendingCallbacks: 8,
    avgCallDuration: "1m 42s"
};

// Live Voice Order History
export const VOICE_ORDERS = [
    {
        id: "VO_1001",
        time: "10:30 AM",
        customer: "Rahul Sharma",
        phoneNumber: "+91 98765 43210",
        transactionId: "TXN_998271",
        invoiceNo: "INV-2024-001",
        transcript: "Ek Classic Burger aur do Coke dena please.",
        structuredJson: {
            items: [{ name: "Classic Burger", qty: 1, price: 12.00 }, { name: "Coke", qty: 2, price: 3.00 }],
            total: 18.00
        },
        status: "COMPLETED", // CALL status
        kotStatus: "PENDING", // KOT status
        aiUpsell: "Suggested Truffle Fries (Accepted)",
        callType: "AI_SUCCESS"
    },
    {
        id: "VO_1002",
        time: "10:45 AM",
        customer: "Priya Singh",
        phoneNumber: "+91 98234 56789",
        transactionId: "TXN_998272",
        invoiceNo: "INV-2024-002",
        transcript: "Mujhe ek Margherita Pizza chahiye medium size, aur extra cheese add kar dena.",
        structuredJson: {
            items: [{ name: "Margherita Pizza", qty: 1, variant: "Medium", price: 15.00, addons: ["Extra Cheese"] }],
            total: 17.00
        },
        status: "COMPLETED",
        kotStatus: "PREPARING",
        aiUpsell: "Suggested Garlic Bread (Rejected)",
        callType: "AI_SUCCESS"
    },
    {
        id: "VO_1003",
        time: "11:05 AM",
        customer: "Amit Verma",
        phoneNumber: "+91 91234 56789",
        transactionId: "TXN_998273",
        invoiceNo: "INV-2024-003",
        transcript: "Hello, I want to order... wait, is this a robot?",
        structuredJson: {
            items: [],
            total: 0
        },
        status: "TRANSFERRED",
        kotStatus: "NONE",
        aiUpsell: "None",
        callType: "HUMAN_TRANSFER"
    },
    {
        id: "VO_1004",
        time: "11:15 AM",
        customer: "Suresh Mehra",
        phoneNumber: "+91 99887 76655",
        transactionId: "TXN_998274",
        invoiceNo: "INV-2024-004",
        transcript: "Call disconnect ho gaya tha, please call back karein.",
        structuredJson: {
            items: [],
            total: 0
        },
        status: "PENDING_CALLBACK",
        kotStatus: "NONE",
        aiUpsell: "None",
        callType: "CALLBACK"
    }
];
// Mock Team Members
export const TEAM_MEMBERS = [
    { id: 1, name: "Jackson", role: "Manager", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jackson" },
    { id: 2, name: "James David", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
    { id: 3, name: "Adam Mccall", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adam" },
    { id: 4, name: "Keon Gregg", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Keon" },
    { id: 5, name: "Warren Daniel", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Warren" },
    { id: 6, name: "Elsie Bond", role: "Service Male", status: "Absent", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elsie" },
    { id: 7, name: "Alabas", role: "Service Male", status: "Present", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alabas" },
];
