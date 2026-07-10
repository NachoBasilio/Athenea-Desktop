import { Counter } from '../../components/Counter/Counter'

import './style.css'

export default function Home() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-8 py-12 text-slate-800">
			<h1 className="mb-6 text-center text-4xl font-semibold tracking-tight text-slate-900">
				¡Bienvenido a {__APP_TITLE_JS_STRING__}!
			</h1>
			<img
				className="home-logo mb-6"
				src={`${import.meta.env.BASE_URL}logo.png`}
				alt=""
			/>
			<Counter />
		</div>
	)
}
