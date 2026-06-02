"use client";
import { faScaleBalanced, faDumbbell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "../auth/auth";
import useGetData from "../analyticsWeight/getData";

const quotes =
[
	"The only bad workout is the one that didn't happen.",
	"Push yourself, because no one else is going to do it for you.",
	"Your body can stand almost anything. It's your mind you have to convince.",
	"Success starts with self-discipline.",
	"The harder you work, the better you get.",
];

export default function Home()
{
	const { is_valid } = useAuth();
	const router = useRouter();
	const { result } = useGetData();
	const quote	 = quotes[new Date().getDay() % quotes.length];

	useEffect(() =>
	{
		if (is_valid === false)
			router.replace("/login");
	}, [is_valid]);

	if (is_valid === null || result === null)
		return (null);
	if (result === false)
		return (null);

	const { data } = result;

	return (
		<div className="min-h-screen bg-[#EEEEF8]">
			<nav className="bg-[#E2DFFF] p-3 xl:w-1/2 xl:mx-auto">
				<div className="flex justify-between">
					<div className="flex gap-2">
						<img className="w-15 rounded-full" src="/logo.png" alt="logo"/>
						<div>
							<h1 className="text-2xl font-bold text-[#3323CC]">BellaWeight</h1>
							<p className="text-[#68788F] font-semibold">Hello, {data.name}</p>
						</div>
					</div>
					<button onClick={() => { localStorage.removeItem("token"); router.replace("/login"); }} className="bg-[#f12222] p-1 px-4 my-auto rounded-xl text-white mt-5 font-semibold cursor-pointer transition-all duration-300 hover:shadow-2xl hover:bg-[#e53939]">Log Out</button>
				</div>
			</nav>
			<main className="m-5 xl:w-1/2 xl:mx-auto">
				<div className="bg-linear-to-r from-[#4F46E5] to-[#6366F1] p-8 rounded-2xl text-white mt-5">
					<h2 className="text-4xl font-bold">Welcome back, {data.name}!</h2>
					<div className="flex gap-2 mt-3">
						<div className="w-1 bg-[#00A572] rounded-full"></div>
						<p className="italic text-white/80">"{quote}"</p>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 mt-5">
					<div onClick={() => router.push("/analyticsWeight")} className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-all duration-300">
						<div className="bg-[#E2DFFF] p-4 rounded-full">
							<FontAwesomeIcon className="text-2xl text-[#4F46E5]" icon={faScaleBalanced}/>
						</div>
						<p className="uppercase text-xs font-semibold text-[#505F76]">Weight Tracker</p>
						<p className="text-lg font-semibold">Log Weight</p>
					</div>
					<div onClick={() => router.push("/planks")} className="bg-white rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:shadow-lg transition-all duration-300">
						<div className="bg-[#E8F5E9] p-4 rounded-full">
							<FontAwesomeIcon className="text-2xl text-[#2E7D32]" icon={faDumbbell}/>
						</div>
						<p className="uppercase text-xs font-semibold text-[#505F76]">Active Challenge</p>
						<p className="text-lg font-semibold">Plank Challenge</p>
					</div>
				</div>
				<div className="mt-5">
					<p className="uppercase text-xs font-semibold text-[#505F76] mb-3">Daily Progress</p>
					<div>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-white rounded-2xl p-5">
								<p className="text-[#505F76] text-sm font-semibold">Current Weight</p>
								<p className="text-2xl font-bold mt-1">{data.weight} <span className="text-[0.6em]">Kg</span></p>
							</div>
							<div className="bg-white rounded-2xl p-5">
								<p className="text-[#505F76] text-sm font-semibold">Goal Weight</p>
								<p className="text-2xl font-bold mt-1">{data.goal_weight} <span className="text-[0.6em]">Kg</span></p>
							</div>
						</div>
					</div>
					<div className="mt-4">
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-white rounded-2xl p-5">
								<p className="text-[#505F76] text-sm font-semibold">LAST PLANK</p>
								<p className="text-2xl font-bold mt-1">{"XXX"} <span className="text-[0.6em]">Kg</span></p>
							</div>
							<div className="bg-white rounded-2xl p-5">
								<p className="text-[#505F76] text-sm font-semibold">Best Plank</p>
								<p className="text-2xl font-bold mt-1">{"XXX"} <span className="text-[0.6em]">Kg</span></p>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
