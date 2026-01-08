export default function About() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 text-gray-100">
      {/* Heading */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">About TraceVault</h1>
        <p className="text-lg text-gray-400">
          Empowering people to find, protect, and connect with what matters most.
        </p>
      </div>

      {/* Story */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Our Story</h2>
          <p className="text-gray-300 leading-relaxed">
            TraceVault started with a simple idea: what if losing something
            didn’t have to mean it was gone forever? We’re building a community-driven
            platform where people can report, track, and reconnect with their belongings
            in a safe, reliable way.  
          </p>
        </div>

        {/* Mission */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-300 leading-relaxed">
            Our mission is to make the world a little more honest and a lot more
            connected. By combining technology with community trust, TraceVault
            helps reduce loss, encourage accountability, and make it easier for
            people to return what isn’t theirs.  
          </p>
        </div>

        {/* Open Source */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Built Open Source</h2>
          <p className="text-gray-300 leading-relaxed">
            Transparency and collaboration are at the core of what we do. TraceVault
            is built as an open-source project, meaning anyone can contribute,
            improve, and shape the future of the platform. Together, we’re creating
            more than just software — we’re building a movement.  
          </p>
        </div>

        {/* Community */}
        <div>
          <h2 className="text-2xl font-semibold mb-2">Join the Community</h2>
          <p className="text-gray-300 leading-relaxed">
            Whether you’re a developer, designer, or someone who simply believes
            in making a difference, there’s a place for you at TraceVault. Join
            our waitlist, contribute to the project, and help us grow a platform
            that gives people peace of mind.  
          </p>
        </div>
      </div>
    </section>
  );
}
