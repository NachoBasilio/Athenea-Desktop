import { LocationProvider, Router, Route } from 'preact-iso'
import Home from './routes/Home/Home'

/** Reads the `route` query param (used by main-process child windows) so the
 * renderer navigates to the requested route on startup instead of always
 * resolving to the current `location.pathname`. */
function getInitialUrl() {
	const params = new URLSearchParams(location.search)
	const route = params.get('route')
	return route || location.pathname + location.search
}

export default function App() {
	return (
		<LocationProvider url={getInitialUrl()}>
			<Router>
				<Route path="/" component={Home} />
				<Route default component={Home} />
			</Router>
		</LocationProvider>
	)
}
