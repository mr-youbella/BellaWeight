"use client";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { faArrowRight, faMailBulk } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../auth/auth";

export default function Register()
{
	const	is_valid = useAuth();
	const	router = useRouter();
	let		[username, setUsername] = useState<string>("");
	let		[email, setEmail] = useState<string>("");
	let		[password, setPassword] = useState<string>("");
	let		[error, setError] = useState<string | null>(null);
	let		[loading, setLoading] = useState<boolean>(false);

	useEffect(() =>
	{
		if (is_valid === true)
			router.replace("/started");
	}, [is_valid]);
	if (is_valid === null)
		return (null); 
	async function handleSubmit(e: React.FormEvent)
	{
		e.preventDefault();
		setError(null);
		setLoading(true);
		try
		{
			const	res = await fetch(`${process.env.BACKEND_URL}/users`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({username, email, password}),
			});
			const	data = await res.json();
			if (!res.ok)
				return setError(data.error || "Something went wrong");
			else
				router.push("/login");
		}
		catch (err)
		{
			setError("Server is not responding");
		}
		finally
		{
			setLoading(false);
		}
	}

	return (
		<main className="flex flex-col md:w-2/3 xl:w-1/2 md:mx-auto p-10">
			<div className="flex flex-col justify-center items-center text-center">
				<img className="w-20" src="/logo.png" alt="logo"/>
				<h1 className="text-3xl font-bold">BellaWeight</h1>
			</div>
			<div className="mt-10 bg-white rounded-3xl shadow-2xl shadow-black/50 xl:w-1/2 xl:mx-auto p-7 py-10">
				<form className="flex flex-col" onSubmit={handleSubmit}>
					<h2 className="text-xl font-bold">Create Account</h2>
					<p className="">Start your health journey today</p>
					<div>
						<div className="flex flex-col-reverse space-y-1 mt-3">
							<div className="relative flex items-center">
								<input value={username} onChange={(e) => (setUsername(e.target.value))} autoFocus className="peer w-full rounded-md p-1.5 px-2 pl-8 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="password" type="username" placeholder="youbella"/>
								<span className="absolute left-3 text-sm font-semibold text-gray-500 select-none"><FontAwesomeIcon icon={faMailBulk}/></span>
							</div>
							<label className="text-xs text-gray-600/90 font-bold transition-colors duration-300 peer-focus:text-[#6760FD] mb-1" htmlFor="username">Username</label>
						</div>
					</div>
					<div>
						<div className="flex flex-col-reverse space-y-1 mt-3">
							<div className="relative flex items-center">
								<input value={email} onChange={(e) => (setEmail(e.target.value))} className="peer w-full rounded-md p-1.5 px-2 pl-8 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="email" type="email" placeholder="youbella@bellaweight.com"/>
								<span className="absolute left-3 text-sm font-semibold text-gray-500 select-none"><FontAwesomeIcon icon={faMailBulk}/></span>
							</div>
							<label className="text-xs text-gray-600/90 font-bold transition-colors duration-300 peer-focus:text-[#6760FD] mb-1" htmlFor="login">Email</label>
						</div>
					</div>
					<div>
						<div className="flex flex-col-reverse space-y-1 mt-3">
							<div className="relative flex items-center">
								<input value={password} onChange={(e) => (setPassword(e.target.value))} className="peer w-full rounded-md p-1.5 px-2 pl-8 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="password" type="password" placeholder="••••••••••••"/>
								<span className="absolute left-3 text-sm font-semibold text-gray-500 select-none"><FontAwesomeIcon icon={faMailBulk}/></span>
							</div>
							<label className="text-xs text-gray-600/90 font-bold transition-colors duration-300 peer-focus:text-[#6760FD] mb-1" htmlFor="password">Password</label>
						</div>
					</div>
					<button className={`mt-4 bg-[#4D44E3] rounded-xl text-white font-semibold py-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 hover:bg-[#4037f0]`}>Sign Up <FontAwesomeIcon icon={faArrowRight}/></button>
				</form>
			</div>
			<p className="text-center text-sm mt-5 text-gray-600">Already have an account!? <Link className="text-[#4D44E3] font-bold hover:underline" href="/login">Login</Link></p>
			<div className="xl:w-1/3 mx-5 xl:mx-auto flex justify-between mt-5 text-xs font-semibold text-black/60">
				<p className="cursor-pointer">Privacy Policy</p>
				<p>•</p>
				<p className="cursor-pointer">Terms of Service</p>
			</div>
		</main>
	);
}
