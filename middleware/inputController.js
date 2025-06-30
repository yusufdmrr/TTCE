const { identityValidation } = require('../helpers/identityValidation');
const {
  createCustomError,
  errorRoute
} = require('../errors/custom-error');

const inputControllerMiddleware = (inputModel, updateFunction, type, pass) => {
  return async (req, res, next) => {
    try {
      // 🧠 Gelen inputları güvenli şekilde ayrıştır (trim, parseInt, parseFloat gibi)
      const rawInput = type === 'post' ? req.body : req.params;
      const parsedInput = {};

      // 🔐 Sayıya çevrilmeyecek özel alanlar
      const alwaysStringFields = ['email', 'password', 'name', 'surname', 'description'];

      for (const key in rawInput) {
        const value = rawInput[key];

        if (typeof value === 'string') {
          const trimmed = value.trim();

          // ✨ Bu alan string kalmalı (şifre, email vs.)
          if (alwaysStringFields.includes(key)) {
            parsedInput[key] = trimmed;
          } else {
            // sayıya çevrilebiliyorsa çevir
            if (!isNaN(trimmed) && trimmed !== "") {
              parsedInput[key] = trimmed.includes('.') ? parseFloat(trimmed) : parseInt(trimmed);
            } else {
              parsedInput[key] = trimmed;
            }
          }

        } else {
          parsedInput[key] = value; // string değilse doğrudan ata
        }
      }

      // ✅ Zod validasyonundan geçir
      const validatedData = await inputModel.safeParseAsync(parsedInput);
      if (!validatedData.success) {
        const missingInputPath = validatedData.error.errors[0].path[0];
        return next(createCustomError(1000, errorRoute.enum.general, missingInputPath));
      }

      let results;
      if (!pass) {
        const { userId } = parsedInput;
        const identityObject = { userId };
        results = await identityValidation(identityObject, next);

        if (results.returnedError?.authority) {
          return next(createCustomError(2000, errorRoute.Enum.admin));
        }
      }

      res.locals.req = req;
      await updateFunction(validatedData.data, res, next, results);

    } catch (error) {
      console.error('🔥 inputControllerMiddleware hatası:', error);
      return next(createCustomError(9000, errorRoute.enum.general));
    }
  };
};

module.exports = {
  inputControllerMiddleware
};
