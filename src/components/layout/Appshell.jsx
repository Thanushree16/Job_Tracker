import Sidebar from "./Sidebar";

function Appshell({ children }) {
    return (
        <div className="flex">
            <Sidebar />
            <main className="flex-1">
                {children}
            </main>
        </div>

    )
}

export default Appshell;