export default function Features() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-100">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-4">Features</h1>
      <p className="text-lg text-gray-400 mb-12">
        TraceVault is an <span className="text-blue-400 font-medium">open-source </span> 
        project built with transparency and collaboration at its core.  
        Together, we’re building tools that make lost & found easier, 
        safer, and community-driven.
      </p>

      {/* Feature Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 text-left">
        {/* Feature Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">🔍 Report & Find Items</h2>
          <p className="text-gray-400">
            Post lost or found items with ease. Our platform makes reporting 
            simple, fast, and accessible to everyone.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">🌍 Community-Powered</h2>
          <p className="text-gray-400">
            Built by the community, for the community. Contributions are 
            welcome from developers, designers, and everyday users.  
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">⚡ Real-Time Updates</h2>
          <p className="text-gray-400">
            Stay updated instantly when a user makes a claim on an item you reported.  
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">💡 Open Source Transparency</h2>
          <p className="text-gray-400">
            Everything is open and transparent — anyone can audit, 
            contribute, or suggest improvements on GitHub.  
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">🔒 Secure by Design</h2>
          <p className="text-gray-400">
            Security and privacy come first. We protect users’ data while 
            keeping the platform open and collaborative.  
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
          <h2 className="text-xl font-semibold mb-2">🤝 Contribute Freely</h2>
          <p className="text-gray-400">
            Found a bug or have a feature idea? Open a pull request — 
            your contribution directly impacts the community.  
          </p>
        </div>
      </div>

    </section>
  );
}
