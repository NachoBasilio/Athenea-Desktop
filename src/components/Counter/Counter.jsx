import { useState } from 'preact/hooks'
import './style.css'

export function Counter() {
	const [count, setCount] = useState(0)

	return (
		<div class="counter">
			<button onClick={() => setCount(count - 1)}>-</button>
			<p>{count}</p>
			<button onClick={() => setCount(count + 1)}>+</button>
		</div>
	)
}
