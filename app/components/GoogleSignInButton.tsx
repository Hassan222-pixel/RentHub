"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton({
  callbackUrl = "/",
}: {
  callbackUrl?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => signIn("google", { callbackUrl })}
      className="btn w-100 mb-2"
      style={{ border: "1px solid #ddd" }}
    >
      <img
        src="https://www.svgrepo.com/show/475656/google-color.svg"
        width={18}
        style={{ marginRight: 8 }}
        alt="Google"
      />
      Continue with Google
    </button>
  );
}
