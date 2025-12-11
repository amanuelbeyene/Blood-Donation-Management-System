const awardCards = [
  { title: 'Free Transportation', icon: '🚗' },
  { title: 'Free Treatment', icon: '🩺' },
  { title: 'Free Medicine', icon: '💊' },
  { title: 'Credit Money', icon: '💳' },
  { title: 'Free Mobile Airtime', icon: '📱' },
  { title: 'Books', icon: '📚' },
  { title: 'Mobile', icon: '📞' },
  { title: 'Computer', icon: '💻' },
  { title: 'Electronics', icon: '🎧' },
];

const winners = [
  { name: 'Abebe Kebede', age: 34, bloodType: 'A+', phone: '+251911****55', location: 'Addis Ababa', award: 'Free Treatment' },
  { name: 'Sara Mohammed', age: 29, bloodType: 'O-', phone: '+251923****26', location: 'Dire Dawa', award: 'Free Bus Transportation' },
  { name: 'Tewodros Hailu', age: 42, bloodType: 'B+', phone: '+251944****12', location: 'Bahir Dar', award: 'Free Public Services' },
  { name: 'Abebe Kebede', age: 34, bloodType: 'A+', phone: '+251911****55', location: 'Addis Ababa', award: 'Free Treatment' },
  { name: 'Manhuros Hailu', age: 21, bloodType: 'O-', phone: '+251923****26', location: 'Dire Dawa', award: 'Free Bus Transportation' },
  { name: 'Abebe Kebede', age: 34, bloodType: 'O-', phone: '+251911****55', location: 'Addis Ababa', award: 'Free Public Services' },
];

const AwardsView = () => {
  return (
    <div className="space-y-10 pb-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-blue-700 sm:text-4xl">Blood Donor Award List</h1>
        <p className="text-slate-600">Rewards for outstanding blood donors</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {awardCards.map((card) => (
          <div
            key={card.title}
            className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm border border-slate-100"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              {card.icon}
            </div>
            <p className="text-lg font-semibold text-blue-700 leading-tight">{card.title}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white shadow-card overflow-hidden border border-rose-100">
        <div className="bg-rose-100 px-6 py-4">
          <h2 className="text-xl font-semibold text-slate-900">Award Winners List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white">
              <tr className="text-left text-sm text-slate-600">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Age</th>
                <th className="px-6 py-4 font-semibold">Blood Type</th>
                <th className="px-6 py-4 font-semibold">Phone Number</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Type of Award</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {winners.map((winner) => (
                <tr key={`${winner.name}-${winner.phone}`} className="text-sm text-slate-700">
                  <td className="px-6 py-3">{winner.name}</td>
                  <td className="px-6 py-3">{winner.age}</td>
                  <td className="px-6 py-3">{winner.bloodType}</td>
                  <td className="px-6 py-3">{winner.phone}</td>
                  <td className="px-6 py-3">{winner.location}</td>
                  <td className="px-6 py-3">{winner.award}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-rose-100 px-6 py-4 flex items-center gap-3 text-rose-900">
          <span className="text-lg">⏰</span>
          <p className="font-semibold">Next Prize Draw In: 23 : 17 : 45 : 24</p>
        </div>
      </div>
    </div>
  );
};

export default AwardsView;


