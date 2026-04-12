'use client';

const CATEGORIES = [
  {
    id: 'market',
    title: 'Second-Hand Market',
    description: 'Buy and sell within your student community',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    icon: '🛍️',
  },
  {
    id: 'sublets',
    title: 'Sublets & Short Stays',
    description: 'Find or offer short-term housing near campus',
    gradient: 'from-blue-400 via-indigo-500 to-violet-600',
    icon: '🏠',
  },
  {
    id: 'local',
    title: 'Local Recommendations',
    description: 'Best spots for food, coffee, groceries, and more',
    gradient: 'from-emerald-400 via-teal-500 to-cyan-600',
    icon: '📍',
  },
  {
    id: 'happy-hours',
    title: 'Happy Hours',
    description: "Find out who's hosting and join the fun",
    gradient: 'from-pink-400 via-fuchsia-500 to-purple-600',
    icon: '🎉',
  },
];

const FEED_POSTS = [
  { id: 1, avatar: '👩‍🎓', name: 'Maya', text: 'Selling a desk lamp — $15', time: '2m ago', tag: 'market' },
  { id: 2, avatar: '🧑‍🍳', name: 'John', text: 'Happy hour at my place tonight at 7pm!', time: '15m ago', tag: 'social' },
  { id: 3, avatar: '👨‍💻', name: 'Raj', text: 'Anyone need a sublet Jun–Aug? 1BR on 113th', time: '1h ago', tag: 'sublet' },
  { id: 4, avatar: '👩‍🎨', name: 'Sofia', text: 'Best ramen near campus: Totto on 52nd', time: '3h ago', tag: 'local' },
];

const TAG_COLORS: Record<string, string> = {
  market: 'bg-orange-100 text-orange-700',
  social: 'bg-pink-100 text-pink-700',
  sublet: 'bg-indigo-100 text-indigo-700',
  local: 'bg-emerald-100 text-emerald-700',
};

interface CommunityViewProps {
  onClose: () => void;
}

export default function CommunityView({ onClose }: CommunityViewProps) {
  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      {/* Back */}
      <button
        onClick={onClose}
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
      >
        &larr; Back
      </button>

      {/* Neighbourhood Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 p-6 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">Your Morningside Heights Community</h2>
            <p className="text-white/70 text-sm">Columbia University area &middot; 127 neighbours active</p>
          </div>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} p-0 aspect-[4/3] text-left group transition-all duration-200 hover:scale-[1.02] hover:shadow-lg shadow-md`}
          >
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

            {/* Large icon */}
            <div className="absolute top-4 right-4 text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
              {cat.icon}
            </div>

            {/* Text at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-base leading-tight drop-shadow-sm">
                {cat.title}
              </h3>
              <p className="text-white/70 text-xs mt-1 leading-snug">
                {cat.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Community Feed Teaser */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-800 text-sm">Latest from the community</h3>
          <span className="text-xs text-fuchsia-500 font-medium">View all &rarr;</span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
          {FEED_POSTS.map((post) => (
            <div
              key={post.id}
              className="flex-shrink-0 w-64 snap-start rounded-2xl bg-white/80 border border-purple-100 p-4 space-y-2 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{post.avatar}</span>
                <span className="font-semibold text-gray-800 text-sm">{post.name}</span>
                <span className="text-xs text-gray-400 ml-auto">{post.time}</span>
              </div>
              <p className="text-sm text-gray-600 leading-snug">{post.text}</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${TAG_COLORS[post.tag] || 'bg-gray-100 text-gray-600'}`}>
                {post.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Join prompt */}
      <div className="rounded-2xl bg-white/80 border border-purple-100 p-5 text-center space-y-3">
        <p className="text-2xl">👋</p>
        <h3 className="font-bold text-gray-800">You&apos;re part of the neighbourhood now</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Post what you&apos;re selling, find a sublet, or just say hi. Your community is right here.
        </p>
        <button className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-fuchsia-600 active:scale-[0.98] transition-all shadow-md shadow-purple-200 text-sm">
          Create a post
        </button>
      </div>
    </div>
  );
}
