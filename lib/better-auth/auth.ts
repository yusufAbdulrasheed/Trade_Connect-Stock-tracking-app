import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { sendPasswordResetOtpEmail } from "@/lib/nodemailer";
import {
  createPasswordResetRequest,
  generateNumericOtp,
} from "@/lib/password-reset/service";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}

// Create MongoDB client
const client = new MongoClient(uri, {
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
});

// Get the database instance
const db = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client, // Optional: enables database transactions
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 120,
    sendResetPassword: async ({ user, token }) => {
      const otp = generateNumericOtp();

      await createPasswordResetRequest({
        email: user.email,
        token,
        otp,
      });

      await sendPasswordResetOtpEmail({
        email: user.email,
        name: user.name,
        otp,
        expiryInMinutes: 2,
      });
    },
  },
  plugins: [nextCookies()],
});