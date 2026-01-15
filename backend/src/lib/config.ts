import 'dotenv/config';

const config = {
  jwtSecret: process.env.JWT_SECRET as string,
};

if (!config.jwtSecret) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}

export default config;
