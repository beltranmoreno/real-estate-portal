/**
 * Shared option lists for the dining schemas (presetMenu + presetPlate).
 * Keeping these in one place guarantees a plate and a menu speak the same
 * taxonomy — so meal-type / course-type / dietary filters line up on the
 * renter side no matter which document a value came from.
 */

export const MEAL_TYPES = [
  {title: 'Breakfast', value: 'breakfast'},
  {title: 'Brunch', value: 'brunch'},
  {title: 'Lunch', value: 'lunch'},
  {title: 'Dinner', value: 'dinner'},
  {title: 'Cocktail hour / canapés', value: 'cocktail'},
  {title: 'BBQ', value: 'bbq'},
  {title: 'Dessert / sweet table', value: 'dessert'},
  {title: 'Late-night', value: 'late_night'},
  {title: "Kids' menu", value: 'kids'},
] as const

/**
 * A plate's role within a menu. Shared so menus and plates categorise
 * courses identically (the renter can browse "mains", "desserts", etc.).
 */
export const COURSE_TYPES = [
  {title: 'Starter / appetizer', value: 'starter'},
  {title: 'Soup', value: 'soup'},
  {title: 'Salad', value: 'salad'},
  {title: 'Main', value: 'main'},
  {title: 'Side', value: 'side'},
  {title: 'Dessert', value: 'dessert'},
  {title: 'Drink', value: 'drink'},
  {title: 'Canapé / bite', value: 'canape'},
] as const

export const CUISINES = [
  {title: 'Dominican', value: 'dominican'},
  {title: 'Italian', value: 'italian'},
  {title: 'French', value: 'french'},
  {title: 'Mediterranean', value: 'mediterranean'},
  {title: 'Spanish / tapas', value: 'spanish'},
  {title: 'American', value: 'american'},
  {title: 'BBQ / grill', value: 'bbq'},
  {title: 'Seafood', value: 'seafood'},
  {title: 'Sushi / Japanese', value: 'japanese'},
  {title: 'Asian fusion', value: 'asian'},
  {title: 'Mexican', value: 'mexican'},
  {title: 'Caribbean', value: 'caribbean'},
  {title: 'Vegetarian / plant-based', value: 'vegetarian'},
  {title: 'International', value: 'international'},
] as const

export const DIETARY_OPTIONS = [
  {title: 'Vegetarian', value: 'vegetarian'},
  {title: 'Vegan', value: 'vegan'},
  {title: 'Gluten-free', value: 'gluten_free'},
  {title: 'Dairy-free', value: 'dairy_free'},
  {title: 'Nut-free', value: 'nut_free'},
  {title: 'Shellfish-free', value: 'shellfish_free'},
  {title: 'Halal', value: 'halal'},
  {title: 'Kosher', value: 'kosher'},
] as const
