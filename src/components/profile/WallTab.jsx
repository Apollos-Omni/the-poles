import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Trophy, Zap, Image } from "lucide-react";

const DEMO_POSTS = [
  {
    id: "p1",
    type: "user_post",
    text: "Just won my first AirPods Pro match! The SkyChess format is seriously intense 🎅🏆",
    date: "2026-05-05",
    likes: 12,
    comments: 3,
  },
  {
    id: "p2",
    type: "match_announcement",
    text: "🏆 Hosting a 5K Challenge next month — $800 Vacation Package on the line. Who's joining? 🧊",
    badge: "Event Promo",
    badgeColor: "bg-cyan-900/40 text-cyan-300 border-cyan-700/30",
    date: "2026-04-20",
    likes: 8,
    comments: 5,
  },
  {
    id: "p3",
    type: "prize_announcement",
    text: "🎯 I'm competing for the PlayStation 5 in the Trivia Champion Finals tonight. Wish me luck!",
    badge: "Prize Target",
    badgeColor: "bg-yellow-900/40 text-yellow-300 border-yellow-700/30",
    date: "2026-04-15",
    likes: 21,
    comments: 7,
  },
  {
    id: "p4",
    type: "win",
    text: "🏅 WON IT! Air Jordan 1 Retro High is mine! 4 weeks of 5K training paid off. Thanks everyone who joined!",
    badge: "Win 🏆",
    badgeColor: "bg-green-900/40 text-green-300 border-green-700/30",
    date: "2026-04-12",
    likes: 47,
    comments: 14,
  },
];

function PostCard({ post, authorName, authorInitials }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(l => !l);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  return (
    <div className="bg-black/40 border border-purple-700/20 rounded-2xl p-4 space-y-3">
      {/* Author row */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {authorInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold">{authorName}</p>
          <p className="text-purple-400/50 text-xs">{post.date}</p>
        </div>
        {post.badge && (
          <Badge className={`${post.badgeColor} text-xs flex-shrink-0`}>{post.badge}</Badge>
        )}
      </div>

      {/* Content */}
      <p className="text-purple-100/90 text-sm leading-relaxed">{post.text}</p>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1 border-t border-purple-700/10">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-pink-400' : 'text-purple-400/60 hover:text-pink-400'}`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-pink-400' : ''}`} />
          {likeCount}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-purple-400/60 hover:text-purple-300 transition-colors">
          <MessageCircle className="w-4 h-4" />
          {post.comments}
        </button>
        <button className="flex items-center gap-1.5 text-xs text-purple-400/60 hover:text-purple-300 transition-colors">
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}

export default function WallTab({ authorName, authorInitials }) {
  const [postText, setPostText] = useState('');
  const [posts, setPosts] = useState(DEMO_POSTS);

  const handlePost = () => {
    if (!postText.trim()) return;
    const newPost = {
      id: `p_${Date.now()}`,
      type: 'user_post',
      text: postText.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
    setPostText('');
  };

  return (
    <div className="space-y-4">
      {/* Post composer */}
      <div className="bg-black/30 border border-purple-700/20 rounded-2xl p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {authorInitials}
          </div>
          <textarea
            placeholder="Share a match result, event promo, or what's on your mind..."
            value={postText}
            onChange={e => setPostText(e.target.value)}
            rows={3}
            className="flex-1 bg-black/30 border border-purple-700/20 focus:border-purple-500 text-white placeholder:text-purple-400/40 rounded-xl p-3 text-sm resize-none focus:outline-none"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <button className="text-purple-400/60 hover:text-purple-300 transition-colors">
              <Image className="w-4 h-4" />
            </button>
            <button className="text-purple-400/60 hover:text-purple-300 transition-colors">
              <Trophy className="w-4 h-4" />
            </button>
            <button className="text-purple-400/60 hover:text-purple-300 transition-colors">
              <Zap className="w-4 h-4" />
            </button>
          </div>
          <Button
            size="sm"
            className="bg-purple-700 hover:bg-purple-600 text-white text-xs"
            onClick={handlePost}
            disabled={!postText.trim()}
          >
            Post
          </Button>
        </div>
      </div>

      {/* Posts feed */}
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          authorName={authorName}
          authorInitials={authorInitials}
        />
      ))}
    </div>
  );
}