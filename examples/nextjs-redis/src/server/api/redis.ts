import { createClient } from "redis";

export const redis = createClient({
  password: "7N4FnH7UiLBXzy2YmvbNHGxfKGXcM9nv",
  socket: {
    host: "redis-18382.c73.us-east-1-2.ec2.cloud.redislabs.com",
    port: 18382,
  },
  disableOfflineQueue: true,
});
