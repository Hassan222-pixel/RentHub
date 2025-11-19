"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AccountsPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.replace("/login");
        return;
      }
      const { user } = await res.json();
      if (!(user.role === "super-admin" || user.role === "accounts-admin")) {
        router.replace("/dashboard");
        return;
      }
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Accounts Section</h2>
      <p>Only Super Admin and Accounts Admin can access this page.</p>
      <div className="alert alert-info mt-3">
        This is where you manage financial accounts, invoices, etc.
      </div>
    </div>
  );
}
