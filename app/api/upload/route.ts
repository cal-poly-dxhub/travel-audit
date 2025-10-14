import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Here you would typically save the file to a storage service
    // For now, we'll just return a success response
    console.log(`Received file: ${file.name}, size: ${file.size} bytes`)

    return NextResponse.json({
      message: "File uploaded successfully",
      filename: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
