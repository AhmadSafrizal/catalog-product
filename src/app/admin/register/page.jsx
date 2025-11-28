"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (res.ok) {
        // set cookie
        const token = json.data?.token; // register doesn't return token currently
        // If API later returns token, set cookie; otherwise just navigate to login
        if (token) {
          const maxAge = 7 * 24 * 60 * 60;
          document.cookie = `adminAccessToken=${token}; Path=/; Max-Age=${maxAge}`;
          router.push("/admin/products");
        } else {
          router.push("/admin/login");
        }
      } else {
        setError(json.error || "Register failed");
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Admin Register</h1>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <form onSubmit={submit}>
          <div className="mb-4">
            <label className="block mb-1">Name</label>
            <input className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Email</label>
            <input className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Password</label>
            <input type="password" className="input input-bordered w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <button className="btn btn-primary w-full" type="submit">Register</button>
          </div>
        </form>
      </div>
    </div>
  );
}
