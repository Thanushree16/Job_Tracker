import TopBar from "./TopBar";

function Appshell({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <TopBar />
            <main>
                {children}
            </main>
        </div>
    )
}

export default Appshell;