import { Link } from "react-router"
import { usePuterStore } from "~/lib/puter";

const NavBar = () => {
    const { auth } = usePuterStore();

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">CVISE</p>
            </Link>
            <div>
                <Link to="/upload" className="primary-button w-fit">
                    Upload Resume
                </Link>
                <button
                    className="rounded-full px-4 py-2 cursor-pointer ml-4 bg-gray-500 text-white hover:bg-gray-600 transition-colors duration-300"
                    onClick={auth.signOut}
                >
                    Log out
                </button>
            </div>
        </nav>
    )
}

export default NavBar