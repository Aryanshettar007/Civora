/**
 * Uploads a file to ImgBB and returns the public download URL.
 * Bypasses Firebase Storage to avoid Blaze plan requirements.
 * @param file The file to upload
 */
export async function uploadImage(file: File): Promise<string> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
    if (!apiKey) throw new Error("Missing ImgBB API Key");

    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    
    if (data.success) {
      // Use display_url (medium optimized web-sized image) instead of original raw url (can be 5MB+) for 10x faster loads
      return data.data.display_url || data.data.url;
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (error) {
    console.error("Error uploading image to ImgBB:", error);
    throw new Error("Failed to upload image");
  }
}
