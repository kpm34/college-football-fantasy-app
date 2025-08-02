import { Card, CardTitle, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: '🏈',
    title: 'Power 4 Only',
    description: 'SEC, ACC, Big 12, and Big Ten - only the best conferences'
  },
  {
    icon: '🏆',
    title: 'Elite Matchups',
    description: 'Start players only in AP Top-25 or conference games'
  },
  {
    icon: '📊',
    title: 'Live Scoring',
    description: 'Real-time updates powered by ESPN data'
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 relative bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-bold text-center mb-16 chrome-text">
          Why Play With Us?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} hover className="group">
              <div className="text-6xl mb-6 group-hover:scale-110 transition-transform chrome-text">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardContent>{feature.description}</CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}