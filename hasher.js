import { createHash } from "crypto";

console.log(createHash("sha256").update(process.argv).digest("hex"));
