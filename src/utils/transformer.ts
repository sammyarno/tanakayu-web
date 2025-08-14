export const snakeToCamel = <T>(obj: any): T => {
  // If obj is null or not an object, return as is
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays by mapping each element
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item)) as T;
  }

  // Create a new object to store transformed key-value pairs
  const transformedObj: { [key: string]: any } = {};

  // Transform each key-value pair
  Object.entries(obj).forEach(([key, value]) => {
    // Transform key from snake_case to camelCase
    const camelKey = key.replace(/_([a-zA-Z])/g, (_, letter) => letter.toUpperCase());

    // Recursively transform nested objects/arrays
    transformedObj[camelKey] = snakeToCamel(value);
  });

  return transformedObj as T;
};
