import fs from "fs/promises";
import path from "path";

export interface StorageProvider {
  upload(file: Buffer | Uint8Array, fileName: string, folder?: string): Promise<string>;
  delete(fileUrl: string): Promise<boolean>;
}

class LocalFileStorage implements StorageProvider {
  private uploadDir = path.join(process.cwd(), "public", "uploads");

  async upload(file: Buffer | Uint8Array, fileName: string, folder = "products"): Promise<string> {
    const targetDir = path.join(this.uploadDir, folder);
    await fs.mkdir(targetDir, { recursive: true });

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    const finalFileName = `${baseName}-${uniqueSuffix}${ext}`;
    const filePath = path.join(targetDir, finalFileName);

    await fs.writeFile(filePath, file);

    // Return relative public URL path
    return `/uploads/${folder}/${finalFileName}`;
  }

  async delete(fileUrl: string): Promise<boolean> {
    try {
      if (!fileUrl.startsWith("/uploads/")) return false;
      const relativePath = fileUrl.replace(/^\//, "");
      const fullPath = path.join(process.cwd(), "public", relativePath);
      await fs.unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton storage instance (can be easily swapped to S3Storage later)
export const storage: StorageProvider = new LocalFileStorage();
