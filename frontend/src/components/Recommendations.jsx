// --- COMPONENT 6: Recommendations ---
const Recommendations = ({ data }) => (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-inner p-6 space-y-4 text-white">
        <h3 className="text-2xl font-bold text-center">Genie's Advice</h3>
        <div className="space-y-3">
            <div>
                <p className="font-semibold">💡 What to wear:</p>
                <p>{data.clothingSuggestion}</p>
            </div>
            <div>
                <p className="font-semibold">💡 Activity ideas:</p>
                <p>{data.activitySuggestion}</p>
            </div>
        </div>
    </div>
);

export default Recommendations;