"use client";
import { useEffect, useState } from "react";

interface Data
{
	id:          number;
	user_id:     number;
	name:        string;
	height:      number;
	weight:      number;
	goal_weight: number;
	created_at:  string;
}

interface PlankEntry
{
	id:      number;
	date:    string;
	minutes: number;
	seconds: number;
}

export interface UserFullData
{
	data:   Data;
	planks: PlankEntry[];
}

export default function useGetData(): { result: UserFullData | null | false, refresh: () => void }
{
	const [result, setResult]   = useState<UserFullData | null | false>(null);
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
				const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
				{
					method:  "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok)
					return (setResult(false));
				const me = await res.json();

				const [data_res, planks_res] = await Promise.all(
				[
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data/${me.id}`,
					{
						method:  "GET",
						headers: { Authorization: `Bearer ${token}` },
					}),
					fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/planks/${me.id}`,
					{
						method:  "GET",
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				if (!data_res.ok || !planks_res.ok)
					return (setResult(false));

				const data   = await data_res.json();
				const planks = await planks_res.json();

				setResult({ data, planks });
			}
			catch
			{
				setResult(false);
			}
		}
		fetch_data();
	}, [trigger]);

	function refresh()
	{
		setTrigger((prev) => prev + 1);
	}

	return ({ result, refresh });
}
