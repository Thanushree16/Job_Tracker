import TopBar from "./TopBar";

function Appshell({ children }) {
    return (
        <div className="min-h-screen bg-paper dark:bg-night transition-colors">
            <TopBar />
            <main>
                {children}
            </main>
        </div>
    )
}

export default Appshell;
