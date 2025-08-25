import { HashnodeService } from "../services/hashnodeService";

async function testHashnodeConnection() {
  try {
    console.log("Testing Hashnode connection...");
    const service = new HashnodeService();
    const publications = await service.getPublications();
    console.log("✅ Success! Available publications:");
    publications.forEach((pub) => {
      console.log(`   - ${pub.name} (${pub.domain || "no domain"})`);
    });
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);
  }
}

testHashnodeConnection();
