"use client";
import { faGripfire } from "@fortawesome/free-brands-svg-icons";
import { faArrowDown, faArrowUp, faCalendar, faClock, faEquals, faGauge, faHistory, faPlus, faTrash, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Modal from '@mui/material/Modal';
import { toast } from 'react-toastify';
import { useEffect, useState } from "react";
import 'animate.css';
import { useRouter } from "next/navigation";
import useGetData from "./getData";
import useAuth from "../auth/auth";
import Link from "next/link";

export default function Planks()
{
	const	{ is_valid, is_old_user }            = useAuth();
	const	router              = useRouter();
	const	{ result, refresh } = useGetData();
	const	[minutes, setMinutes] = useState<number | "">("");
	const	[seconds, setSeconds] = useState<number | "">("");
	const	[date, setDate]       = useState<string>(new Date().toISOString().split("T")[0]);
	const	[time, setTime]       = useState<string>(new Date().toTimeString().slice(0, 5));
	const	[error, setError]     = useState<boolean>(false);
	const	[open, setOpen]       = useState<boolean>(false);

	useEffect(() =>
	{
		if (is_valid === false)
			router.replace("/login");
	}, [is_valid]);
	useEffect(() =>
	{
		if (is_old_user === false)
			router.replace("/started");
	}, [is_old_user]);
	if (is_valid === null || result === null)
		return (null);
	if (result === false)
		return (null);

	const { data, planks } = result;
	async function addPlank()
	{
		const toast_id = toast.loading("Adding plank session...");
		const token    = localStorage.getItem("token");
		if (!token)
			return;
		try
		{
			const me_res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
			{
				method:  "GET",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!me_res.ok)
				return toast.update(toast_id, { render: "Something went wrong", type: "error", isLoading: false, autoClose: 3000 });
			const me  = await me_res.json();
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planks`,
			{
				method:  "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body:    JSON.stringify({
					user_id: me.id,
					minutes: Number(minutes),
					seconds: Number(seconds),
					date:    new Date(`${date}T${time}`).toISOString(),
				}),
			});
			if (!res.ok)
				return toast.update(toast_id, { render: "Failed to add plank", type: "error", isLoading: false, autoClose: 3000 });
			const new_entry = await res.json();
			refresh();
			toast.update(toast_id, { render: "Plank session added! 💪", type: "success", isLoading: false, autoClose: 2000 });
		}
		catch
		{
			toast.update(toast_id, { render: "Server is not responding", type: "error", isLoading: false, autoClose: 3000 });
		}
	}

	async function logPlank()
	{
		if (!(Number(minutes) >= 0 && Number(seconds) >= 0 && Number(seconds) <= 59 && (Number(minutes) > 0 || Number(seconds) > 0)))
		{
			setError(true);
			return ;
		}
		setError(false);
		setOpen(false);
		await addPlank();
		setMinutes("");
		setSeconds("");
		setDate(new Date().toISOString().split("T")[0]);
		setTime(new Date().toTimeString().slice(0, 5));
	}

	async function deletePlank(id: number)
	{
		const toast_id = toast.loading("Deleting plank session...");
		const token    = localStorage.getItem("token");
		try
		{
			const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planks/${id}`,
			{
				method:  "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok)
				return toast.update(toast_id, { render: "Failed to delete", type: "error", isLoading: false, autoClose: 3000 });
			refresh();
			toast.update(toast_id, { render: "Plank session deleted! 🗑️", type: "success", isLoading: false, autoClose: 2000 });
		}
		catch
		{
			toast.update(toast_id, { render: "Server is not responding", type: "error", isLoading: false, autoClose: 3000 });
		}
	}

	const total_sessions = planks.length;
	const best_minutes   = planks.length ? Math.max(...planks.map((p) => Number(p.minutes) * 60 + Number(p.seconds))) : 0;
	const best_min       = Math.floor(best_minutes / 60);
	const best_sec       = best_minutes % 60;
	const avg_seconds    = planks.length ? Math.round(planks.reduce((sum, p) => sum + Number(p.minutes) * 60 + Number(p.seconds), 0) / planks.length) : 0;
	const avg_min        = Math.floor(avg_seconds / 60);
	const avg_sec        = avg_seconds % 60;

	return (
		<div>
			<nav className="bg-[#111C33] p-3 xl:w-1/2 xl:mx-auto">
				<div className="flex justify-between">
					<div className="flex gap-2">
						<Link href={"/home"}><img className="w-15 rounded-full" src="/logo.png" alt="logo"/></Link>
						<div>
							<h1 className="text-2xl font-bold text-[#FFB703]">BellaWeight</h1>
							<p className="text-[#CBD5E1] font-semibold">Hello, {data.name}</p>
						</div>
					</div>
					<button onClick={() => { localStorage.removeItem("token"); router.replace("/login"); }} className="bg-[#EF4444] p-1 px-4 my-auto rounded-xl text-white mt-5 font-semibold cursor-pointer transition-all duration-300 hover:shadow-2xl hover:bg-[#dc2626]">Log Out</button>
				</div>
			</nav>
			<main className="m-5 animate__animated animate__bounceInLeft xl:w-1/2 xl:mx-auto">
				<div className="bg-linear-to-r from-[#FF6B35] to-[#F97316] p-5 rounded-2xl text-white">
					<h3 className="uppercase text-[#FFE8D6] font-semibold text-sm">Best Plank</h3>
					<p className="text-3xl font-bold">{best_min}m {best_sec}s</p>
					<p className="text-[#FFE8D6] text-sm mt-1">Total sessions: {total_sessions}</p>
				</div>
				<div className="grid grid-cols-2 gap-3 mt-5">
					<div className="rounded-2xl p-5 bg-[#111C33]">
						<FontAwesomeIcon className="text-xl font-bold text-[#FFB703]" icon={faArrowUp}/>
						<h4 className="text-[#CBD5E1] font-semibold">Best</h4>
						<p className="text-2xl font-bold text-white">{best_min}m {best_sec}s</p>
					</div>
					<div className="rounded-2xl p-5 bg-[#111C33]">
						<FontAwesomeIcon className="text-xl font-bold text-[#38BDF8]" icon={faGauge}/>
						<h4 className="text-[#CBD5E1] font-semibold">Average</h4>
						<p className="text-2xl font-bold text-white">{avg_min}m {avg_sec}s</p>
					</div>
					<div className="rounded-2xl p-5 bg-[#111C33]">
						<FontAwesomeIcon className="text-xl font-bold text-[#22C55E]" icon={faGripfire}/>
						<h4 className="text-[#CBD5E1] font-semibold">Sessions</h4>
						<p className="text-2xl font-bold text-white">{total_sessions}</p>
					</div>
					<div className="rounded-2xl p-5 bg-[#111C33]">
						<FontAwesomeIcon className="text-xl font-bold text-[#F97316]" icon={faArrowDown}/>
						<h4 className="text-[#CBD5E1] font-semibold">Last</h4>
						<p className="text-2xl font-bold text-white">{planks.length ? `${planks[0].minutes}m ${planks[0].seconds}s` : "—"}</p>
					</div>
				</div>
				<div className="mt-5">
					<div className="flex justify-between">
						<h3 className="text-xl font-semibold text-white">Plank Trend</h3>
						<p className="uppercase text-sm font-semibold text-[#FFB703]">last 30 days</p>
					</div>
					<div className="w-full select-none">
						<ResponsiveContainer width="100%" height={300}>
							<AreaChart data={[...planks].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((p) => ({ ...p, total_seconds: Number(p.minutes) * 60 + Number(p.seconds) }))}>
								<Area type="monotone" dataKey="total_seconds" stroke="#FF6B35" fill="#FB923C" strokeWidth={2} dot={{ r: 5 }}/>
								<XAxis dataKey="date" tick={{ fill: "#CBD5E1" }} tickFormatter={(value) => new Date(value).toISOString().split('T')[0]}/>
								<YAxis tick={{ fill: "#CBD5E1" }} tickFormatter={(v) => `${Math.floor(v / 60)}m${v % 60}s`}/>
								<Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString("en-GB")} formatter={(value) => [`${Math.floor(Number(value) / 60)}m ${Number(value) % 60}s`, "Duration"]}/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</div>
				<div className="mt-5">
					<div className="flex justify-between">
						<h3 className="text-xl font-semibold text-white">Plank Sessions</h3>
						<p className="uppercase text-sm font-semibold text-[#FFB703]">View all</p>
					</div>
					<div className="mt-5 grid grid-cols-1 gap-2">
						{planks.map((value, index, arr) =>
						{
							const prev        = arr[index + 1];
							const curr_total  = Number(value.minutes) * 60 + Number(value.seconds);
							const prev_total  = prev ? Number(prev.minutes) * 60 + Number(prev.seconds) : 0;
							const diff        = prev ? curr_total - prev_total : 0;
							const is_up       = diff > 0;
							const is_same     = diff === 0;

							return (
								<div key={index} className="flex justify-between bg-[#111C33] rounded-2xl p-4">
									<div className="flex gap-3">
										<FontAwesomeIcon className="my-auto text-xl rounded-full bg-[#1F2A44] text-[#FFB703] p-2" icon={faHistory}/>
										<div>
											<p className="text-2xl font-bold text-white">{value.minutes}m {value.seconds}s</p>
											<p className="text-[#94A3B8] text-sm font-semibold">{new Date(value.date).toISOString().split('T')[0]} {new Date(value.date).toTimeString().slice(0, 5)}</p>

											{prev ? (
												<p className={`text-xs font-semibold mt-1 ${is_same ? "text-gray-400" : is_up ? "text-[#22C55E]" : "text-[#EF4444]"}`}>
													<FontAwesomeIcon icon={is_same ? faEquals : is_up ? faArrowUp : faArrowDown}/>
													{" "}{Math.abs(Math.floor(diff / 60))}m {Math.abs(diff % 60)}s
												</p>
											) : (
												<p className="text-xs text-gray-400 font-semibold mt-1">— first entry</p>
											)}
										</div>
									</div>

									<button onClick={() => deletePlank(value.id)} className="my-auto bg-[#7F1D1D] hover:bg-[#EF4444] text-[#FCA5A5] hover:text-white p-2 rounded-xl transition-all duration-300 cursor-pointer">
										<FontAwesomeIcon icon={faTrash}/>
									</button>
								</div>
							);
						})}
					</div>
				</div>
				<Modal open={open}>
					<div className="min-h-screen xl:w-1/2 xl:mx-auto outline-none p-10 bg-[#0B1220]">
						<div className="h-3 mb-5 flex">
							<FontAwesomeIcon onClick={() => setOpen(false)} className="ml-auto text-2xl cursor-pointer text-[#EF4444]" icon={faX}/>
						</div>
						<div className="bg-[#111C33] rounded-2xl flex flex-col justify-center p-5">
							<h3 className="uppercase text-[#CBD5E1] text-sm font-semibold text-center">Plank Duration</h3>
							<div className="flex items-center justify-center mt-2 gap-3">
								<div className="flex items-center gap-1">
									<input value={minutes} onChange={(e) => (e.target.value === "" ? setMinutes("") : setMinutes(Number(e.target.value)))} className="border border-[#334155] w-16 rounded-2xl h-15 text-center outline-none text-2xl font-bold bg-[#0F172A] text-white" placeholder="00" type="number" min={0}/>
									<span className="text-2xl text-[#CBD5E1] font-semibold">m</span>
								</div>
								<div className="flex items-center gap-1">
									<input value={seconds} onChange={(e) => (e.target.value === "" ? setSeconds("") : setSeconds(Number(e.target.value)))} className="border border-[#334155] w-16 rounded-2xl h-15 text-center outline-none text-2xl font-bold bg-[#0F172A] text-white" placeholder="00" type="number" min={0} max={59}/>
									<span className="text-2xl text-[#CBD5E1] font-semibold">s</span>
								</div>
							</div>
						</div>
						<div className="grid grid-cols-2 gap-2 justify-center mt-5">
							<div className="bg-[#111C33] rounded-2xl flex flex-col justify-center p-5">
								<h3 className="text-[#CBD5E1] text-sm font-semibold"><FontAwesomeIcon icon={faCalendar}/> Date</h3>
								<input className="border border-[#334155] rounded-md text-center outline-none xl:text-2xl text-white font-semibold bg-[#0F172A] p-1" type="date" value={date} onChange={(e) => setDate(e.target.value)}/>
							</div>
							<div className="bg-[#111C33] rounded-2xl flex flex-col justify-center p-5">
								<h3 className="text-[#CBD5E1] text-sm font-semibold"><FontAwesomeIcon icon={faClock}/> Time</h3>
								<input className="border border-[#334155] rounded-md text-center outline-none xl:text-2xl bg-[#0F172A] text-white font-semibold p-1" type="time" value={time} onChange={(e) => setTime(e.target.value)}/>
							</div>
						</div>
						<p className={`${error ? "block" : "hidden"} text-[#EF4444] bg-[#111C33] p-4 rounded-md mt-5 text-xl animate__animated animate__heartBeat`}>Please enter a valid duration.</p>
						<button onClick={() => logPlank()} className="bg-[#FF6B35] p-3 rounded-2xl text-white mt-5 w-full font-semibold cursor-pointer text-2xl transition-all duration-300 hover:bg-[#fb5a1a] hover:shadow-2xl">
							Log Plank 💪
						</button>
					</div>
				</Modal>
			</main>

			<button onClick={() => setOpen(true)} className="fixed right-3 bottom-3 bg-[#FF6B35] text-white cursor-pointer p-2 rounded-full hover:bg-[#fb5a1a]">
				<FontAwesomeIcon className="text-2xl" icon={faPlus}/>
			</button>
		</div>
	);
}
