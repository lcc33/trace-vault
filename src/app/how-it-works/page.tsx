export default function HowItWorks() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-16 text-center text-gray-100">
      {/* Heading */}
      <h1 className="text-4xl font-bold mb-4">How It Works</h1>
      <p className="text-lg text-gray-400 mb-12">
        TraceVault makes it easy to connect lost items with their owners.  
        Here’s a quick look at how the process works:
      </p>

      {/* Steps */}
      <div className="grid gap-12 md:grid-cols-3">
        {/* Step 1 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-2xl font-bold mb-4">
            1
          </div>
          <h2 className="text-xl font-semibold mb-2">Report</h2>
          <p className="text-gray-400">
            Lost something? Or found an item? Post it on TraceVault in seconds with
            a description, contact info, and optional photo.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-2xl font-bold mb-4">
            2
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect</h2>
          <p className="text-gray-400">
            The community helps spread the word. Others nearby can see your post,
            share it, or contact you if they have info.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 flex items-center justify-center bg-blue-600 rounded-full text-2xl font-bold mb-4">
            3
          </div>
          <h2 className="text-xl font-semibold mb-2">Reunite</h2>
          <p className="text-gray-400">
            Once matched, you get your item back or help someone else find theirs.  
            It’s fast, simple, and community-powered.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-12">
        <a
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
        >
          🚀 Join the Waitlist
        </a>
      </div>
    </section>
  );
}
