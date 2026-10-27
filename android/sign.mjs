import { readFileSync, writeFileSync } from "node:fs";
import { signApk } from "apk_sign_ts";

const [, , input, output] = process.argv;
const key = readFileSync(new URL("./keys/key.pem", import.meta.url), "utf8");
const cert = readFileSync(new URL("./keys/cert.pem", import.meta.url), "utf8");
const { signedApk } = await signApk(new Uint8Array(readFileSync(input)), key, cert);
writeFileSync(output, signedApk);
console.log("signed", output, signedApk.length);
