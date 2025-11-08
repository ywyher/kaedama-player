"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
	return (
		<Toaster
			toastOptions={{
				style: {
					background: "var(--secondary)",
				},
			}}
		/>
	);
}
