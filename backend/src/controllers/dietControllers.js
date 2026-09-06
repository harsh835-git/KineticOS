import DietPlan from "../models/dietPlan.js";
import User from "../models/user.js";

// 1. Goal-Specific Macro Ratios
const getMacroSplitByGoal = (goal) => {
  switch (goal) {
    case "Weight Loss":
      // 40% Protein, 30% Carbs, 30% Fat
      return { pPct: 0.40, cPct: 0.30, fPct: 0.30, label: "40% Protein / 30% Carbs / 30% Fat" };
    case "Muscle Gain":
      // 30% Protein, 50% Carbs, 20% Fat
      return { pPct: 0.30, cPct: 0.50, fPct: 0.20, label: "30% Protein / 50% Carbs / 20% Fat" };
    case "Body Recomposition":
      return { pPct: 0.35, cPct: 0.35, fPct: 0.30, label: "35% Protein / 35% Carbs / 30% Fat" };
    case "Improve Endurance":
      return { pPct: 0.20, cPct: 0.60, fPct: 0.20, label: "20% Protein / 60% Carbs / 20% Fat" };
    case "Maintain":
    default:
      return { pPct: 0.25, cPct: 0.45, fPct: 0.30, label: "25% Protein / 45% Carbs / 30% Fat" };
  }
};

