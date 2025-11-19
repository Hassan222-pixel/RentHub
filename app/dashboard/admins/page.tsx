/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, FormEvent } from "react";

interface AdminUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "accounts-admin",
  });

  const fetchAdmins = async () => {
    setLoading(true);
    const res = await fetch("/api/admins");
    if (!res.ok) {
      setError("Failed to load admins (maybe not super-admin?)");
      setLoading(false);
      return;
    }
    const data = await res.json();
    const normalized = data.admins.map((a: any) => ({
      id: a._id,
      name: a.name,
      email: a.email,
      role: a.role,
    }));
    setAdmins(normalized);
    setLoading(false);
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchAdmins();
    });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Failed to create admin");
      return;
    }

    setFormData({ name: "", email: "", password: "", role: "accounts-admin" });
    fetchAdmins();
  };

  return (
    <div>
      <h2>Admin Users</h2>
      <p>Only Super Admin can see and manage this page.</p>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      <div className="row mt-4">
        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5>Create New Admin</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input
                    className="form-control"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, password: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    className="form-select"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, role: e.target.value }))
                    }
                  >
                    <option value="super-admin">Super Admin</option>
                    <option value="accounts-admin">Accounts Admin</option>
                    <option value="managers-admin">Managers Admin</option>
                  </select>
                </div>
                <button className="btn btn-success" type="submit">
                  Create Admin
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card">
            <div className="card-body">
              <h5>Existing Admins</h5>
              {loading ? (
                <p>Loading...</p>
              ) : (
                <table className="table table-striped table-sm mt-2">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>{admin.name}</td>
                        <td>{admin.email}</td>
                        <td className="text-uppercase">{admin.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
