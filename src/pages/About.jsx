import React from "react";
import { BookOpen, Target, Users, Award, Zap, Heart, Code, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: <BookOpen size={32} />,
      title: "Diverse Categories",
      description: "Explore thousands of questions across multiple categories including Science, History, Entertainment, and more.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Target size={32} />,
      title: "Multiple Difficulty Levels",
      description: "Challenge yourself with Easy, Medium, or Hard difficulty levels tailored to your skill level.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <Award size={32} />,
      title: "Track Your Progress",
      description: "Monitor your performance, view detailed analytics, and see how you improve over time.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: <Users size={32} />,
      title: "Compete Globally",
      description: "Join the leaderboard and compete with players from around the world to see who ranks highest.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <Zap size={32} />,
      title: "Real-Time Quizzes",
      description: "Take timed quizzes with instant feedback and detailed explanations for each question.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <Lightbulb size={32} />,
      title: "Learn & Improve",
      description: "Review your mistakes, understand correct answers, and expand your knowledge with every quiz.",
      color: "from-rose-500 to-pink-500",
    },
  ];

  const stats = [
    { label: "Categories", value: "50+", icon: <BookOpen size={24} /> },
    { label: "Questions", value: "10K+", icon: <Target size={24} /> },
    { label: "Active Users", value: "1K+", icon: <Users size={24} /> },
    { label: "Quiz Attempts", value: "5K+", icon: <Award size={24} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-4">
              <Heart className="text-red-500" size={20} />
              <span className="text-sm font-semibold text-gray-700">About TriviaTrek</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Welcome to
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TriviaTrek
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              Your ultimate destination for challenging quizzes, learning new facts, and competing with players worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 text-white">
                  {stat.icon}
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-white rounded-3xl shadow-2xl p-12 md:p-16">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                To make learning fun, engaging, and accessible to everyone through interactive quizzes
                and friendly competition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">What We Offer</h3>
                <p className="text-gray-700 leading-relaxed">
                  TriviaTrek provides a comprehensive quiz platform where you can test your knowledge
                  across various topics, track your progress, and compete on global leaderboards.
                  Whether you're a trivia enthusiast or just looking to learn something new, we've
                  got something for everyone.
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Why Choose Us</h3>
                <p className="text-gray-700 leading-relaxed">
                  Our platform combines the best of learning and entertainment. With thousands of
                  questions, multiple difficulty levels, detailed analytics, and a vibrant community
                  of players, TriviaTrek is the perfect place to challenge yourself and grow your
                  knowledge.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for an amazing quiz experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Get started in three simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sign Up</h3>
              <p className="text-gray-600">
                Create your free account to start your trivia journey. It only takes a minute!
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Choose a Quiz</h3>
              <p className="text-gray-600">
                Browse through our extensive collection of categories and select a quiz that interests you.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Play & Compete</h3>
              <p className="text-gray-600">
                Answer questions, see your results, and climb the leaderboard to become a trivia master!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of players testing their knowledge every day
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/Category"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Explore Categories
              </Link>
              <Link
                to="/home"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                View Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 px-4 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Code size={20} />
            <p className="text-sm">
              Built with <Heart className="inline text-red-500" size={16} /> for trivia enthusiasts
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            © 2025 TriviaTrek. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;

