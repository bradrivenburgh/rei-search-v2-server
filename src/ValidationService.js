const ValidationService = {
  validateProperties(obj, requiredDictionary = {}) {
    // Get the required properties from the requiredDictionary
    const requiredProps = Object.keys(requiredDictionary);
    // Filter requiredProps array for missing required props
    const missingProps = requiredProps.filter(prop => {
      if(obj[prop] === undefined) {
        return prop;
      }
    });

    const invalidProps = [];     
    // For each key/value pair in obj, check if it is in missingProps
    // If it is, skip that iteration of the for loop
    for (const [key, value] of Object.entries(obj)) {
      if(missingProps.find(prop => prop === key)) {
        continue;
      }

      // If the validation function for values provided by caller
      // has a property that matches those in requiredPropValFuncs,
      // and if its value returns false, add it to invalidProps array
      if(requiredDictionary[key]) {
        if(requiredDictionary[key](value) === false){
          // Store invalid key and value for later processing
          invalidProps.push(key)
        }
      }
    }
    // Return error object with 2 arrays
    return {missingProps, invalidProps}
  },
  createValidationErrorObject(obj, customInvalidPropsMessages = {}) {
    const {missingProps, invalidProps} = obj;
    let copyInvalidProps = invalidProps;
    let reportArr = [];

    const defaultInvalidPropMessage = (arr) =>     
    `Invalid property values provided: ${arr.join(', ')}`;
    const defaultMissingPropsMessage = (arr) =>
      `Required properties are missing: ${arr.join(', ')}`;
    
    // Add custom messages for specific invalid properties to reportArr;
    // remove invalid props with custom messages from copyInvalidProps;
    if (Object.keys(customInvalidPropsMessages).length) {
      for (const [key, value] of Object.entries(customInvalidPropsMessages)) {
        if(missingProps.find(prop => prop === key)) {
          continue;
        }
        if (copyInvalidProps.find(prop => prop === key)) {
          reportArr.push(value);
          copyInvalidProps = copyInvalidProps
            .filter(prop => prop !== key)
        }
      }
    }
    
    // Add the default message for remaining invalid props 
    if (copyInvalidProps.length) {
      reportArr.push(defaultInvalidPropMessage(copyInvalidProps));
    }
    
    // Add missing props message
    if (missingProps.length) {
      reportArr.push(defaultMissingPropsMessage(missingProps));
    }

    return { error: { message: reportArr.join('; ') }};
  },
}

module.exports = {
  ValidationService
};
