interface ConferenceCardProps {
  name: string;
  logo?: string;
  color: string;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ConferenceCard({ 
  name, 
  logo, 
  color, 
  isSelected = false, 
  onClick 
}: ConferenceCardProps) {
  const colorMap: Record<string, string> = {
    SEC: 'from-red-600/20 to-red-800/20',
    'Big Ten': 'from-blue-600/20 to-blue-800/20',
    ACC: 'from-orange-600/20 to-orange-800/20',
    'Big 12': 'from-purple-600/20 to-purple-800/20',
  };

  return (
    <div 
      className={`
        conference-card glass-card p-8 rounded-2xl hover:scale-105 
        transition-all duration-300 cursor-pointer group h-64 
        relative overflow-hidden
        ${isSelected ? 'ring-4 ring-blue-400 bg-white/25' : ''}
      `}
      onClick={onClick}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[name] || color}`}></div>
      <div className="relative z-10 h-full flex flex-col items-center justify-center">
        <h3 className="text-3xl font-bold text-center text-white mb-6">{name}</h3>
        <div className="w-full h-32 flex items-center justify-center">
          <div className="text-center">
            {logo ? (
              <img src={logo} alt={name} className="h-20 w-auto mx-auto" />
            ) : (
              <>
                <div className="text-5xl mb-2 chrome-text">🏈</div>
                <div className="text-white text-sm font-medium">{name}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}