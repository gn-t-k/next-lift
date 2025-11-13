"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "../../lib/auth-client";

type User = {
	id: string;
	name: string;
	email: string;
	image?: string;
};

const DashboardPage = () => {
	const router = useRouter();
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSession = async () => {
			try {
				const session = await authClient.getSession();
				if (session.data?.user) {
					setUser(session.data.user as User);
				} else {
					router.push("/auth/login" as never);
				}
			} catch (error) {
				console.error("Failed to fetch session:", error);
				router.push("/auth/login" as never);
			} finally {
				setLoading(false);
			}
		};

		fetchSession().catch((error) => {
			console.error("Unexpected error in fetchSession:", error);
		});
	}, [router]);

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/auth/login" as never);
	};

	if (loading) {
		return <div style={{ padding: "2rem" }}>読み込み中...</div>;
	}

	if (!user) {
		return null;
	}

	return (
		<div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
			<h1 style={{ marginBottom: "2rem" }}>ダッシュボード</h1>
			<div
				style={{
					marginBottom: "2rem",
					padding: "1rem",
					border: "1px solid #ddd",
					borderRadius: "4px",
				}}
			>
				<p>
					<strong>名前:</strong> {user.name}
				</p>
				<p>
					<strong>メールアドレス:</strong> {user.email}
				</p>
				{user.image && (
					<p>
						<Image
							src={user.image}
							alt={user.name}
							width={64}
							height={64}
							style={{ borderRadius: "50%" }}
						/>
					</p>
				)}
			</div>
			<button
				type="button"
				onClick={handleSignOut}
				style={{
					padding: "1rem 2rem",
					backgroundColor: "#d32f2f",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer",
					fontSize: "1rem",
				}}
			>
				ログアウト
			</button>
		</div>
	);
};

export default DashboardPage;
