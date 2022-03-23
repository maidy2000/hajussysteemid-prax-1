import { createHash } from "crypto";

console.log(createHash("sha256").update(process.argv[2]).digest("hex"));
