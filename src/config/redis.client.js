import redis from 'redis';
import dotenv from 'dotenv';
dotenv.config();

const connectToRedis = async () => {
  const redisClient = await new redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    },
    username: 'default',
    password: process.env.REDIS_PASSWORD,
  });

  //   connect to Redis server
  await redisClient.connect();

  redisClient.on('connect', () => {
    console.log('🚀🚀🚀=== Connect to Redis successfully and ready!');
  });

  redisClient.on('error', (err) => {
    console.log('❌❌❌=== Connect to Redis serer failure: ', err);
  });

  // add method disconnect for redisClient
  redisClient.disconnect = () => {
    console.log('🚀🚀🚀=== Disconnected Redis server!');
    redisClient.quit();
  };

  return redisClient;
};

export default connectToRedis;
