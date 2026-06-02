"use client";
import { useEffect, useState } from "react";

export default function useAuth(): {is_valid: boolean | null, is_old_user: boolean | null}
{
	const	[is_valid, setIsValid] = useState<boolean | null>(null);
	const	[is_old_user, setIsOldUser] = useState<boolean | null>(null);

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
				const	res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/me`,
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
				const	data_user = await res.json();
				const data_res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/data/${data_user.id}`,
				{
					method:  "GET",
					headers: { Authorization: `Bearer ${token}` },
				});
				if (data_res.ok)
					setIsOldUser(true);
				else
					setIsOldUser(false);
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
	return ({ is_valid, is_old_user });
}
