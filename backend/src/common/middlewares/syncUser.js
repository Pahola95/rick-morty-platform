const userRepository = require('../../modules/users/user.repository');

// src/common/middlewares/syncUser.js
const syncUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth.payload.sub;

    // Auth0 guarda el email en diferentes lugares según la config
    const email = req.auth.payload.email              // ← Intentar directo primero
                  || req.auth.payload[`${process.env.AUTH0_AUDIENCE}email`]
                  || null;

    const name = req.auth.payload.name
                 || req.auth.payload.nickname
                 || req.auth.payload[`${process.env.AUTH0_AUDIENCE}name`]
                 || 'Usuario';

    console.log('SYNC USER PAYLOAD:', JSON.stringify(req.auth.payload, null, 2));

    let user = await userRepository.findByAuth0Id(auth0Id);

    if (!user) {
      user = await userRepository.createUser({ auth0Id, email, name });
    } else if (!user.email && email) {
      // Actualizar email si estaba vacío
      await user.update({ email, name });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = syncUser;