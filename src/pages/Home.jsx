import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Trophy, BookOpen, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ categories: 0, quizzes: 0, users: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          axios.get("http://localhost:3000/categories").catch(() => ({ data: [] })),
          axios.get("http://localhost:3000/subcategories").catch(() => ({ data: [] })),
        ]);
        setCategories(subRes.data?.slice(0, 6) || []);
        setStats({
          categories: catRes.data?.length || 0,
          quizzes: subRes.data?.length || 0,
          users: 0,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-4">
              <Sparkles className="text-blue-600" size={20} />
              <span className="text-sm font-semibold text-gray-700">Welcome to TriviaTrek</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight">
              Test Your
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Knowledge
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
              Challenge yourself with thousands of questions across multiple categories.
              Learn, compete, and climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
              <Link
                to="/Category"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
              >
                <Play className="group-hover:scale-110 transition-transform" size={24} />
                Start Quiz
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </Link>
              <Link
                to="/Category"
                className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border-2 border-gray-200"
              >
                Explore Categories
              </Link>
            </div>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <BookOpen className="text-blue-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.categories}</h3>
              <p className="text-gray-600 font-medium">Categories</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Play className="text-purple-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.quizzes}</h3>
              <p className="text-gray-600 font-medium">Quizzes Available</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Trophy className="text-amber-600" size={32} />
              </div>
              <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.users}+</h3>
              <p className="text-gray-600 font-medium">Active Players</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose TriviaTrek?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the best quiz platform with engaging features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Diverse Categories</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore a wide range of topics from science to entertainment, 
                history to pop culture. Something for everyone!
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Trophy className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Leaderboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Compete with players worldwide. Climb the ranks and see how you 
                stack up against the best!
              </p>
            </div>

            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="text-white" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Track Progress</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor your performance over time. See your improvement and 
                identify areas to focus on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Quizzes Section */}
      {categories.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Popular Quizzes
              </h2>
              <p className="text-xl text-gray-600">Try these trending categories</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((sub, index) => (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/Difficulty/local-${sub.id}`, {
                    state: {
                      customMeta: {
                        categoryName: "Popular",
                        subcategoryName: sub.name,
                        subCategoryId: sub.id,
                        categoryId: sub.categoryId,
                      },
                    },
                  })}
                  className="group p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {sub.imageUrl && (
                    <div className="w-full h-40 rounded-xl overflow-hidden mb-4">
                      <img
                        src={sub.imageUrl}
                        alt={sub.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{sub.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">Click to start quiz</p>
                  <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                    Start Quiz
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/Category"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                View All Categories
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of players testing their knowledge every day
            </p>
            <Link
              to="/Category"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <Play size={24} />
              Get Started Now
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};

export default Home;
