export const recipes = [
  {
    id: 1,
    title: "Avocado Toast Supreme",
    categories: ["breakfast", "quick"],
    tags: ["healthy", "vegan"],
    timeMinutes: 10,
    difficulty: "easy",
    calories: 320,
    rating: 4.5,
    servingsBase: 2,
    ingredients: [
      { name: "Whole grain bread", unit: "slices", quantityBase: 2 },
      { name: "Ripe avocado", unit: "pcs", quantityBase: 1 },
      { name: "Cherry tomatoes", unit: "pcs", quantityBase: 6 },
      { name: "Red pepper flakes", unit: "pinch", quantityBase: 1 },
      { name: "Lemon juice", unit: "tbsp", quantityBase: 1 },
      { name: "Salt", unit: "pinch", quantityBase: 1 }
    ],
    steps: [
      "Toast the bread slices until golden brown",
      "Mash the avocado with lemon juice and salt",
      "Spread avocado mixture on toast",
      "Top with halved cherry tomatoes and red pepper flakes"
    ],
    image: "🥑",
    imageUrl: "https://images.pexels.com/photos/1351238/pexels-photo-1351238.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 2,
    title: "Classic Chicken Caesar Salad",
    categories: ["lunch", "dinner"],
    tags: ["protein", "salad"],
    timeMinutes: 25,
    difficulty: "medium",
    calories: 450,
    rating: 4.8,
    servingsBase: 4,
    ingredients: [
      { name: "Chicken breast", unit: "lbs", quantityBase: 1 },
      { name: "Romaine lettuce", unit: "heads", quantityBase: 2 },
      { name: "Parmesan cheese", unit: "cup", quantityBase: 0.5 },
      { name: "Caesar dressing", unit: "cup", quantityBase: 0.25 },
      { name: "Croutons", unit: "cup", quantityBase: 1 },
      { name: "Olive oil", unit: "tbsp", quantityBase: 2 }
    ],
    steps: [
      "Season and grill chicken breast until cooked through",
      "Chop romaine lettuce into bite-sized pieces",
      "Slice grilled chicken into strips",
      "Toss lettuce with dressing and parmesan",
      "Top with chicken strips and croutons"
    ],
    image: "🥗",
    imageUrl: "https://images.pexels.com/photos/2097090/pexels-photo-2097090.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 3,
    title: "Chocolate Chip Cookies",
    categories: ["dessert"],
    tags: ["sweet", "baking"],
    timeMinutes: 45,
    difficulty: "easy",
    calories: 180,
    rating: 4.9,
    servingsBase: 24,
    ingredients: [
      { name: "All-purpose flour", unit: "cups", quantityBase: 2.25 },
      { name: "Butter", unit: "cup", quantityBase: 1 },
      { name: "Brown sugar", unit: "cup", quantityBase: 0.75 },
      { name: "White sugar", unit: "cup", quantityBase: 0.5 },
      { name: "Eggs", unit: "pcs", quantityBase: 2 },
      { name: "Chocolate chips", unit: "cups", quantityBase: 2 },
      { name: "Vanilla extract", unit: "tsp", quantityBase: 1 },
      { name: "Baking soda", unit: "tsp", quantityBase: 1 }
    ],
    steps: [
      "Preheat oven to 375°F",
      "Cream butter with both sugars",
      "Beat in eggs and vanilla",
      "Mix in flour and baking soda",
      "Fold in chocolate chips",
      "Drop spoonfuls on baking sheet",
      "Bake for 9-11 minutes until golden"
    ],
    image: "🍪",
    imageUrl: "https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 4,
    title: "Quinoa Buddha Bowl",
    categories: ["lunch", "dinner"],
    tags: ["healthy", "vegan", "protein"],
    timeMinutes: 35,
    difficulty: "medium",
    calories: 380,
    rating: 4.3,
    servingsBase: 2,
    ingredients: [
      { name: "Quinoa", unit: "cup", quantityBase: 1 },
      { name: "Sweet potato", unit: "pcs", quantityBase: 1 },
      { name: "Chickpeas", unit: "cup", quantityBase: 1 },
      { name: "Spinach", unit: "cups", quantityBase: 2 },
      { name: "Tahini", unit: "tbsp", quantityBase: 3 },
      { name: "Lemon juice", unit: "tbsp", quantityBase: 2 },
      { name: "Olive oil", unit: "tbsp", quantityBase: 2 }
    ],
    steps: [
      "Cook quinoa according to package instructions",
      "Roast diced sweet potato with olive oil",
      "Drain and rinse chickpeas",
      "Whisk tahini with lemon juice for dressing",
      "Arrange all components in bowls",
      "Drizzle with tahini dressing"
    ],
    image: "🥙",
    imageUrl: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 5,
    title: "Berry Smoothie Bowl",
    categories: ["breakfast"],
    tags: ["healthy", "vegan", "quick"],
    timeMinutes: 8,
    difficulty: "easy",
    calories: 290,
    rating: 4.6,
    servingsBase: 1,
    ingredients: [
      { name: "Frozen mixed berries", unit: "cup", quantityBase: 1 },
      { name: "Banana", unit: "pcs", quantityBase: 0.5 },
      { name: "Almond milk", unit: "cup", quantityBase: 0.5 },
      { name: "Granola", unit: "tbsp", quantityBase: 3 },
      { name: "Fresh berries", unit: "cup", quantityBase: 0.25 },
      { name: "Chia seeds", unit: "tsp", quantityBase: 1 }
    ],
    steps: [
      "Blend frozen berries, banana, and almond milk until thick",
      "Pour into bowl",
      "Top with granola, fresh berries, and chia seeds",
      "Serve immediately"
    ],
    image: "🫐",
    imageUrl: "https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400"
  },
  {
    id: 6,
    title: "Beef Stir Fry",
    categories: ["dinner"],
    tags: ["protein", "quick"],
    timeMinutes: 20,
    difficulty: "medium",
    calories: 420,
    rating: 4.4,
    servingsBase: 3,
    ingredients: [
      { name: "Beef strips", unit: "lbs", quantityBase: 1 },
      { name: "Bell peppers", unit: "pcs", quantityBase: 2 },
      { name: "Broccoli", unit: "cups", quantityBase: 2 },
      { name: "Soy sauce", unit: "tbsp", quantityBase: 3 },
      { name: "Garlic", unit: "cloves", quantityBase: 3 },
      { name: "Ginger", unit: "tbsp", quantityBase: 1 },
      { name: "Vegetable oil", unit: "tbsp", quantityBase: 2 }
    ],
    steps: [
      "Heat oil in large pan or wok",
      "Cook beef strips until browned",
      "Add garlic and ginger, stir for 30 seconds",
      "Add vegetables and stir-fry for 3-4 minutes",
      "Add soy sauce and toss everything together",
      "Serve hot over rice"
    ],
    image: "🥩",
    imageUrl: "https://images.pexels.com/photos/343871/pexels-photo-343871.jpeg?auto=compress&cs=tinysrgb&w=400"
  }
];