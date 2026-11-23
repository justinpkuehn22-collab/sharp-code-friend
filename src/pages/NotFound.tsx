export const NotFound = () => (
  <div className="room-backdrop flex min-h-screen items-center justify-center">
    <div className="text-center">
      <h1 className="mb-4 font-display text-4xl font-bold text-stone-800">This page isn't on the shelf</h1>
      <p className="mb-4 text-stone-600">The poem or page you're looking for has moved or never existed.</p>
      <a href="/" className="font-semibold text-amber-800 underline hover:text-amber-700">
        Back to the shelf
      </a>
    </div>
  </div>
);