// ==========================================
// 2. VEGETARIAN 7-DAY CATALOGS FOR ALL GOALS
// ==========================================
const vegCatalogs = {
  "Weight Loss": [
    {
      breakfast: ["Tofu scramble with bell peppers & baby spinach", "1 slice multigrain toast", "Green tea"],
      lunch: ["Grilled low-fat paneer cubes (120g)", "Quinoa lemon salad with cucumber", "Steamed broccoli"],
      snack: ["Sprouted moong & black chana chaat with lemon", "Unsweetened green tea"],
      dinner: ["Boiled soya chunks tossed in olive oil & spices", "Cauliflower mash", "Fresh mixed greens bowl"],
    },
    {
      breakfast: ["Overnight oats with unsweetened almond milk", "1 scoop plant/whey isolate", "Chia seeds & blueberries"],
      lunch: ["Yellow dal tadka", "Brown basmati rice (1/2 cup)", "Warm roasted zucchini & asparagus"],
      snack: ["Low-fat Greek yogurt or hung curd", "Cucumber & tomato slices with black pepper"],
      dinner: ["Pan-seared firm tofu steak", "Sautéed garlic mushrooms & kale", "Clear vegetable broth"],
    },
    {
      breakfast: ["Besan chilla (gram flour pancakes) with paneer filling", "Mint coriander chutney", "Black coffee"],
      lunch: ["Rajma (red kidney beans) curry (low oil)", "1/2 cup brown rice", "Radish cucumber salad"],
      snack: ["Roasted edamame beans", "Handful of raw almonds"],
      dinner: ["Palak paneer (low-fat paneer in puréed spinach)", "1 small jowar or bajra roti", "Sautéed green beans"],
    },
    {
      breakfast: ["Chia seed pudding made with unsweetened soy milk", "Sliced strawberries", "Pumpkin seeds"],
      lunch: ["Paneer bhurji with chopped tomatoes & onions", "2 whole wheat phulkas", "Kachumber salad"],
      snack: ["Whey/plant protein shake with cold water", "10 walnut halves"],
      dinner: ["Stir-fry tofu with bok choy & bell peppers", "Shirataki noodles or cauliflower rice", "Clear vegetable soup"],
    },
    {
      breakfast: ["Moong dal chilla with crushed mint", "Greek yogurt dip", "Unsweetened herbal tea"],
      lunch: ["Chole (chickpea) salad with olive oil dressing", "Steamed mixed greens", "Quinoa bowl"],
      snack: ["Roasted makhanas (foxnuts)", "Iced unsweetened green tea"],
      dinner: ["Air-fried low-fat paneer tikka", "Grilled capsicum & onion skewers", "Fresh cabbage salad"],
    },
    {
      breakfast: ["Oatmeal with whey protein isolate", "Diced green apple with cinnamon", "Black coffee"],
      lunch: ["Curd rice made with brown rice & mustard seeds", "Sautéed French beans", "Tofu strips"],
      snack: ["Low-fat cottage cheese slices with cracked pepper", "Celery sticks"],
      dinner: ["Soya chunk curry with minimal oil", "1 multigrain roti", "Steamed cauliflower florets"],
    },
    {
      breakfast: ["Avocado & mashed chickpea toast on whole grain", "Cherry tomatoes", "Herbal tea"],
      lunch: ["Lentil soup with firm tofu chunks", "Steamed asparagus and zucchini", "Fresh baby spinach"],
      snack: ["Handful of roasted peanuts", "Green tea"],
      dinner: ["Grilled herb paneer cubes", "Roasted bell peppers & mushrooms", "Warm vegetable clear soup"],
    },
  ],

  "Muscle Gain": [
    {
      breakfast: ["Oatmeal cooked in full-cream milk", "2 scoops whey/plant protein", "1 banana & 2 tbsp peanut butter"],
      lunch: ["Paneer butter masala / curry (150g paneer)", "1.5 cups brown basmati rice", "Steamed broccoli with olive oil"],
      snack: ["Mass-builder shake: banana, oats, peanut butter, milk, whey", "Handful of almonds & dates"],
      dinner: ["Tofu & chickpea stir-fry in peanut sauce", "Large baked sweet potato with butter", "Mixed leafy greens"],
    },
    {
      breakfast: ["3 paneer & vegetable stuffed parathas", "Thick Greek yogurt bowl with honey", "1 glass milk"],
      lunch: ["Rajma (red kidney bean) masala", "2 cups white basmati rice", "Kachumber salad with avocado slices"],
      snack: ["Peanut butter on 2 whole wheat slices", "1 banana + whey protein shake"],
      dinner: ["Soya chunk biryani (high protein)", "Cucumber & flaxseed raita", "Roasted mixed vegetables"],
    },
    {
      breakfast: ["Loaded besan chilla with grated paneer", "1 glass whole milk", "Dry fruit mix (raisins & cashews)"],
      lunch: ["Dal makhani (light butter)", "1.5 cups jeera rice", "100g grilled paneer cubes"],
      snack: ["Greek yogurt topped with granola & mixed berries", "Trail mix"],
      dinner: ["Stir-fried firm tofu with cashews & bell peppers", "1.5 cups quinoa", "Steamed green beans"],
    },
    {
      breakfast: ["Overnight oats with whole milk, chia & honey", "1 scoop whey protein", "Handful of crushed walnuts"],
      lunch: ["Chole masala (spiced chickpeas)", "2 whole wheat rotis + 1 cup rice", "Full-fat curd"],
      snack: ["Cottage cheese (paneer) cubes with pepper", "Whole wheat crackers"],
      dinner: ["Tofu & vegetable Thai green curry", "1.5 cups jasmine rice", "Avocado salad"],
    },
    {
      breakfast: ["Protein pancakes with pure maple syrup", "Glass of milk or soy milk", "1 large banana"],
      lunch: ["Paneer and green pea pulao (200g paneer)", "Mixed lentil bowl", "Carrot and beet salad"],
      snack: ["Mass gainer smoothie: whey, dates, oats, peanut butter", "Almonds"],
      dinner: ["Soya chunk and sweet potato hash", "2 whole wheat chapatis", "Sautéed spinach with olive oil"],
    },
    {
      breakfast: ["Sprouted moong & paneer cutlets (pan-seared)", "Mint chutney", "Full-fat curd with honey"],
      lunch: ["Soybean & vegetable khichdi cooked in ghee", "1 cup rich curd", "Roasted papad"],
      snack: ["Cashews, almonds & raisins", "Protein shake with milk"],
      dinner: ["Grilled paneer tikka platter (200g)", "2 whole wheat phulkas", "Steamed asparagus"],
    },
    {
      breakfast: ["Steel-cut oats with almond butter & honey", "Whey protein shake", "1 apple"],
      lunch: ["Tofu Manchurian (air-fried)", "1.5 cups vegetable fried brown rice", "Steamed edamame bowl"],
      snack: ["Paneer roll with whole wheat wrap", "Fresh fruit juice"],
      dinner: ["Slow-cooked mixed lentil dal with ghee", "1.5 cups brown rice", "Cucumber salad"],
    },
  ],

  "Body Recomposition": [
    {
      breakfast: ["Besan chilla stuffed with 80g low-fat paneer", "Mint chutney", "1 cup black coffee"],
      lunch: ["Firm tofu stir-fry with broccoli & bell peppers", "3/4 cup quinoa", "Olive oil dressing"],
      snack: ["Whey / soy isolate shake with water", "10 roasted almonds"],
      dinner: ["Soya chunks curry with light gravy", "1 whole wheat roti", "Large bowl of cucumber & tomato salad"],
    },
    {
      breakfast: ["Oatmeal with whey isolate & chia seeds", "1/2 sliced banana", "Green tea"],
      lunch: ["Rajma (kidney bean) bowl with 100g grilled paneer", "1/2 cup brown basmati rice", "Steamed greens"],
      snack: ["Greek yogurt with pumpkin seeds", "Green tea"],
      dinner: ["Pan-seared tofu steak with garlic mushrooms", "Roasted asparagus & zucchini", "Clear vegetable soup"],
    },
    {
      breakfast: ["Moong dal chilla with paneer", "1 cup curd", "Unsweetened herbal tea"],
      lunch: ["Chickpea (chole) and quinoa power bowl", "Avocado slices", "Lemon vinaigrette"],
      snack: ["Roasted chana (Bengal gram)", "1 scoop whey protein shake"],
      dinner: ["Palak paneer with low-fat paneer", "1 multigrain roti", "Steamed broccoli"],
    },
    {
      breakfast: ["Overnight chia & oat pudding with soy milk", "Handful of blueberries", "Walnuts"],
      lunch: ["Grilled tofu cubes (150g)", "1/2 cup brown rice", "Sautéed French beans & carrots"],
      snack: ["Cottage cheese (paneer) cubes with chaat masala", "Cucumber slices"],
      dinner: ["Soya chunk bhurji with bell peppers", "2 whole wheat phulkas", "Mixed greens salad"],
    },
    {
      breakfast: ["Avocado & sprouted moong toast on sourdough", "Cherry tomatoes", "Black coffee"],
      lunch: ["Lentil soup with roasted paneer cubes", "Steamed asparagus", "1/2 cup quinoa"],
      snack: ["Roasted edamame", "Cold unsweetened tea"],
      dinner: ["Air-fried paneer tikka", "Cauliflower mash with olive oil", "Clear broth"],
    },
    {
      breakfast: ["Tofu scramble with nutritional yeast & spinach", "1 slice rye bread", "Green tea"],
      lunch: ["Black bean and corn salad bowl with grilled tofu", "Olive oil & lime dressing", "Baby spinach"],
      snack: ["Whey isolate protein shake", "Handful of walnuts"],
      dinner: ["Low-fat paneer curry", "1 jowar roti", "Steamed green beans"],
    },
    {
      breakfast: ["High-protein besan pancake with paneer", "Greek yogurt dip", "Herbal tea"],
      lunch: ["Soya chunk pulao (cooked in minimal olive oil)", "Cucumber raita", "Tomato salad"],
      snack: ["Roasted makhanas", "Almonds"],
      dinner: ["Grilled herb tofu with steamed broccoli and zucchini", "Clear vegetable broth"],
    },
  ],

  "Improve Endurance": [
    {
      breakfast: ["Large bowl of oatmeal with banana, honey & raisins", "Glass of soy milk", "1 slice whole wheat toast"],
      lunch: ["Brown basmati rice (1.5 cups) with mixed yellow dal", "Steamed sweet corn & carrots", "100g tofu cubes"],
      snack: ["Fruit bowl (banana, apple, orange) with chia seeds", "Handful of dates and walnuts"],
      dinner: ["Whole wheat pasta with marinara & chickpeas", "Steamed broccoli florets", "Mixed green salad"],
    },
    {
      breakfast: ["Whole grain bagel with peanut butter & sliced banana", "Fresh orange juice", "Handful of raisins"],
      lunch: ["Quinoa, sweet potato & black bean burrito bowl", "Guacamole & salsa", "Steamed greens"],
      snack: ["High-carb electrolyte energy smoothie (oats, berries, banana)", "Roasted almonds"],
      dinner: ["Baked sweet potato with grilled paneer", "Sautéed zucchini & carrots", "1 cup brown rice"],
    },
    {
      breakfast: ["Pancakes topped with honey and fresh strawberries", "1 glass milk or oat milk", "Dry fruit mix"],
      lunch: ["Rajma (kidney bean) masala with 1.5 cups white rice", "Steamed French beans", "Kachumber salad"],
      snack: ["Greek yogurt with granola and blueberries", "Banana"],
      dinner: ["Tofu and vegetable stir-fry noodles (whole wheat)", "Edamame", "Clear vegetable broth"],
    },
    {
      breakfast: ["Steel-cut oats cooked with dried figs & honey", "Glass of soy milk", "1 sliced apple"],
      lunch: ["Chole (chickpea) curry with 2 whole wheat rotis & rice", "Cucumber salad", "Fresh curd"],
      snack: ["Peanut butter and honey sandwich on whole wheat", "Electrolyte water"],
      dinner: ["Soya chunk and potato curry", "1.5 cups basmati rice", "Steamed green beans"],
    },
    {
      breakfast: ["Muesli with warm almond milk and fresh fruit medley", "1 banana", "Handful of cashews"],
      lunch: ["Mediterranean lentil and couscous bowl", "Roasted bell peppers & olives", "100g paneer cubes"],
      snack: ["Whole wheat pita with hummus", "Carrot and cucumber sticks"],
      dinner: ["Baked tofu steak with mashed potatoes", "Steamed asparagus & sweet corn", "Warm vegetable soup"],
    },
    {
      breakfast: ["Overnight oats with chia, honey and berries", "Banana smoothie", "Walnuts"],
      lunch: ["Vegetable biryani with soya chunks", "Boondi / cucumber raita", "Roasted papad"],
      snack: ["Trail mix (raisins, almonds, pumpkin seeds, dates)", "Fresh fruit juice"],
      dinner: ["Whole wheat pasta with pesto and grilled tofu", "Cherry tomato salad", "Steamed peas"],
    },
    {
      breakfast: ["Avocado and tomato toast on whole grain (2 slices)", "1 orange", "Herbal tea"],
      lunch: ["Khichdi made with brown rice, moong dal and ghee", "Curd bowl", "Steamed mixed greens"],
      snack: ["High-carb energy bar or flapjack", "Handful of almonds"],
      dinner: ["Paneer and vegetable stir-fry", "1.5 cups quinoa", "Clear vegetable soup"],
    },
  ],

  "Maintain": [
    {
      breakfast: ["Oatmeal with whey isolate & fresh berries", "1 cup green tea", "Handful of walnuts"],
      lunch: ["Grilled paneer cubes (120g)", "1 cup brown basmati rice", "Steamed mixed vegetables"],
      snack: ["Low-fat yogurt with crushed chia seeds", "1 handful almonds"],
      dinner: ["Pan-seared tofu steak", "Baked sweet potato", "Fresh mixed green salad with olive oil"],
    },
    {
      breakfast: ["Besan chilla with mint chutney", "1 cup low-fat curd", "Black coffee"],
      lunch: ["Mixed dal with 2 whole wheat phulkas", "Cucumber tomato salad", "Sautéed French beans"],
      snack: ["Roasted makhanas (foxnuts)", "1 apple"],
      dinner: ["Soya chunk curry", "1/2 cup brown rice", "Steamed broccoli"],
    },
    {
      breakfast: ["Avocado toast on whole grain bread", "Handful of cherry tomatoes", "Herbal tea"],
      lunch: ["Chickpea and quinoa Mediterranean bowl", "Olives & feta/paneer", "Olive oil vinaigrette"],
      snack: ["Greek yogurt with honey and seeds", "Cucumber slices"],
      dinner: ["Palak paneer with light gravy", "1 jowar roti", "Clear vegetable broth"],
    },
    {
      breakfast: ["Chia seed pudding made with soy milk", "Sliced strawberries", "Pumpkin seeds"],
      lunch: ["Rajma curry with 1 cup brown rice", "Kachumber salad", "Steamed asparagus"],
      snack: ["Whey / plant protein shake with water", "10 almonds"],
      dinner: ["Tofu and bell pepper stir-fry", "Cauliflower rice", "Sautéed garlic greens"],
    },
    {
      breakfast: ["Overnight oats with chia seeds and almond butter", "1 sliced banana", "Black coffee"],
      lunch: ["Lentil soup with whole wheat pita and hummus", "Mixed greens salad", "Cucumber sticks"],
      snack: ["Roasted chana (Bengal gram)", "Green tea"],
      dinner: ["Grilled herb paneer with roasted vegetables", "1/2 cup quinoa", "Vegetable soup"],
    },
    {
      breakfast: ["Moong dal chilla with paneer stuffing", "Mint chutney", "Herbal tea"],
      lunch: ["Curd rice made with brown rice & mustard seeds", "Sautéed green beans", "100g tofu cubes"],
      snack: ["Handful of walnuts and pumpkin seeds", "Fresh seasonal fruit"],
      dinner: ["Soya chunk and sweet potato curry", "1 whole wheat roti", "Steamed mixed greens"],
    },
    {
      breakfast: ["Protein pancakes with blueberries", "1 cup unsweetened tea", "Walnuts"],
      lunch: ["Chole masala with 1 cup brown rice", "Cucumber radish salad", "Steamed greens"],
      snack: ["Low-fat cottage cheese cubes with black pepper", "Carrot sticks"],
      dinner: ["Air-fried paneer tikka with capsicum & onions", "Mixed leafy greens", "Clear vegetable broth"],
    },
  ],
};

