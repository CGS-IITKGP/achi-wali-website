import mongoose from "mongoose";

const uri = "mongodb+srv://shubhamkrishan999:fZMeiE9puWtciZCP@shub-dev.rrcmgev.mongodb.net/primary?appName=Shub-Dev";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const blogs = await db.collection("blogs").find({}).toArray();
  console.log(`Found ${blogs.length} blogs.`);
  blogs.forEach(b => {
    if (b.content.includes("frac")) {
      console.log("-----");
      console.log("Slug:", b.slug);
      console.log("Content around frac:\n", b.content.substring(b.content.indexOf("frac") - 100, b.content.indexOf("frac") + 300));
    }
  });
  process.exit(0);
}

run();
