import Link from "next/link";

export default function Community() {
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 text-center text-gray-100">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-4">Join Our Community</h1>
      <p className="text-lg text-gray-400 mb-8">
        The TraceVault community is where ideas grow, updates drop first, and people 
        like you shape the future of our open-source project.  
      </p>

      {/* Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-3">Why join?</h2>
        <ul className="text-left text-gray-300 space-y-2 mb-6 list-disc list-inside">
          <li>Be the first to hear about updates and launches</li>
          <li>Collaborate with developers, designers & creators</li>
          <li>Get involved in shaping TraceVault’s future</li>
        </ul>

        {/* WhatsApp CTA */}
        <Link
          href="https://chat.whatsapp.com/EnKufYkDI5T8xiGdr5O5Ab"
          target="_blank"
          className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors"
        >
          Join WhatsApp Community
        </Link>
      </div>
    </section>
  );
}
