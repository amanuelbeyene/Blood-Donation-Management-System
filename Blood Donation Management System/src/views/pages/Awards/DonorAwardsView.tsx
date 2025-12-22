import { useState, useEffect } from 'react';

// Interfaces for new features
interface RewardTier {
    name: string;
    minDonations: number;
    icon: string;
    color: string;
    description: string;
}

interface PointAction {
    action: string;
    points: number;
    description: string;
}

const prizeTiers = [
    { points: 2000, title: 'Free Treatment', icon: '🩺' },
    { points: 1800, title: 'Free Medicine', icon: '💊' },
    { points: 1500, title: 'Computer', icon: '💻' },
    { points: 1300, title: 'Mobile', icon: '📞' },
    { points: 1000, title: 'Books', icon: '📚' },
    { points: 800, title: 'Free Transportation', icon: '🚌' },
    { points: 600, title: 'Credit Money', icon: '💳' },
    { points: 300, title: 'Electronics', icon: '🎧' },
    { points: 100, title: 'Free Mobile Airtime', icon: '📱' },
];

const winners = [
    { name: 'Abebe Kebede', age: 34, bloodType: 'A+', phone: '+251911****55', location: 'Addis Ababa', award: 'Computer', points: 1650, badge: '🏆 Gold' },
    { name: 'Sara Mohammed', age: 29, bloodType: 'O-', phone: '+251923****26', location: 'Dire Dawa', award: 'Electronics', points: 450, badge: '🥈 Silver' },
    { name: 'Tewodros Hailu', age: 42, bloodType: 'B+', phone: '+251944****12', location: 'Bahir Dar', award: 'Free Medicine', points: 1900, badge: '🦸 Platinum' },
    { name: 'Manhuros Hailu', age: 21, bloodType: 'O-', phone: '+251923****26', location: 'Dire Dawa', award: 'Free Mobile Airtime', points: 150, badge: '🥉 Bronze' },
    { name: 'Yared Desta', age: 28, bloodType: 'AB-', phone: '+251911****99', location: 'Addis Ababa', award: 'Mobile', points: 1400, badge: '🏆 Gold' },
];

const rewardTiers: RewardTier[] = [
    { name: 'Bronze Donor', minDonations: 1, icon: '🥉', color: 'bg-amber-100 text-amber-800', description: '1+ Donations' },
    { name: 'Silver Donor', minDonations: 3, icon: '🥈', color: 'bg-slate-200 text-slate-800', description: '3+ Donations' },
    { name: 'Gold Donor', minDonations: 5, icon: '🏆', color: 'bg-yellow-100 text-yellow-800', description: '5+ Donations' },
    { name: 'Platinum / Hero', minDonations: 10, icon: '🦸', color: 'bg-indigo-100 text-indigo-800', description: '10+ Donations' },
];

const pointSystem: PointAction[] = [
    { action: 'Successful Donation', points: 100, description: 'Per verified donation' },
    { action: 'Emergency Donation', points: 50, description: 'During urgent requests/disasters' },
    { action: 'Referral Success', points: 30, description: 'When a referred friend donates' },
    { action: 'Annual Consistency', points: 100, description: 'Donating regularly within a year' },
];

