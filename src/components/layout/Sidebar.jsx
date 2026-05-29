import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div className="w-64 bg-gray-800 text-white h-screen p-4">
            <h2 className="text-xl font-bold mb-4">Sidebar</h2>
            <ul>
                <li className="mb-2"><Link to="/" className="hover:text-gray-400">Dashboard</Link></li>
                <li className="mb-2"><Link to="/paste" className="hover:text-gray-400">Paste to Track</Link></li>
                <li className="mb-2"><Link to="/resume" className="hover:text-gray-400">Resume Optimizer</Link></li>
                <li className="mb-2"><Link to="/profile" className="hover:text-gray-400">Profile</Link></li>
            </ul>
        </div>
    )
}

export default Sidebar;