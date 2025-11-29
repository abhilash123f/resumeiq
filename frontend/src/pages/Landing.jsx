import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm mb-6 border border-white/20 animate-fade-in">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              ✨ Now with AI Resume Builder
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up">
              Build, Match & Optimize
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 text-transparent bg-clip-text">
                Your Resume with AI
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl mb-10 text-gray-200 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              Create professional resumes from scratch, match them against job descriptions,
              and get AI-powered suggestions to land your dream job.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap mb-8 animate-fade-in-up animation-delay-400">
              <Link 
                to="/auth" 
                className="group relative px-8 py-4 bg-white text-purple-900 rounded-xl font-bold text-lg hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-purple-500/50"
              >
                <span className="relative z-10">🚀 Start Building Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur"></div>
              </Link>
              <a 
                href="#features" 
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border border-white/30"
              >
                ✨ See Features
              </a>
            </div>

            {/* Features Pills */}
            <div className="flex flex-wrap gap-3 justify-center text-sm animate-fade-in-up animation-delay-600">
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                🎉 100% Free Forever
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                🔒 No Credit Card Required
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                🤖 AI-Powered
              </span>
              <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                ⚡ Instant Results
              </span>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
              Powerful AI Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to create, optimize, and match your resume with job opportunities
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            <div className="group relative bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-purple-200 hover:-translate-y-2">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                NEW!
              </div>
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">AI Resume Builder</h3>
              <p className="text-gray-600 leading-relaxed">
                Build professional resumes from scratch with AI assistance. Generate summaries,
                bullet points, and skills automatically.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Smart Matching</h3>
              <p className="text-gray-600 leading-relaxed">
                AI analyzes your resume against job descriptions using semantic embeddings
                and provides detailed match scores.
              </p>
            </div>
            
            <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-green-200 hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🔄</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Resume Optimization</h3>
              <p className="text-gray-600 leading-relaxed">
                Get AI-powered suggestions to rewrite your resume bullets for maximum impact
                and ATS compatibility.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-yellow-200 hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Detailed Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                See breakdown scores for skills, experience, and keywords. Identify missing
                skills and areas for improvement.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-pink-200 hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Multiple Templates</h3>
              <p className="text-gray-600 leading-relaxed">
                Choose from professional, modern, or minimal templates. Live preview as you build
                your resume.
              </p>
            </div>

            <div className="group bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-200 hover:-translate-y-2">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">💾</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Save & Download</h3>
              <p className="text-gray-600 leading-relaxed">
                Save multiple versions of your resume. Download as text or PDF. Access from
                anywhere.
              </p>
            </div>
          </div>

          {/* AI Features Highlight */}
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 max-w-4xl mx-auto overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <h3 className="text-3xl font-bold text-center mb-8 text-white relative z-10">🤖 AI-Powered Features</h3>
            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="text-3xl">✍️</span>
                <div>
                  <h4 className="font-bold mb-1 text-white">AI Summary Generator</h4>
                  <p className="text-sm text-white/80">Generate professional summaries tailored to your experience</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="text-3xl">📝</span>
                <div>
                  <h4 className="font-bold mb-1 text-white">AI Bullet Writer</h4>
                  <p className="text-sm text-white/80">Create achievement-focused bullets with metrics</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="text-3xl">🎯</span>
                <div>
                  <h4 className="font-bold mb-1 text-white">AI Skills Suggester</h4>
                  <p className="text-sm text-white/80">Get relevant skills based on your role and industry</p>
                </div>
              </div>
              <div className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                <span className="text-3xl">🔍</span>
                <div>
                  <h4 className="font-bold mb-1 text-white">ATS Compatibility Check</h4>
                  <p className="text-sm text-white/80">Ensure your resume passes applicant tracking systems</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="max-w-5xl mx-auto">
            {/* Two Paths */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Path 1: Build Resume */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-primary-200">
                <div className="text-center mb-6">
                  <div className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-2">
                    Option 1: Build from Scratch
                  </div>
                  <h3 className="text-xl font-bold">AI Resume Builder</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Choose Template</h4>
                      <p className="text-sm text-gray-600">Select from professional designs</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Add Your Info</h4>
                      <p className="text-sm text-gray-600">AI generates summary & skills</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Add Experience</h4>
                      <p className="text-sm text-gray-600">AI writes achievement bullets</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Save & Download</h4>
                      <p className="text-sm text-gray-600">Get your professional resume</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Path 2: Match Resume */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                <div className="text-center mb-6">
                  <div className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-2">
                    Option 2: Match Existing Resume
                  </div>
                  <h3 className="text-xl font-bold">Resume Matcher</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Upload Resume</h4>
                      <p className="text-sm text-gray-600">PDF, DOCX, or TXT format</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Paste Job Description</h4>
                      <p className="text-sm text-gray-600">Copy from job posting</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Get AI Analysis</h4>
                      <p className="text-sm text-gray-600">Match score & suggestions</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Optimize & Apply</h4>
                      <p className="text-sm text-gray-600">Improve and download</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-4">
                ⚡ Both paths powered by advanced AI • 🎯 ATS-optimized • 💯 100% Free
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 text-transparent bg-clip-text mb-2 group-hover:scale-110 transition-transform">100%</div>
              <p className="text-gray-600">Free Forever</p>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-2 group-hover:scale-110 transition-transform">AI</div>
              <p className="text-gray-600">Powered Features</p>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 text-transparent bg-clip-text mb-2 group-hover:scale-110 transition-transform">3</div>
              <p className="text-gray-600">Professional Templates</p>
            </div>
            <div className="group">
              <div className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text mb-2 group-hover:scale-110 transition-transform">ATS</div>
              <p className="text-gray-600">Optimized</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your Perfect Resume?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join job seekers using AI to create professional resumes, match with jobs,
            and land interviews faster.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth" className="btn btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              🚀 Start Building Free
            </Link>
            <Link to="/auth" className="btn btn-outline border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
              📊 Try Resume Matcher
            </Link>
          </div>
          <p className="text-sm text-white/80 mt-6">
            ✨ No credit card required • 🎯 AI-powered • 💾 Save unlimited resumes
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 ResumeIQ. All rights reserved.</p>
          <p className="text-sm mt-2">Smart Resume Analysis, Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
