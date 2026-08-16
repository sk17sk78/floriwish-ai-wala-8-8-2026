import * as dotenv from "dotenv";
dotenv.config();

import { getFirebaseAdminApp, isFirebaseAdminConfigured } from "@/config/firebaseAdmin";

async function testAdmin() {
  console.log("=== Testing Firebase Admin SDK Live Initialization ===");
  console.log("isFirebaseAdminConfigured():", isFirebaseAdminConfigured());

  const app = getFirebaseAdminApp();
  if (!app) {
    console.error("❌ Failed to initialize Firebase Admin App");
    process.exit(1);
  }

  console.log("✅ Firebase Admin App Initialized Successfully!");
  console.log("App Name:", app.name);
  console.log("Project ID:", app.options.projectId);
  process.exit(0);
}

testAdmin();
