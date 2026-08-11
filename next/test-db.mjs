import mongoose from "mongoose";

const uri = "mongodb+srv://shubhamkrishan999:fZMeiE9puWtciZCP@shub-dev.rrcmgev.mongodb.net/primary?appName=Shub-Dev";

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  const blogs = await db.collection("blogs").find({}).toArray();
  blogs.forEach(b => {
    if (b.content.includes("$$")) {
      console.log("-----");
      console.log("Slug:", b.slug);
      console.log("Content around $$:\n", JSON.stringify(b.content));
    }
  });
  process.exit(0);
}

run();
