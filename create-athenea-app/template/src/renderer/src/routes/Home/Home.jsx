import { Counter } from '../../components/Counter/Counter'

import './style.css'

export default function Home() {
	return (
		<div className="home">
			<h1 className="home-title">¡Bienvenido a __APP_TITLE__!</h1>
			<img
				className="home-logo"
				src={`${import.meta.env.BASE_URL}logo.png`}
				alt=""
			/>
			<Counter />
		</div>
	)
}
