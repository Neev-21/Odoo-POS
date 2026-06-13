export const INITIAL_CATEGORIES = [
  { id: "cat_1", name: "Beverages", color: "#3498db" },
  { id: "cat_2", name: "Pastries", color: "#e67e22" },
  { id: "cat_3", name: "Milkshakes", color: "#ff007f" },
  { id: "cat_4", name: "Burgers", color: "#e74c3c" },
  { id: "cat_5", name: "Sides", color: "#2ecc71" }
];

export const INITIAL_PRODUCTS = [
  // User specified products
  { id: "prod_1", category_id: "cat_1", name: "Espresso", price: 3.50 },
  { id: "prod_2", category_id: "cat_1", name: "Latte", price: 4.50 },
  { id: "prod_3", category_id: "cat_2", name: "Croissant", price: 4.00 },

  // Supplementary Beverages
  { id: "prod_cola", category_id: "cat_1", name: "Cherry Cola", price: 3.00 },
  { id: "prod_rootbeer", category_id: "cat_1", name: "Draft Root Beer", price: 3.25 },
  { id: "prod_icedcoffee", category_id: "cat_1", name: "Iced Coffee", price: 4.25 },

  // Supplementary Pastries
  { id: "prod_applepie", category_id: "cat_2", name: "Apple Pie", price: 5.50 },
  { id: "prod_donut", category_id: "cat_2", name: "Glazed Donut", price: 2.75 },
  { id: "prod_brownie", category_id: "cat_2", name: "Warm Fudge Brownie", price: 4.50 },

  // Milkshakes
  { id: "prod_vanillashake", category_id: "cat_3", name: "Classic Vanilla Shake", price: 5.00 },
  { id: "prod_chocshake", category_id: "cat_3", name: "Double Chocolate Malt", price: 5.50 },
  { id: "prod_strawberryshake", category_id: "cat_3", name: "Hazelnut Milkshake", price: 5.75 },

  // Burgers
  { id: "prod_cheeseburger", category_id: "cat_4", name: "Cheese Burger", price: 8.50 },
  { id: "prod_doubleburger", category_id: "cat_4", name: "Tandoori Cheese Burger", price: 10.95 },
  { id: "prod_dinerclub", category_id: "cat_4", name: "Double Grilled Cheese Sandwich", price: 7.95 },

  // Sides
  { id: "prod_fries", category_id: "cat_5", name: "Crispy Fries", price: 3.95 },
  { id: "prod_onionrings", category_id: "cat_5", name: "Golden Onion Rings", price: 4.50 },
  { id: "prod_mozzarella", category_id: "cat_5", name: "Mozzarella Glow Sticks", price: 5.50 }
];

export const INITIAL_TABLES = [
  "Table 1", "Table 2", "Table 3", "Table 4", "Table 5", "Table 6",
  "Table 7", "Table 8", "Table 9", "Table 10", "Table 11", "Table 12"
];

export const INITIAL_CUSTOMERS = [
  "Walk-in Customer",
  "John Doe",
  "Jane Smith",
  "Sarah Connor",
  "Tony Stark",
  "Bruce Wayne",
  "Peter Parker"
];