const DonorAwardsView = () => {
    const [activeTab, setActiveTab] = useState<'winners' | 'program'>('winners');

    // Initial duration based on 30 days, 23 hours, 59 minutes, 59 seconds
    // This ensures the "Day" counter displays "30"
    const initialSeconds = (30 * 24 * 60 * 60) + (23 * 60 * 60) + (59 * 60) + 59;
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Helper to get time parts
    const getTimeParts = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return { d, h, m, s };
    };

    const { d, h, m, s } = getTimeParts(timeLeft);
    const pad = (num: number) => num.toString().padStart(2, '0');

    // Mock current user data (replace with actual auth context in production)
    const currentDonor = {
        name: 'Abebe Kebede',
        status: '🏆 Gold',
        points: 1650,
        bloodType: 'A+',
        location: 'Addis Ababa',
        currentAward: 'Computer'
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-red-700 sm:text-4xl">Rewards & Recognition</h1>
                <p className="text-slate-600">Celebrating our life-saving heroes</p>
            </div>

            {/* Current Donor Profile Header */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-2xl font-bold text-red-600 border-2 border-red-200">
                        {currentDonor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{currentDonor.name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold border border-yellow-200">
                                {currentDonor.status}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                📍 {currentDonor.location}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 md:gap-8 justify-center md:justify-end flex-1">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">My Points</p>
                        <p className="text-xl font-bold text-red-600">{currentDonor.points}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Blood Type</p>
                        <p className="text-xl font-bold text-gray-900">{currentDonor.bloodType}</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current Target</p>
                        <p className="text-lg font-bold text-blue-600">{currentDonor.currentAward}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex justify-center border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('winners')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'winners'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Award Winners
                    </button>
                    <button
                        onClick={() => setActiveTab('program')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'program'
                            ? 'border-red-500 text-red-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        Reward Program Details
                    </button>
                </nav>
            </div>

            {activeTab === 'winners' && (
                <div className="space-y-10">
                    {/* Prize Tiers */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">🏆 Prize Collection Tiers</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {prizeTiers.map((tier) => (
                                <div
                                    key={tier.points}
                                    className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-100 ring-1 ring-slate-100 hover:ring-red-100 transition relative overflow-hidden group"
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-2xl group-hover:bg-red-100 transition">
                                            {tier.icon}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-600 uppercase tracking-widest">{tier.points} Points</p>
                                            <p className="text-base font-semibold text-gray-900 leading-tight">{tier.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Winners Table */}
                    <div className="rounded-3xl bg-white shadow-card overflow-hidden border border-rose-100">
                        <div className="bg-rose-100 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                            <h2 className="text-xl font-semibold text-slate-900">This Month's Top Donors</h2>

                            <div className="flex items-center gap-4 bg-white/60 px-6 py-2 rounded-xl border border-rose-200">
                                <span className="text-rose-800 font-bold text-sm">⏰ Next Prize Draw:</span>
                                <div className="flex items-center gap-2 text-rose-900">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold uppercase text-rose-600 leading-none mb-1">Day</span>
                                        <div className="bg-rose-600 text-white rounded px-2 py-1 font-mono font-bold text-lg leading-none shadow-sm">
                                            {pad(d)}
                                        </div>
                                    </div>
                                    <span className="font-bold text-rose-400 mt-3">:</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold uppercase text-rose-600 leading-none mb-1">Hour</span>
                                        <div className="bg-rose-600 text-white rounded px-2 py-1 font-mono font-bold text-lg leading-none shadow-sm">
                                            {pad(h)}
                                        </div>
                                    </div>
                                    <span className="font-bold text-rose-400 mt-3">:</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold uppercase text-rose-600 leading-none mb-1">Min</span>
                                        <div className="bg-rose-600 text-white rounded px-2 py-1 font-mono font-bold text-lg leading-none shadow-sm">
                                            {pad(m)}
                                        </div>
                                    </div>
                                    <span className="font-bold text-rose-400 mt-3">:</span>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-bold uppercase text-rose-600 leading-none mb-1">Sec</span>
                                        <div className="bg-rose-600 text-white rounded px-2 py-1 font-mono font-bold text-lg leading-none shadow-sm">
                                            {pad(s)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-white">
                                    <tr className="text-left text-sm text-slate-600">
                                        <th className="px-6 py-4 font-semibold">Name</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Points</th>
                                        <th className="px-6 py-4 font-semibold">Blood Type</th>
                                        <th className="px-6 py-4 font-semibold">Location</th>
                                        <th className="px-6 py-4 font-semibold">Current Award</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-rose-50">
                                    {winners.map((winner, idx) => (
                                        <tr key={idx} className="text-sm text-slate-700 hover:bg-rose-50/50 transition">
                                            <td className="px-6 py-3 font-medium text-gray-900">{winner.name}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {winner.badge}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 font-bold text-red-600">{winner.points}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
                                                    {winner.bloodType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">{winner.location}</td>
                                            <td className="px-6 py-3 text-blue-600 font-medium">{winner.award}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'program' && (
                <div className="space-y-12 animate-fadeIn">
                    {/* 1. Donation Levels */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">1. Donor Recognition Levels</h2>
                            <p className="text-gray-600 font-medium mt-1">Earn badges and recognition based on your number of successful donations.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {rewardTiers.map((tier) => (
                                <div key={tier.name} className={`${tier.color} p-6 rounded-2xl border border-white/50 shadow-sm relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 opacity-10 text-9xl transform translate-x-1/3 -translate-y-1/3">
                                        {tier.icon}
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-4xl mb-4">{tier.icon}</div>
                                        <h3 className="text-xl font-bold mb-1">{tier.name}</h3>
                                        <p className="font-bold text-3xl mb-1">{tier.minDonations}+</p>
                                        <p className="text-sm opacity-80 uppercase tracking-wide">Donations</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2. How to Earn Points */}
                    <section>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">2. Point-Based Rewards System</h2>
                            <p className="text-gray-600 mt-1">Collect points for every life-saving action you take.</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                                {pointSystem.map((item, idx) => (
                                    <div key={idx} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition">
                                        <div className="h-12 w-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-xl shrink-0">
                                            +{item.points}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-900">{item.action}</h4>
                                            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* 3. Additional Bonuses */}
                    <section className="grid md:grid-cols-2 gap-8">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
                            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                                <span>🚀</span> Consistency & Frequency
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3 text-blue-800">
                                    <span className="font-bold text-xl">•</span>
                                    <span>Donated again after 3 months? Get a <span className="font-bold">Quarterly Bonus</span>.</span>
                                </li>
                                <li className="flex gap-3 text-blue-800">
                                    <span className="font-bold text-xl">•</span>
                                    <span>Donated twice in one year? Earn the <span className="font-bold">Consistent Savior Badge</span>.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-100">
                            <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-2">
                                <span>🩸</span> Rare Blood Types
                            </h3>
                            <p className="text-amber-800 mb-4">
                                Donors with rare blood types (e.g., <span className="font-bold bg-white/50 px-1 rounded">O-</span>, <span className="font-bold bg-white/50 px-1 rounded">AB-</span>) play a critical role.
                            </p>
                            <div className="flex items-center gap-2 text-amber-800 font-medium bg-white/60 p-3 rounded-lg">
                                <span className="text-2xl">🌟</span>
                                <span>Earn <span className="font-bold">Double Points</span> for rare blood type donations during shortages.</span>
                            </div>
                        </div>
                    </section>

                    <div className="bg-gray-900 text-white p-8 rounded-3xl text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to level up?</h2>
                        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">Your contributions save lives every day. Start your journey to becoming a Platinum Hero today.</p>
                        <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-red-900/20">
                            View My Points
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DonorAwardsView;
