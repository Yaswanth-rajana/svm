import mongoose from "mongoose";
import dotenv from "dotenv";
import Lead from "./src/models/Lead.js";
import InfrastructureLead from "./src/models/InfrastructureLead.js";
import CourseLead from "./src/models/CourseLead.js";

dotenv.config();

const run = async () => {
  const dryRun = process.argv.includes("--dry-run");

  try {
    console.log("🚀 Initializing Migration Script...");
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB.");

    // Fetch all leads from the original leads collection
    const leads = await Lead.find({});
    console.log(`🔍 Found ${leads.length} total leads to process.`);

    let infraCount = 0;
    let courseCount = 0;

    const migrations = [];

    for (const lead of leads) {
      const isInfra = lead.program === "it-infrastructure";
      if (isInfra) {
        infraCount++;
      } else {
        courseCount++;
      }

      if (!dryRun) {
        const leadObj = lead.toObject();
        leadObj.leadType = isInfra ? "infrastructure" : "course";

        const TargetModel = isInfra ? InfrastructureLead : CourseLead;

        // Add migration promise to our execution list
        migrations.push(
          TargetModel.updateOne(
            { _id: leadObj._id },
            { $set: leadObj },
            { upsert: true, timestamps: false }
          )
        );
      }
    }

    if (dryRun) {
      console.log("\n--- DRY RUN PREVIEW ---");
      console.log("Would move:");
      console.log(`👉 ${infraCount} leads → infrastructure_leads`);
      console.log(`👉 ${courseCount} leads → course_leads`);
      console.log("-----------------------");
      console.log("💡 No changes were written. Run without --dry-run to execute actual migration.");
    } else {
      console.log(`\n⏳ Running actual migration. Moving ${migrations.length} leads...`);
      await Promise.all(migrations);
      console.log(`✅ Success! Migrated ${infraCount} to infrastructure_leads and ${courseCount} to course_leads.`);
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    try {
      await mongoose.disconnect();
    } catch (_) {}
    process.exit(1);
  }
};

run();