// ==============================================
// 3. NON-VEGETARIAN 7-DAY CATALOGS FOR ALL GOALS
// ==============================================
const nonVegCatalogs = {
  "Weight Loss": [
    {
      breakfast: ["4 egg white scramble + 1 whole egg with spinach", "1 slice rye toast", "Black coffee"],
      lunch: ["Grilled chicken breast (150g) seasoned with herbs", "1/2 cup quinoa", "Steamed broccoli"],
      snack: ["Low-fat Greek yogurt with chia seeds", "Green apple slices"],
      dinner: ["Baked white fish (tilapia/cod) with lemon", "Roasted asparagus", "Cauliflower mash"],
    },
    {
      breakfast: ["Overnight oats with unsweetened almond milk", "1 scoop whey isolate", "Blueberries"],
      lunch: ["Turkey breast wrap in whole wheat tortilla", "Mixed leafy greens", "Carrot sticks"],
      snack: ["2 boiled eggs (1 yolk discarded)", "Raw almonds (8-10)"],
      dinner: ["Grilled salmon fillet (120g)", "Sautéed garlic zucchini", "Clear chicken bone broth"],
    },
    {
      breakfast: ["Omelet (3 whites, 1 whole) with bell peppers & mushrooms", "Sliced tomatoes", "Green tea"],
      lunch: ["Canned tuna in water tossed with lemon & cucumber", "Mixed green salad with olive oil", "1/3 cup brown rice"],
      snack: ["Whey isolate protein shake in cold water", "Handful of walnuts"],
      dinner: ["Lean chicken stir-fry with bok choy", "Cauliflower rice", "Steamed green beans"],
    },
    {
      breakfast: ["Poached eggs (2) over avocado slices", "1 slice whole wheat bread", "Black coffee"],
      lunch: ["Grilled chicken skewers with oregano", "Quinoa and cucumber bowl", "Balsamic vinegar dressing"],
      snack: ["High-protein Greek yogurt", "Cucumber slices with black pepper"],
      dinner: ["Baked white fish with fresh herbs", "Steamed broccoli florets", "Clear vegetable broth"],
    },
    {
      breakfast: ["Egg white & mushroom scramble (4 whites)", "1/2 grapefruit", "Green tea"],
      lunch: ["Lean ground turkey patty (150g)", "Steamed asparagus and zucchini", "Mixed baby greens"],
      snack: ["Whey isolate shake", "10 raw almonds"],
      dinner: ["Pan-seared chicken breast with herbs", "Sautéed garlic spinach", "Steamed zucchini noodles"],
    },
    {
      breakfast: ["Protein pancakes made with egg whites & oats", "Fresh strawberries", "Black coffee"],
      lunch: ["Baked cod fillet with dill and lemon", "Large leafy green salad with olive oil", "1/3 cup brown rice"],
      snack: ["Roasted edamame or chana", "Cold green tea"],
      dinner: ["Grilled chicken breast with steamed broccoli", "Clear bone broth", "Cucumber slices"],
    },
    {
      breakfast: ["Boiled eggs (2 whole, 2 whites)", "1 slice whole grain toast", "Herbal detox infusion"],
      lunch: ["Grilled chicken salad with romaine lettuce", "Cherry tomatoes and olive oil", "Lemon vinaigrette"],
      snack: ["Handful of raw almonds", "Greek yogurt"],
      dinner: ["Grilled salmon fillet with sea salt", "Steamed green beans & asparagus", "Clear chicken broth"],
    },
  ],

  "Muscle Gain": [
    {
      breakfast: ["3 whole eggs scrambled + 2 egg whites", "2 slices whole grain toast with peanut butter", "1 large banana"],
      lunch: ["Grilled chicken breast (200g)", "1.5 cups brown basmati rice", "Steamed broccoli with olive oil"],
      snack: ["Mass-builder shake: whey, oats, banana & peanut butter", "Handful of mixed nuts"],
      dinner: ["Lean ground beef or sirloin steak (180g)", "Large baked sweet potato with butter", "Mixed greens with avocado"],
    },
    {
      breakfast: ["Steel-cut oatmeal with whole milk & honey", "2 scoops whey protein", "Handful of walnuts and raisins"],
      lunch: ["Double chicken rice bowl (200g chicken)", "Black beans, sweet corn & salsa", "Sliced avocado with lime"],
      snack: ["Greek yogurt with granola and blueberries", "2 hard-boiled eggs"],
      dinner: ["Grilled salmon steak with olive oil glaze (200g)", "1.5 cups quinoa", "Roasted asparagus & carrots"],
    },
    {
      breakfast: ["Egg and avocado breakfast burritos (3 eggs)", "1 glass whole milk", "1 orange"],
      lunch: ["Whole grain pasta with ground turkey / chicken (200g)", "Nutritional yeast / parmesan", "Steamed green beans"],
      snack: ["Peanut butter and banana sandwich on whole wheat", "High-protein recovery shake"],
      dinner: ["Seared sirloin steak (180g)", "Mashed red potatoes with garlic butter", "Roasted zucchini"],
    },
    {
      breakfast: ["4 egg omelet with cheese and bell peppers", "2 hash brown patties / roasted potatoes", "Fresh orange juice"],
      lunch: ["Teriyaki chicken thighs (200g)", "2 cups jasmine rice", "Stir-fried vegetables with sesame oil"],
      snack: ["Protein smoothie with almond butter & dates", "Handful of trail mix"],
      dinner: ["Baked salmon fillet (180g)", "1 cup brown rice", "Sautéed spinach with olive oil"],
    },
    {
      breakfast: ["Protein oat bowl with peanut butter & honey", "3 scrambled eggs", "1 sliced apple"],
      lunch: ["Loaded turkey breast sub on whole grain (180g meat)", "Baked sweet potato wedges", "Side salad"],
      snack: ["Cottage cheese with pineapple chunks", "2 hard-boiled eggs"],
      dinner: ["Grilled chicken skewers (200g)", "1.5 cups couscous with herbs", "Roasted broccoli florets"],
    },
    {
      breakfast: ["Pancakes topped with pure maple syrup", "3 egg whites + 2 whole eggs", "1 banana"],
      lunch: ["Chili con carne with lean ground beef", "1.5 cups brown rice", "Guacamole with tortilla chips"],
      snack: ["High-calorie shake with oats & whey", "Almonds and dark chocolate"],
      dinner: ["Seared steak or grilled chicken (200g)", "Double baked sweet potato", "Steamed mixed greens"],
    },
    {
      breakfast: ["French toast made with eggs and cinnamon", "Greek yogurt with honey", "Fresh berry medley"],
      lunch: ["Herb-roasted chicken platter (200g)", "1.5 cups yellow basmati rice", "Grilled bell peppers"],
      snack: ["Hard-boiled eggs and sliced cheddar cheese", "Rice cakes with peanut butter"],
      dinner: ["Grilled salmon with lemon dill butter (200g)", "1.5 cups quinoa", "Steamed asparagus"],
    },
  ],

  "Body Recomposition": [
    {
      breakfast: ["3 whole eggs scrambled with spinach & tomatoes", "1 slice sourdough toast", "Black coffee"],
      lunch: ["Grilled chicken breast (180g)", "3/4 cup brown basmati rice", "Steamed broccoli with olive oil"],
      snack: ["Whey isolate shake with cold water", "10 raw almonds"],
      dinner: ["Baked white fish (tilapia/cod) or salmon (150g)", "Large roasted asparagus & zucchini", "1/2 baked sweet potato"],
    },
    {
      breakfast: ["Oatmeal with whey isolate, chia seeds & blueberries", "2 boiled egg whites", "Green tea"],
      lunch: ["Canned tuna salad with mixed greens, avocado & lime", "1/2 cup quinoa", "Cherry tomatoes"],
      snack: ["Greek yogurt with walnuts", "Green tea"],
      dinner: ["Lean sirloin steak or turkey patty (160g)", "Cauliflower mash with olive oil", "Steamed green beans"],
    },
    {
      breakfast: ["Omelet (3 whites, 1 whole) with mushrooms and bell peppers", "1 slice rye bread", "Black coffee"],
      lunch: ["Grilled chicken power bowl with black beans & salsa", "1/2 cup brown rice", "Cucumber salad"],
      snack: ["2 boiled eggs with black pepper", "Apple slices"],
      dinner: ["Pan-seared salmon fillet (150g)", "Sautéed garlic spinach", "Clear bone broth"],
    },
    {
      breakfast: ["Poached eggs (2) over avocado slices on whole wheat", "Grapefruit half", "Herbal tea"],
      lunch: ["Turkey breast wrap with leafy greens and hummus", "Carrot & celery sticks", "Side salad"],
      snack: ["Whey protein shake", "Handful of walnuts"],
      dinner: ["Grilled chicken skewers (180g)", "Roasted bell peppers and onions", "Quinoa (1/2 cup)"],
    },
    {
      breakfast: ["Protein pancakes (oats, egg whites, whey)", "Fresh berries", "Black coffee"],
      lunch: ["Baked cod with dill and lemon", "Steamed asparagus and zucchini", "3/4 cup quinoa"],
      snack: ["Low-fat cottage cheese with black pepper", "Cucumber slices"],
      dinner: ["Lean chicken stir-fry with broccoli & mushrooms", "Cauliflower rice with sesame oil", "Clear broth"],
    },
    {
      breakfast: ["Scrambled eggs (2 whole, 2 whites)", "1 slice whole grain toast", "Green tea"],
      lunch: ["Grilled chicken breast salad with olive oil vinaigrette", "1/2 cup brown rice", "Steamed green beans"],
      snack: ["Greek yogurt with pumpkin seeds", "Handful of almonds"],
      dinner: ["Seared salmon fillet (150g)", "Roasted zucchini and broccoli", "Clear chicken broth"],
    },
    {
      breakfast: ["Chia seed pudding with unsweetened almond milk & whey", "Sliced strawberries", "Walnuts"],
      lunch: ["Lean ground turkey bowl with diced sweet potato", "Steamed broccoli", "Cucumber salad"],
      snack: ["2 boiled egg whites", "Handful of almonds"],
      dinner: ["Grilled white fish with lemon herb drizzle", "Sautéed spinach with olive oil", "Warm vegetable soup"],
    },
  ],

  "Improve Endurance": [
    {
      breakfast: ["Oatmeal with banana, honey, raisins & walnuts", "2 boiled eggs", "Glass of orange juice"],
      lunch: ["Grilled chicken breast (150g)", "1.5 cups brown basmati rice", "Steamed sweet corn & broccoli"],
      snack: ["Fruit bowl (banana, berries, apple) with chia seeds", "Handful of dates"],
      dinner: ["Whole wheat pasta with marinara & ground turkey", "Steamed asparagus", "Mixed green salad"],
    },
    {
      breakfast: ["Whole grain bagel with peanut butter & sliced banana", "Glass of milk", "Handful of raisins"],
      lunch: ["Quinoa, black bean & chicken burrito bowl", "Guacamole & fresh salsa", "Steamed greens"],
      snack: ["High-carb energy shake (oats, banana, milk, honey)", "Almonds"],
      dinner: ["Baked salmon fillet with large baked sweet potato", "Sautéed zucchini & carrots", "1 cup brown rice"],
    },
    {
      breakfast: ["Pancakes with maple syrup and fresh strawberries", "3 scrambled egg whites", "Orange juice"],
      lunch: ["Teriyaki chicken with 1.5 cups white jasmine rice", "Steamed French beans", "Side salad"],
      snack: ["Greek yogurt with granola and blueberries", "1 banana"],
      dinner: ["Grilled chicken breast with whole wheat noodles", "Stir-fried vegetables", "Clear chicken broth"],
    },
    {
      breakfast: ["Steel-cut oats cooked with dried figs & honey", "Whey protein shake with milk", "1 apple"],
      lunch: ["Turkey breast sub on whole grain baguette", "Baked potato wedges", "Mixed greens"],
      snack: ["Peanut butter and honey sandwich on whole wheat", "Electrolyte water"],
      dinner: ["Baked white fish with 1.5 cups quinoa", "Steamed green beans & carrots", "Warm vegetable soup"],
    },
    {
      breakfast: ["Muesli with warm milk and fresh fruit medley", "1 hard-boiled egg", "Handful of cashews"],
      lunch: ["Mediterranean chicken and couscous bowl", "Roasted bell peppers & olives", "Cucumber salad"],
      snack: ["Whole wheat pita with hummus and chicken strips", "Carrot sticks"],
      dinner: ["Grilled salmon steak with mashed sweet potatoes", "Steamed broccoli & sweet corn", "Clear broth"],
    },
    {
      breakfast: ["Overnight oats with chia, honey and berries", "Banana smoothie", "Walnuts"],
      lunch: ["Chicken and vegetable fried brown rice", "Steamed edamame bowl", "Side salad"],
      snack: ["Trail mix (raisins, almonds, pumpkin seeds, dates)", "Fresh fruit juice"],
      dinner: ["Whole wheat spaghetti with grilled chicken breast", "Tomato basil sauce", "Steamed asparagus"],
    },
    {
      breakfast: ["Avocado and poached egg toast on whole grain (2 eggs)", "1 orange", "Herbal tea"],
      lunch: ["Slow-cooked chicken and lentil stew", "1.5 cups brown basmati rice", "Steamed greens"],
      snack: ["High-carb energy bar", "Handful of almonds"],
      dinner: ["Seared sirloin steak with baked red potatoes", "Steamed green beans", "Clear broth"],
    },
  ],

  "Maintain": [
    {
      breakfast: ["2 whole eggs scrambled with spinach", "1 slice whole wheat toast", "Black coffee"],
      lunch: ["Grilled chicken breast (150g)", "1 cup brown basmati rice", "Steamed mixed vegetables"],
      snack: ["Low-fat Greek yogurt with chia seeds", "1 handful almonds"],
      dinner: ["Baked salmon fillet", "Baked sweet potato", "Fresh mixed green salad with olive oil"],
    },
    {
      breakfast: ["Oatmeal with whey isolate & fresh berries", "1 boiled egg", "Green tea"],
      lunch: ["Turkey breast wrap with avocado and romaine lettuce", "Carrot sticks", "Side salad"],
      snack: ["High-protein yogurt with pumpkin seeds", "1 apple"],
      dinner: ["White fish (cod/tilapia) with lemon & herbs", "1/2 cup quinoa", "Steamed broccoli"],
    },
    {
      breakfast: ["Poached eggs (2) on avocado sourdough toast", "Cherry tomatoes", "Herbal tea"],
      lunch: ["Mediterranean chicken & quinoa salad bowl", "Kalamata olives & feta", "Olive oil dressing"],
      snack: ["Handful of walnuts and dried cranberries", "Cucumber slices"],
      dinner: ["Lean sirloin steak or grilled chicken (150g)", "Roasted zucchini & asparagus", "Clear vegetable broth"],
    },
    {
      breakfast: ["Overnight oats with chia seeds and almond milk", "1 sliced banana", "Black coffee"],
      lunch: ["Canned tuna salad with mixed greens & olive oil", "1 slice multigrain bread", "Baby carrots"],
      snack: ["Whey protein shake with water", "10 almonds"],
      dinner: ["Grilled chicken skewers with bell peppers", "1 cup brown rice", "Steamed green beans"],
    },
    {
      breakfast: ["Omelet with bell peppers and tomatoes (2 eggs)", "1 slice whole grain bread", "Green tea"],
      lunch: ["Lentil soup with grilled chicken breast strips", "Whole wheat pita", "Mixed greens"],
      snack: ["Cottage cheese with cracked pepper", "Celery sticks"],
      dinner: ["Baked salmon with roasted asparagus", "Mashed sweet potato", "Clear broth"],
    },
    {
      breakfast: ["Protein pancakes with blueberries", "2 egg whites", "Unsweetened tea"],
      lunch: ["Chicken stir-fry with bok choy and mushrooms", "1/2 cup brown rice", "Cucumber salad"],
      snack: ["Handful of almonds and pumpkin seeds", "Fresh seasonal fruit"],
      dinner: ["Grilled white fish with steamed broccoli", "1/2 cup quinoa", "Clear vegetable broth"],
    },
    {
      breakfast: ["Scrambled eggs with smoked salmon or herbs", "1 slice rye toast", "Black coffee"],
      lunch: ["Grilled chicken salad with romaine lettuce & olive oil", "1/2 cup brown rice", "Steamed carrots"],
      snack: ["Greek yogurt with honey and chia seeds", "Green tea"],
      dinner: ["Pan-seared chicken breast with herbs", "Roasted sweet potato slices", "Steamed asparagus"],
    },
  ],
};

