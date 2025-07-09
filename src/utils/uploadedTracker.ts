import fs from "fs";
import path from "path";

const filePath = path.resolve(process.cwd(), "src/data/uploaded.json");

export const getUploadedUUIDs = (): string[] => {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

export const addUploadedUUID = (uuid: string) => {
  const list = getUploadedUUIDs();
  if (!list.includes(uuid)) {
    list.push(uuid);
    fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  }
};