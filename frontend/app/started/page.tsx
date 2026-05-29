"use client";
import '@fortawesome/fontawesome-svg-core/styles.css'
import { faArrowLeft, faArrowRight, faHeartCircleCheck, faRocket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import 'animate.css';
import { useEffect, useState } from "react";
import useAuth from "../auth/auth";
import { useRouter } from "next/navigation";
import useUserData from "./useUserData";

export default function Started()
{
	const	is_valid = useAuth();
	const	has_data  = useUserData();
	const	router = useRouter();
	let		[step, setStep] = useState<number>(1);
	let		[full_name, setFullName] = useState<string>("");
	let		[height, setHeight] = useState<number | "">("");
	let		[weight, setWeight] = useState<number | "">("");
	let		[goal_weight, setGoalWeight] = useState<number | "">("");
	let		[error, setError] = useState<{step: number, is_error: boolean}>({step: 0, is_error: false});

	useEffect(() =>
	{
		if (is_valid === false)
			router.replace("/login");
	}, [is_valid]);
	useEffect(() =>
    {
        if (has_data === true)
            router.replace("/analytics");
    }, [has_data]);
	if (is_valid === null || has_data === null)
        return (null);
	async function ft_submit()
    {
        const token = localStorage.getItem("token");
        const me_res = await fetch(`${process.env.BACKEND_URL}/me`,
        {
            method:  "GET",
            headers: {
			Authorization: `Bearer ${token}` },
        });
        const me = await me_res.json();

        await fetch(`${process.env.BACKEND_URL}/data`,
        {
            method:  "POST",
            headers:
			{
                "Content-Type": "application/json",
                Authorization:  `Bearer ${token}`,
            },
            body: JSON.stringify({ user_id: me.id, name: full_name, height, weight, goal_weight }),
        });
		await fetch(`${process.env.BACKEND_URL}/all_weight`,
		{
			method:  "POST",
			headers:
			{
				"Content-Type": "application/json",
				Authorization:  `Bearer ${token}`,
			},
			body: JSON.stringify({ user_id: me.id, weight }),
		});
        router.replace("/analytics");
    }
	function ft_continue()
	{
		if (step === 1 && full_name.length < 2)
		{
			setError({step, is_error: true});
			return ;
		}
		if (step === 2 && !(Number(height) >= 1 && Number(height) <= 300))
		{
			setError({step, is_error: true});
			return ;
		}
		if (step === 3 && !(Number(height) >= 1 && Number(height) <= 300))
		{
			setError({step, is_error: true});
			return ;
		}
		if (step === 4 && !(Number(goal_weight) >= 1 && Number(goal_weight) <= 1000))
		{
			setError({step, is_error: true});
			return ;
		}
		setError({step, is_error: false});
		if (step === 4)
			ft_submit();
		setStep(step + 1);
	}

	return (
		<main className="flex flex-col md:w-2/3 xl:w-1/2 md:mx-auto p-10">
			<div className="flex flex-col justify-center items-center text-center">
				<img className="w-20" src="/logo.png" alt="logo"/>
				<h1 className="text-3xl font-bold">BellaWeight</h1>
				<p className="xl:w-1/2 mx-auto text-black/50">Track your weight progress with precision, every step of your wellness journey.</p>
			</div>
			<div className="mt-10 bg-white rounded-3xl shadow-2xl shadow-black/50 xl:w-1/2 xl:mx-auto p-7 py-10">
				<div className="flex flex-col space-y-2">
					<div className={`${step === 5 ? "hidden" : "block"} h-1 w-full bg-black/10 mb-8 rounded-2xl`}>
						<div className={`h-full bg-[#3323CC] rounded-2xl transition-all duration-300`} style={{width: `${((step + 1) / 5) * 100}%`}}></div>
					</div>
					<div className={`${step !== 1 && step < 5 ? "block" : "hidden"}`}>
						<button onClick={() => (setStep(step - 1))} className="text-xs mb-2 cursor-pointer transition-all duration-300 hover:text-[#4D44E3]"><FontAwesomeIcon icon={faArrowLeft}/> BACK</button>
					</div>
					<div className={`flex flex-col space-y-2 ${step === 1 ? "block" : "hidden"}`}>
						<h2 className="text-xl font-bold">Welcome to BellaWeight</h2>
						<p className="text-black/70 text-xs">Let's start with the basics. What should we call you?</p>
						<div>
							<div className="flex flex-col-reverse space-y-1 mt-3">
								<input autoFocus value={full_name} onChange={(event) => (setFullName(event.target.value))} className="peer rounded-md p-1.5 px-2 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="full_name" type="text" placeholder="Younes Oubellal"/>
								<label className="text-xs text-black/70 font-bold transition-colors duration-300 peer-focus:text-[#6760FD]" htmlFor="full_name">FULL NAME</label>
							</div>
							<p className={`${error.is_error && error.step === 1 ? "block" : "hidden"} text-red-500 text-xs`}>Please enter your full name (at least 2 characters).</p>
						</div>
					</div>
					<div className={`flex flex-col space-y-2 ${step === 2 ? "block" : "hidden"}`}>
						<h2 className="text-xl font-bold">Tell us about yourself</h2>
						<p className="text-black/70 text-xs">Your height helps us calculate accurate basal metabolic rates and BMI trends.</p>
						<div>
							<div className="flex flex-col-reverse space-y-1 mt-3">
								<div className="relative flex items-center">
									<input autoFocus value={height} onChange={(event) => (event.target.value === "" ? setHeight("") : setHeight(Number(event.target.value)))} className="peer w-full rounded-md p-1.5 px-2 pr-10 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="height" type="number" min={0} placeholder="180"/>
									<span className="absolute right-3 text-sm font-semibold text-gray-500 select-none">CM</span>
								</div>
								<label className="text-xs text-black/70 font-bold transition-colors duration-300 peer-focus:text-[#6760FD]" htmlFor="height">HEIGHT (CM)</label>
							</div>
							<p className={`${error.is_error && error.step === 2 ? "block" : "hidden"} text-red-500 text-xs`}>Please enter a valid height in centimeters (e.g., 1-300 cm).</p>
						</div>
					</div>
					<div className={`flex flex-col space-y-2 ${step === 3 ? "block" : "hidden"}`}>
						<h2 className="text-xl font-bold">Tell us about yourself</h2>
						<p className="text-black/70 text-xs">You current weight, which we will start with an analysis.</p>
						<div>
							<div className="flex flex-col-reverse space-y-1 mt-3">
								<div className="relative flex items-center">
									<input autoFocus value={weight} onChange={(event) => (event.target.value === "" ? setWeight("") : setWeight(Number(event.target.value)))} className="peer w-full rounded-md p-1.5 px-2 pr-10 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="height" type="number" min={0} placeholder="65"/>
									<span className="absolute right-3 text-sm font-semibold text-gray-500 select-none">KG</span>
								</div>
								<label className="text-xs text-black/70 font-bold transition-colors duration-300 peer-focus:text-[#6760FD]" htmlFor="height">WEIGHT (KG)</label>
							</div>
							<p className={`${error.is_error && error.step === 3 ? "block" : "hidden"} text-red-500 text-xs`}>Please enter a valid weight (e.g., 1-1000 kg).</p>
						</div>
					</div>
					<div className={`flex flex-col space-y-2 ${step === 4 ? "block" : "hidden"}`}>
						<h2 className="text-xl font-bold">GOAL WEIGHT</h2>
						<p className="text-black/70 text-xs">Set your target weight to help us track your progress, estimate milestones, and personalize your wellness journey.</p>
						<div>
							<div className="flex flex-col-reverse space-y-1 mt-3">
								<div className="relative flex items-center">
									<input autoFocus value={goal_weight} onChange={(event) => (event.target.value === "" ? setGoalWeight("") : setGoalWeight(Number(event.target.value)))} className="peer w-full rounded-md p-1.5 px-2 pr-10 border border-gray-400/80 outline-none focus:border-2 transition-colors duration-300 focus:border-[#6760FD]" id="weight" type="number" min={0} placeholder="80"/>
									<span className="absolute right-3 text-sm font-semibold text-gray-500 select-none">KG</span>
								</div>
								<label className="text-xs text-black/70 font-bold transition-colors duration-300 peer-focus:text-[#6760FD]" htmlFor="weight">GOAL WEIGHT (KG)</label>
							</div>
							<p className={`${error.is_error && error.step === 4 ? "block" : "hidden"} text-red-500 text-xs`}>Please enter a valid goal weight (e.g., 1-1000 kg).</p>
						</div>
					</div>
					<div className={`${step > 4 ? "hidden" : "block"} flex justify-between mt-5`}>
						<p className="text-black/70 font-semibold my-auto text-xs">Step {step} of 4</p>
						<button onClick={() => (ft_continue())} className={`p-2 ${step !== 4 ? "bg-[#4D44E3]" : "bg-[#00885D]"} rounded-xl text-white font-semibold px-7 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50`}>{step !== 4 ? "Continue" : "Get Started"} <FontAwesomeIcon icon={step !== 4 ? faArrowRight : faRocket}/></button>
					</div>
					<div className={`flex flex-col items-center space-y-2 p-5 animate__animated animate__bounce animate__infinite ${step === 5 ? "block" : "hidden"}`}>
						<FontAwesomeIcon className="bg-[#6FFBBE]/50 p-2 rounded-xl text-2xl" icon={faHeartCircleCheck}/>
						<h1 className="text-3xl font-bold">All set!</h1>
						<p className="text-center text-black/50">Preparing your personalized dashboard...</p>
					</div>
				</div>
			</div>
			<div className="xl:w-1/3 mx-5 xl:mx-auto flex justify-between mt-5 text-xs font-semibold text-black/60">
				<p className="cursor-pointer">Privacy Policy</p>
				<p>•</p>
				<p className="cursor-pointer">Terms of Service</p>
			</div>
		</main>
	);
}
