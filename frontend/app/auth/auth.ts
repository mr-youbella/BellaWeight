"use client";
import { useEffect, useState } from "react";

export default function useAuth(): boolean | null
{
	const	[is_valid, setIsValid] = useState<boolean | null>(null);

	useEffect(() =>
	{
		async function check()
		{
			const token = localStorage.getItem("token");
			if (!token)
			{
				setIsValid(false);
				return ;
			}
			try
			{
				const res = await fetch(`${process.env.BACKEND_URL}/me`,
				{
					method: "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok)
				{
					localStorage.removeItem("token");
					setIsValid(false);
					return;
				}
				setIsValid(true);
			}
			catch
			{
				localStorage.removeItem("token");
				setIsValid(false);
			}
		};
		check();
	}, []);
	return (is_valid);
}
