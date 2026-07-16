import Sidebar from "./Sidebar";

function Appshell({ children }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1">
                {children}
            </main>
        </div>

    )
}

export default Appshell;