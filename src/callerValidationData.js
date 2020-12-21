    //Example caller object for ValidationService
    
    // Define invalid values for caller's required properties;
    // pass this to ValidationService
    const requiredDictionary = {
      title: (value) => {
        if (!value) { 
          return false;
        }
      },
      url: (value) => {
        if (!value) {
          return false;
        }
      },
      rating: (value) => {
        if (typeof value !== 'number' || value < 0 || value > 5) {
          return false;
        }
      },
    };

    // Custom validation messages here
    const customInvalidPropsMessages = {
      rating: 'Invalid property provided: rating -- must be a number between 0 and 5',
    };

    module.exports = {
      requiredDictionary,
      customInvalidPropsMessages
    };