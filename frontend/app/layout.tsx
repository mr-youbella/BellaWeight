import type { Metadata } from "next";
import { ToastContainer } from 'react-toastify';
import "./globals.css";

export const metadata: Metadata =
{
	title: "BellaWeight — Track Your Weight Journey",
	description: "Track your weight progress with precision. Log your daily weight, monitor BMI, and reach your goal with BellaWeight.",
	keywords: ["weight tracker", "BMI", "health", "fitness", "weight loss"],
	authors: [{ name: "Younes Oubellal" }],
	icons:
	{
		icon: "/logo.png",
		apple: "/logo.png",
	},
	openGraph:
	{
		title: "BellaWeight — Track Your Weight Journey",
		description: "Track your weight progress with precision. Log your daily weight, monitor BMI, and reach your goal.",
		url: "https://bella-weight.vercel.app",
		siteName: "BellaWeight",
		images: [{ url: "/logo.png", width: 800, height: 800, alt: "BellaWeight Logo" }],
		type: "website",
	},
	twitter:
	{
		card: "summary",
		title: "BellaWeight — Track Your Weight Journey",
		description: "Track your weight progress with precision.",
		images: ["/logo.png"],
	},
};

export default function RootLayout
	({
		children,
	}: Readonly<{
		children: React.ReactNode;
	}>) {
	return (
		<html className="bg-[#F2EFFF]" lang="en">
			<body>
				{children}
				<ToastContainer />
			</body>
		</html>
	);
}
