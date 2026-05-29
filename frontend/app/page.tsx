import Register from "./register/page";

export default function Home()
{
	return (
		<div className="min-h-screen">
			<nav className="bg-[#E2DFFF] p-3">
				<div className="flex gap-2">
					<img className="w-15 rounded-full" src="/logo.png" alt="logo"/>
					<div>
						<h1 className="text-2xl font-bold text-[#3323CC]">BellaWeight</h1>
						<p className="text-[#68788F] font-semibold">Hello</p>
					</div>
				</div>
			</nav>
			<Register />
		</div>
	);
}
