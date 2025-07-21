import { NextResponse } from "next/server";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getFirebaseConfig } from "@/lib/firebase";

export async function POST(request: Request) {
  try {
    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json({ error: "Missing file path" }, { status: 400 });
    }

    const app = initializeApp(getFirebaseConfig());
    const storage = getStorage(app);

    const fileRef = ref(storage, filePath);

    await deleteObject(fileRef);

    return NextResponse.json(
      { message: "File deleted successfully" },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 },
    );
  }
}
