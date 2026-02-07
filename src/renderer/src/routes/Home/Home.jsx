import { Counter } from "../../components/Counter/Counter";

import "./style.css";

export default function Home() {
  return (
    <div className="home">
      <h1 className="home-title">¡Bienvenido!</h1>
      <img className="home-logo" src="../../public/logo.png" alt="" />
      <Counter />
    </div>
  );
}
