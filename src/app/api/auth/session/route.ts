import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import connectDB from "@/lib/db/connect";
import User from "@/lib/db/models/user.model";
import { createSession } from "@/lib/auth/session";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, targetRole } = body;

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "No ID token provided" },
        { status: 400 }
      );
    }

    // 1. Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Check if user exists
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // 4. First User Bootstrap: If no users exist in DB, make this one admin
      const userCount = await User.countDocuments();
      let role = userCount === 0 ? "admin" : "citizen";

      // If a specific targetRole is requested, use it instead of default citizen (unless admin bootstrap)
      if (userCount > 0 && targetRole && ["citizen", "authority"].includes(targetRole)) {
        role = targetRole;
      }

      user = await User.create({
        firebaseUid: uid,
        email: email,
        displayName: name || email.split("@")[0],
        photoURL: picture || "",
        role: role,
        department: role === "authority" ? "Public Works" : undefined,
        jurisdiction: role === "authority" ? "Ward 42" : undefined,
      });
      
      console.log(`✨ Created new user: ${email} with role: ${role}`);
    } else {
      // If targetRole is explicitly requested, let the user switch their role dynamically
      if (targetRole && ["citizen", "authority"].includes(targetRole)) {
        user.role = targetRole;
        if (targetRole === "authority") {
          user.department = user.department || "Public Works";
          user.jurisdiction = user.jurisdiction || "Ward 42";
        } else {
          user.department = undefined;
          user.jurisdiction = undefined;
        }
        await user.save();
        console.log(`🔄 Switched user ${email} role to: ${targetRole}`);
      } else if (user.photoURL !== picture || user.displayName !== name) {
        // Optional: Update photoURL/displayName if changed in Google
        user.photoURL = picture || user.photoURL;
        user.displayName = name || user.displayName;
        await user.save();
      }
    }

    // 5. Create our HTTP-only session cookie
    await createSession({
      userId: user._id.toString(),
      firebaseUid: uid,
      email: user.email,
      role: user.role,
      expiresAt: "", // Set inside createSession
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: user._id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        reputation: user.reputation,
      },
    });
  } catch (error: any) {
    console.error("Session API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
