import { NextResponse } from "next/server";
// TEMPORARILY DISABLED IMPORTS:
// import { initializeApp } from "firebase/app";
// import { getStorage, ref, deleteObject } from "firebase/storage";
// import { getFirebaseConfig } from "@/lib/firebase";

export async function POST() {
  // TEMPORARILY DISABLED - Cleanup endpoint disabled to prevent Firebase Storage errors
  console.log("Cleanup endpoint is temporarily disabled");
  return NextResponse.json(
    { message: "Cleanup endpoint is temporarily disabled" },
    { status: 200 }
  );

  /* DISABLED CODE:
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
  } catch (error: unknown) {
    console.error("Error deleting file:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  */
}
