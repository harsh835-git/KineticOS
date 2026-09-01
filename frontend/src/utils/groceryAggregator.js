// src/utils/groceryAggregator.js

const VEGETARIAN_PROTEINS = [
  "paneer", "tofu", "greek yogurt", "curd", "milk", "soya chunks", "soya",
  "tempeh", "cottage cheese", "lentils", "dal", "chickpeas", "sprouts",
  "whey", "protein powder", "kidney beans", "rajma", "edamame", "beans"
];

const NON_VEGETARIAN_PROTEINS = [
  "chicken breast", "chicken", "eggs", "egg whites", "egg", "salmon",
  "fish", "tuna", "turkey", "lean beef", "shrimp", "mutton"
];

const GRAINS_AND_CARBS = [
  "rolled oats", "oats", "brown rice", "white rice", "rice", "quinoa",
  "sweet potato", "potatoes", "potato", "bread", "roti", "chapati",
  "pasta", "poha", "upma", "daliya"
];

const PRODUCE_AND_GREENS = [
  "spinach", "broccoli", "banana", "apples", "apple", "berries", "blueberries",
  "avocado", "cucumber", "tomatoes", "tomato", "salad greens", "carrots",
  "carrot", "bell peppers", "bell pepper", "onion", "lemon", "garlic", "ginger"
];

const HEALTHY_FATS_PANTRY = [
  "almonds", "walnuts", "peanut butter", "chia seeds", "flaxseeds",
  "olive oil", "ghee", "mustard oil", "coconut oil", "pumpkin seeds"
];

const collectAllStrings = (obj, strings = []) => {
  if (!obj) return strings;
  if (typeof obj === "string") {
    strings.push(obj.toLowerCase());
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => collectAllStrings(item, strings));
  } else if (typeof obj === "object") {
    Object.values(obj).forEach((val) => collectAllStrings(val, strings));
  }
  return strings;
};

export const generateGroceryList = (rawInput, preference = "non-vegetarian") => {
  if (!rawInput) return [];

  const allStrings = collectAllStrings(rawInput);
  const combinedText = allStrings.join(" ");

  const prefLower = (preference || "").toLowerCase();
  
  // Vegetarian unless explicitly specified as 'non'
  const isStrictlyVeg = !prefLower.includes("non");

  const categoriesConfig = [
    {
      category: isStrictlyVeg
        ? "Plant & Dairy Proteins (Vegetarian)"
        : "Lean Proteins & Seafood",
      keywords: isStrictlyVeg
        ? VEGETARIAN_PROTEINS
        : [...NON_VEGETARIAN_PROTEINS, ...VEGETARIAN_PROTEINS],
    },
    {
      category: "Complex Carbohydrates & Grains",
      keywords: GRAINS_AND_CARBS,
    },
    {
      category: "Fresh Produce & Greens",
      keywords: PRODUCE_AND_GREENS,
    },
    {
      category: "Healthy Fats & Pantry Essentials",
      keywords: HEALTHY_FATS_PANTRY,
    },
  ];

  const foundItems = new Map();

  categoriesConfig.forEach(({ category, keywords }) => {
    keywords.forEach((keyword) => {
      // If the athlete is strictly vegetarian, ignore animal protein keywords
      if (isStrictlyVeg && NON_VEGETARIAN_PROTEINS.includes(keyword)) {
        return;
      }

      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = combinedText.match(regex);

      if (matches && matches.length > 0) {
        const cleanKey = keyword.charAt(0).toUpperCase() + keyword.slice(1);
        foundItems.set(cleanKey, {
          id: cleanKey.toLowerCase().replace(/\s+/g, "-"),
          name: cleanKey,
          category,
          occurrences: matches.length,
        });
      }
    });
  });

  const categorized = {};
  categoriesConfig.forEach((c) => {
    categorized[c.category] = [];
  });

  foundItems.forEach((item) => {
    if (categorized[item.category]) {
      categorized[item.category].push(item);
    }
  });

  return Object.entries(categorized)
    .filter(([_, items]) => items.length > 0)
    .map(([category, items]) => ({
      category,
      items: items.sort((a, b) => b.occurrences - a.occurrences),
    }));
};



// src/utils/groceryAggregator.js

export const formatGroceryText = (categories, athleteName = "Athlete", calories = 2000) => {
  let text = `🛒 *KineticOS Smart Grocery Protocol*\n`;
  text += `👤 Athlete: ${athleteName} (${calories} kcal/day)\n`;
  text += `📅 Generated on: ${new Date().toLocaleDateString()}\n\n`;

  categories.forEach((cat) => {
    text += `*${cat.category.toUpperCase()}*\n`;
    cat.items.forEach((item) => {
      text += `  • [ ] ${item.name} (${item.occurrences}x in split)\n`;
    });
    text += `\n`;
  });

  text += `⚡ Powered by KineticOS Biometric Engine`;
  return text;
};