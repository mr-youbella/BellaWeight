"use client";
import { useEffect, useState } from "react";

interface Data
{
	id: number;
	user_id: number;
	name: string;
	height: number;
	weight: number;
	goal_weight: number;
	created_at: string;
}

interface WeightEntry
{
	id: number;
	date: string;
	weight: number;
}

export interface UserFullData
{
	data: Data;
	all_weight: WeightEntry[];
}

export default function useGetData(): { result: UserFullData | null | false, refresh: () => void }
{
	const [result, setResult] = useState<UserFullData | null | false>(null);
    const [trigger, setTrigger] = useState<number>(0);

	useEffect(() =>
	{
		async function fetch_data()
		{
			const token = localStorage.getItem("token");
			if (!token)
				return (setResult(false));
			try
			{
				const res = await fetch(`${process.env.BACKEND_URL}/me`,
				{
					method: "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok)
					return (setResult(false));
				const	me = await res.json();

				const [dataRes, weightRes] = await Promise.all
				([
					fetch(`${process.env.BACKEND_URL}/data/${me.id}`,
					{
						method: "GET",
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`${process.env.BACKEND_URL}/all_weight/${me.id}`,
					{
						method: "GET",
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);
				if (!dataRes.ok || !weightRes.ok)
					return (setResult(false));
				const	data = await dataRes.json();
				const	all_weight = await weightRes.json();
				setResult({ data, all_weight });
			}
			catch
			{
				setResult(false);
			}
		}
		fetch_data();
	}, [trigger]);
	function	refresh ()
	{
		setTrigger((prev) => (prev + 1));
	}
	return ({ result, refresh });
}
