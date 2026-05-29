"use client";
import { useEffect, useState } from "react";

export default function useUserData(): boolean | null
{
	const [has_data, setHasData] = useState<boolean | null>(null);

	useEffect(() =>
	{
		async function check()
		{
			const token = localStorage.getItem("token");
			if (!token)
				return ((setHasData(false)));
			try
			{
				const res = await fetch(`${process.env.BACKEND_URL}/me`,
				{
					method: "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok)
					return (setHasData(false));
				const me = await res.json();

				const data_res = await fetch(`${process.env.BACKEND_URL}/data/${me.id}`,
				{
					method: "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (data_res.status === 404)
                    return (setHasData(false));
				setHasData(true);
			}
			catch
			{
				setHasData(false);
			}
		}
		check();
	}, []);

	return ((has_data));
}
