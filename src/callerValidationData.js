    //Example caller object for ValidationService
    
    // Define invalid values for caller's required properties;
    // pass this to ValidationService
    const requiredFavoritesDictionary = {
      property: (value) => {
        if (!value) { 
          return false;
        }
      },
    };

    // Custom validation messages here
    const customInvalidPropsMessages = {
      address: '',
    };

    module.exports = {
      requiredFavoritesDictionary,
      customInvalidPropsMessages
    };