// ==========================================
// 4. MEAL SCHEDULE BUILDER
// ==========================================
const buildMealSchedule = (targetCalories, goal, dietaryPreference = "non-vegetarian") => {
  const { pPct, cPct, fPct, label } = getMacroSplitByGoal(goal);

  const totalProteinGrams = Math.round((targetCalories * pPct) / 4);
  const totalCarbsGrams = Math.round((targetCalories * cPct) / 4);
  const totalFatsGrams = Math.round((targetCalories * fPct) / 9);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Select the appropriate catalog by preference and goal
  const catalogGroup = dietaryPreference === "vegetarian" ? vegCatalogs : nonVegCatalogs;
  const catalog = catalogGroup[goal] || catalogGroup["Maintain"];

  return days.map((day, idx) => {
    const dayMeals = catalog[idx % catalog.length];

    return {
      dayName: day,
      targetCalories,
      macros: {
        proteinGrams: totalProteinGrams,
        carbsGrams: totalCarbsGrams,
        fatsGrams: totalFatsGrams,
        macroSplit: label,
      },
      meals: [
        {
          mealName: "Breakfast",
          suggestedItems: dayMeals.breakfast,
          calories: Math.round(targetCalories * 0.30),
          protein: Math.round(totalProteinGrams * 0.30),
          carbs: Math.round(totalCarbsGrams * 0.30),
          fats: Math.round(totalFatsGrams * 0.30),
        },
        {
          mealName: "Lunch",
          suggestedItems: dayMeals.lunch,
          calories: Math.round(targetCalories * 0.35),
          protein: Math.round(totalProteinGrams * 0.35),
          carbs: Math.round(totalCarbsGrams * 0.35),
          fats: Math.round(totalFatsGrams * 0.35),
        },
        {
          mealName: "Mid-Day Snack",
          suggestedItems: dayMeals.snack,
          calories: Math.round(targetCalories * 0.10),
          protein: Math.round(totalProteinGrams * 0.10),
          carbs: Math.round(totalCarbsGrams * 0.10),
          fats: Math.round(totalFatsGrams * 0.10),
        },
        {
          mealName: "Dinner",
          suggestedItems: dayMeals.dinner,
          calories: Math.round(targetCalories * 0.25),
          protein: Math.round(totalProteinGrams * 0.25),
          carbs: Math.round(totalCarbsGrams * 0.25),
          fats: Math.round(totalFatsGrams * 0.25),
        },
      ],
    };
  });
};

