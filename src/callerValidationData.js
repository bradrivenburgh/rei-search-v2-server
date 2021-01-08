    //Example caller object for ValidationService
    
    // Define invalid values for caller's required properties;
    // pass this to ValidationService
    const requiredDictionary = {
      address: (value) => {
        const specialChars = ['@', '*', ':', '\'', '&', ";"]
        const isInvalid = specialChars.some(char => {
          return value.trim().includes(char)
        });
        
        if (isInvalid) { 
          return false;
        }
      },
    };

    // Custom validation messages here
    const customInvalidPropsMessages = {
      address: 'Invalid property provided: the location must not include: @, *, : \', &, or ;',
    };

    module.exports = {
      requiredDictionary,
      customInvalidPropsMessages
    };