const deepMerge = (obj1, obj2) => {
   
    // Create a new object that combines the properties of both input objects
    const merged = {
        ...obj1,
        ...obj2
    };
    
    if(Object.keys(obj2).length) {
        
        // Loop through the properties of the merged object
        for (const key of Object.keys(merged)) {
            // Check if the property is an object
            if (typeof merged[key] === 'object' && merged[key] !== null) {
                // If the property is an object, recursively merge the objects
                if(obj2[key]) {
                    merged[key] = deepMerge(obj1[key], obj2[key]);
                }
                
            }
        }
        
    }
    
    return merged;
}

export { deepMerge };