// POST /api/diet/generate
export const generateDietPlan = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user || !user.profile) {
      return res.status(404).json({ success: false, message: "User profile not found. Complete onboarding first." });
    }

    const targetCalories = user.profile.targetCalories || user.profile.maintenanceCalories || 2000;
    const goal = user.profile.primaryGoal || "Weight Loss";
    const dietaryPreference = user.profile.dietaryPreference || "non-vegetarian";

    const weeklyDietSchedule = buildMealSchedule(targetCalories, goal, dietaryPreference);

    const dietPlan = await DietPlan.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        goal,
        dietaryPreference,
        dailyTargetCalories: targetCalories,
        schedule: weeklyDietSchedule,
      },
      { returnDocument: 'after', upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: `${dietaryPreference === "vegetarian" ? "Vegetarian" : "Non-Vegetarian"} diet plan generated for ${goal}.`,
      dietPlan,
    });
  } catch (error) {
    console.error("Generate Diet Plan Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to generate diet plan." });
  }
};

// GET /api/diet/:userId
export const getDietPlan = async (req, res) => {
  try {
    const { userId } = req.params;
    const plan = await DietPlan.findOne({ userId });

    if (!plan) {
      return res.status(404).json({ success: false, message: "No diet plan found for this user." });
    }

    return res.status(200).json({ success: true, dietPlan: plan });
  } catch (error) {
    console.error("Get Diet Plan Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve diet plan." });
  }
};