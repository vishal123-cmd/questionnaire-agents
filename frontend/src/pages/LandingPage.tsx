import { Link } from 'react-router-dom';
import { ArrowRight, Database, MessageSquare, FileText, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">KnowledgeAI</h1>
          <div className="space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-white/80">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white text-blue-900 hover:bg-white/90">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Answer Any Question.
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Instantly.
          </span>
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Connect your documents, Confluence, Google Drive and let AI answer everything.
          Build a unified knowledge base powered by cutting-edge AI.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90">
              Start for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: Database,
              title: 'Knowledge Base',
              description: 'Upload documents, connect integrations, centralize your knowledge'
            },
            {
              icon: MessageSquare,
              title: 'AI Chat',
              description: 'Get instant answers with source citations from your knowledge base'
            },
            {
              icon: FileText,
              title: 'Questionnaire Automation',
              description: 'Auto-fill RFPs and questionnaires using your knowledge base'
            },
            {
              icon: Zap,
              title: 'Integrations',
              description: 'Connect Google Drive, Confluence, Notion, and more'
            }
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20"
            >
              <feature.icon className="h-12 w-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Loved by teams worldwide
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              quote: "KnowledgeAI transformed how we handle RFPs. What used to take days now takes minutes.",
              author: "Sarah Chen",
              role: "Sales Director"
            },
            {
              quote: "Our support team can now answer customer questions instantly with accurate, cited answers.",
              author: "Mike Johnson",
              role: "Head of Support"
            },
            {
              quote: "The best knowledge management tool we've ever used. The AI is surprisingly accurate.",
              author: "Emily Rodriguez",
              role: "Operations Manager"
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
              <p className="text-gray-300 mb-4">"{testimonial.quote}"</p>
              <div>
                <p className="text-white font-semibold">{testimonial.author}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">
          Ready to unlock your knowledge?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Start free. No credit card required.
        </p>
        <Link to="/register">
          <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90">
            Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-gray-400">
            © 2026 KnowledgeAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
