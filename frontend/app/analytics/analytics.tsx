"use client";
import { faGripfire } from "@fortawesome/free-brands-svg-icons";
import { faArrowDown, faArrowUp, faCalendar, faClock, faGauge, faHistory, faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Modal from '@mui/material/Modal';
import { useEffect, useState } from "react";
import 'animate.css';
import { useRouter } from "next/navigation";
import useGetData from "./getData";
import useAuth from "../auth/auth";

export default function Analytics()
{
	const	is_valid = useAuth();
	const	router = useRouter();
	let		[weight, setWeight] = useState<number | "">("");
	let		[date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
	let		[time, setTime] = useState<string>(new Date().toTimeString().slice(0, 5));
	let		[error, setError] = useState<boolean>(false);
	let		[open, setOpen] = useState<boolean>(false);
	const	{ result, refresh } = useGetData();
	useEffect(() =>
	{
		if (is_valid === false)
			router.replace("/login");
	}, [is_valid]);
	if (is_valid === null || result === null)
		return (null);
	if (result === false)
		return (null);
	const { data, all_weight } = result;
	async function addWeight()
	{
		const	token = localStorage.getItem("token");
		if (!token)
			return;
		try
		{
			console.log( new Date(`${date}T${time}`).toISOString());
			const me_res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
			{
				method:  "GET",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!me_res.ok)
				return ;
			const	me = await me_res.json();
			const	res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/all_weight`,
			{
				method:  "POST",
				headers:
				{
					"Content-Type": "application/json",
					Authorization:  `Bearer ${token}`,
				},
				body: JSON.stringify({ user_id: me.id, weight:  Number(weight), date: new Date(`${date}T${time}`).toISOString() }),
			});
			console.log(await res.json());
			if (!res.ok)
				return ;
			// const new_entry = await res.json();
			// setAllWeight((prev) => [...prev, new_entry]);
			refresh();
		}
		catch (err)
		{
			console.error("Failed to add weight:", err);
		}
	}
	async function logWeight()
	{
		if (!(Number(weight) >= 1 && Number(weight) <= 1000))
		{
			setError(true);
			return ;
		}
		setError(false);
		setOpen(false);
		await addWeight();
		setWeight("");
		setDate(new Date().toISOString().split("T")[0]);
		setTime(new Date().toTimeString().slice(0, 5));
	}
	const	current_weight = all_weight.length ? Number(all_weight.reduce((max, item) => (new Date(item.date) > new Date(max.date) ? item : max)).weight) : 0;
	const	highest = Math.max(...all_weight.map((w) => Number(w.weight)));
	const	lowest  = Math.min(...all_weight.map((w) => Number(w.weight)));
	const	average = (all_weight.reduce((sum, w) => (sum + Number(w.weight)), 0) / all_weight.length).toFixed(2);
	const	goal = Number(data.goal_weight);
	const	maxDistance = 50; 
	let		progress = (1 - Math.abs(current_weight - goal) / maxDistance) * 100;
	progress = Math.max(0, Math.min(progress, 100));
	progress = Math.round(progress);
	const	bmi = data ? current_weight / ((data.height / 100) * (data.height / 100)) : 0;

	return (
		<div>
			<nav className="bg-[#E2DFFF] p-3">
				<div className="flex justify-between">
					<div className="flex gap-2">
						<img className="w-15 rounded-full" src="/logo.png" alt="logo"/>
						<div>
							<h1 className="text-2xl font-bold text-[#3323CC]">BellaWeight</h1>
							<p className="text-[#68788F] font-semibold">Hello, {data ? data.name : ""}</p>
						</div>
					</div>
					<button onClick={() => {localStorage.removeItem("token"); router.replace("/login");}} className="bg-[#f12222] p-1 px-4 my-auto rounded-xl text-white mt-5 font-semibold cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-olive-400 hover:bg-[#e53939]">Log Out</button>
				</div>
			</nav>
			<main className="m-5 xl:mx-20 animate__animated animate__bounceInLeft">
				<div className="bg-[#4F46E5] p-5 rounded-2xl text-white">
					<h3 className="uppercase text-[#B7C8E1] font-semibold text-sm">Current Weight</h3>
					<p className="text-3xl font-bold">{current_weight}<span className="text-[0.6em]"> Kg</span></p>
					<div className="mt-5">
						<div className="flex justify-between mb-1">
							<p className="text-sm font-semibold">Progress to {data.goal_weight}<span className="text-xs"> Kg</span></p>
							<p className="text-sm font-semibold">{progress}%</p>
						</div>
						<div className="h-2 w-full bg-white/30 rounded-2xl">
							<div className={`h-full bg-white rounded-2xl transition-all duration-300`} style={{width: `${progress}%`}}></div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3 mt-5">
					<div className="rounded-2xl p-5 bg-white">
						<FontAwesomeIcon className="text-xl font-bold text-[#3323CC]" icon={faArrowUp}/>
						<h4 className="text-[#505F76] font-semibold">Highest</h4>
						<p className="text-2xl font-bold">{highest}<span className="text-[0.6em]"> Kg</span></p>
					</div>
					<div className="rounded-2xl p-5 bg-white">
						<FontAwesomeIcon className="text-xl font-bold text-[#3323CC]" icon={faArrowDown}/>
						<h4 className="text-[#505F76] font-semibold">Lowset</h4>
						<p className="text-2xl font-bold">{lowest}<span className="text-[0.6em]"> Kg</span></p>
					</div>
					<div className="rounded-2xl p-5 bg-white">
						<FontAwesomeIcon className="text-xl font-bold text-[#3323CC]" icon={faGauge}/>
						<h4 className="text-[#505F76] font-semibold">Average</h4>
						<p className="text-2xl font-bold">{average}<span className="text-[0.6em]"> Kg</span></p>
					</div>
					<div className="rounded-2xl p-5 bg-white">
						<FontAwesomeIcon className="text-xl font-bold text-[#00A572]" icon={faGripfire}/>
						<h4 className="text-[#505F76] font-semibold">Streak</h4>
						<p className="text-2xl font-bold">12<span className="text-[0.6em]"> days</span></p>
					</div>
				</div>
				<div className="mt-5">
					<div className="flex justify-between">
						<h3 className="text-xl font-semibold">Weight Trend</h3>
						<p className="uppercase text-sm font-semibold text-[#6760FD]">last 30 days</p>
					</div>
					<div className="w-full h-75 select-none outline-none focus:outline-none">
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={[...all_weight].sort((a, b) => (new Date(a.date).getTime() - new Date(b.date).getTime()))}>
								<Area type={"monotone"} dataKey="weight" stroke="#1D00A5" fill="#8582FF" strokeWidth={2} dot={{r: 5}}/>
								<XAxis dataKey="date" tickFormatter={(value) => (new Date(value).toISOString().split('T')[0])}/>
								<YAxis dataKey="weight"/>
								<Tooltip labelFormatter={(value) => {const d = new Date(value); return `${d.toLocaleDateString("en-GB")} ${d.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit",})}`;}}/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
					<div className="rounded-2xl p-5 bg-white">
						<div className="flex justify-between">
							<h4 className="text-xl font-bold">BMI Index</h4>
							<p className="text-base bg-[#6FFBBE]/50 p-1 rounded-xl px-3 text-[#005236] font-semibold">Healthy</p>
						</div>
						<div className="grid md:flex justify-items-center gap-3 mt-3">
							<div className="relative w-20 aspect-square">
  								<div className="absolute inset-0 rounded-full border-8 border-black/20"></div>
  								<div className="absolute inset-0 rounded-full border-8 border-[#005236] border-t-transparent rotate-45"></div>
								<div className="absolute inset-0 flex items-center justify-center text-black font-bold">{bmi.toFixed(2)}</div>
  							</div>
							<div className="w-full">
								<div className="flex justify-between text-sm font-semibold mb-2 px-1">
									<span>Under</span>
									<span>Healthy</span>
									<span>Over</span>
								</div>
								<div className="flex w-full h-2 overflow-hidden rounded-full">
									<div className="w-1/4 bg-cyan-400"></div>
									<div className="w-2/4 bg-green-800"></div>
									<div className="w-1/4 bg-red-600"></div>
								</div>
								<p className="mt-2 text-gray-600 text-sm font-semibold">Your BMI is in the healthy range for your height.</p>
							</div>
						</div>
					</div>
				</div>
				<div className="mt-5">
					<div className="flex justify-between">
						<h3 className="text-xl font-semibold">Weight Trend</h3>
						<p className="uppercase text-sm font-semibold text-[#6760FD]">View all</p>
					</div>
					<div className="mt-5 grid grid-cols-1 gap-2">
						{[...all_weight].sort((a, b) => (new Date(b.date).getTime() - new Date(a.date).getTime())).map((value, index) =>
						{
							return (
								<div key={index} className="flex justify-between bg-white rounded-2xl p-4">
									<div className="flex gap-3">
										<FontAwesomeIcon className="my-auto text-xl rounded-full bg-[#C3C0FF] text-[#4D44E3] p-2" icon={faHistory}/>
										<div>
											<p className="text-2xl font-bold">{value.weight}<span className="text-[0.6em]"> Kg</span></p>
											<p className="text-[#505F76] text-sm font-semibold">{new Date(value.date).toISOString().split('T')[0]} {new Date(value.date).toTimeString().slice(0, 5)}</p>
										</div>
									</div>
									<p className="my-auto text-[#00A572] font-semibold"><FontAwesomeIcon icon={faArrowUp}/> 0.3 Kg</p>
								</div>
							);
						})}
					</div>
				</div>
				<Modal open={open}>
					<div className="min-h-screen xl:w-1/2 xl:mx-auto outline-none p-10">
						<div className="h-3 mb-5 flex">
							<FontAwesomeIcon onClick={() => (setOpen(false))} className="ml-auto text-2xl cursor-pointer text-red-500" icon={faX}/>
						</div>
						<div className="bg-white rounded-2xl flex flex-col justify-center p-5">
							<h3 className="uppercase text-[#505F76] text-sm font-semibold text-center">Current weight</h3>
							<div className="flex items-center justify-center mt-2 gap-2">
								<input value={weight} onChange={(event) => (event.target.value === "" ? setWeight("") : setWeight(Number(event.target.value)))} className="border w-1/4 xl:w-1/7 border-gray-400 rounded-2xl h-15 text-center outline-none text-2xl font-bold" placeholder="00.0" type="number"/>
								<span className="text-2xl text-gray-500 font-semibold">Kg</span>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2 justify-center mt-5">
							<div className="bg-white rounded-2xl flex flex-col justify-center p-5">
								<h3 className="text-[#505F76]/80 text-sm font-semibold"><FontAwesomeIcon icon={faCalendar}/>Date</h3>
								<input className="border border-gray-400 rounded-md text-center outline-none xl:text-2xl text-[#0c0d0f] font-semibold bg-[#F2EFFF] p-1" type="date" value={date} onChange={(event) => (setDate(event.target.value))}/>
							</div>
							<div className="bg-white rounded-2xl flex flex-col justify-center p-5">
								<h3 className="text-[#505F76]/80 text-sm font-semibold"><FontAwesomeIcon icon={faClock}/>Time</h3>
								<input className="border border-gray-400 rounded-md text-center outline-none xl:text-2xl bg-[#F2EFFF] text-[#0c0d0f] font-semibold p-1" type="time" value={time} onChange={(event) => (setTime(event.target.value))}/>
							</div>
						</div>
						<p className={`${error ? "block" : "hidden"} text-red-500 bg-white/30 p-4 rounded-md mt-5 text-xl animate__animated animate__heartBeat`}>Please enter a valid goal weight (e.g., 1-1000 kg).</p>
						<button onClick={() => (logWeight())} className="bg-[#4D44E3] p-3 rounded-2xl text-white mt-5 w-full font-semibold cursor-pointer text-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-olive-400 hover:bg-[#4239e5]">Log Weight</button>
  					</div>
				</Modal>
			</main>
			<button onClick={() => (setOpen(true))} className="fixed right-3 bottom-3 bg-[#4D44E3] text-white cursor-pointer p-2 rounded-full hover:bg-[#3f36e8]"><FontAwesomeIcon className="text-2xl" icon={faPlus}/></button>
		</div>
	);
}
