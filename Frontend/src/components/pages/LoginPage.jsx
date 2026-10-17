import { useState } from "react";
import { Eye, LockKeyhole, Mail, Sun } from "lucide-react";
import { solarImage } from "../../data/solarData";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-[520px] overflow-hidden rounded-2xl border border-[#E5EBF0] bg-white shadow-sm md:grid-cols-2">
      <div
        className="flex flex-col justify-end bg-cover bg-center p-7 text-white sm:p-10"
        style={{ backgroundImage: `linear-gradient(0deg, rgba(5,31,39,.94), rgba(5,31,39,.12)), url("${solarImage}")` }}
      >
        <Sun size={36} className="mb-auto text-[#D5EAB0]" />
        <h2 className="text-3xl font-bold">Clean Energy for a Brighter Tomorrow</h2>
        <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">Explore solar insights and discover possibilities for your home.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <form className="w-full max-w-sm" onSubmit={(e) => e.preventDefault()}>
          <h2 className="text-2xl font-bold text-[#172B3A]">Welcome Back</h2>
          <p className="mt-2 text-xs text-[#718096]">Sign in to your SolarAI account</p>

          <label className="form-control mt-6 gap-2">
            <span className="label-text text-xs font-semibold">Email address</span>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83919C]" />
              <input type="email" required placeholder="you@example.com" className="input input-bordered w-full bg-white pl-10" />
            </div>
          </label>

          <label className="form-control mt-4 gap-2">
            <span className="label-text text-xs font-semibold">Password</span>
            <div className="relative">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#83919C]" />
              <input type={showPassword ? "text" : "password"} required placeholder="Enter your password" className="input input-bordered w-full bg-white pl-10 pr-10" />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#83919C]">
                <Eye size={16} />
              </button>
            </div>
          </label>

          <button className="btn mt-6 w-full border-0 bg-[#079B6A] text-white hover:bg-[#087D59]">Login</button>
          <p className="mt-4 text-center text-xs text-[#718096]">Authentication will be connected to your backend later.</p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
