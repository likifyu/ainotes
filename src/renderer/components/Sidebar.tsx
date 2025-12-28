import React, { useState, useRef, useEffect } from 'react';
import { useStore, selectFilteredNotes, Note } from '../store/useStore';
import TemplateSelector from './TemplateSelector';
import ModelSelector from './ModelSelector';
import AIToolSelector from './AIToolSelector';

// Icons as SVG components
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const StarIcon = ({ filled }: { filled?: boolean }) => (
  <svg className={"w-4 h-4 " + (filled ? "text-yellow-400 fill-yellow-400" : "text-gray-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const AllNotesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

const FavoritesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const Sidebar: React.FC = () => {
  const {
    currentNote,
    searchQuery,
    setSearchQuery,
    setCurrentNote,
    deleteNote,
    toggleFavorite,
    theme,
  } = useStore();

  const [showFavorites, setShowFavorites] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredNotes = useStore((state) => {
    let result = state.notes;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(note =>
        (note.title || "").toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }
    if (showFavorites) {
      result = result.filter(note => note.isFavorite);
    }
    return result.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "今天 " + date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "昨天 " + date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays < 7) {
      return diffDays + "天前";
    } else {
      return date.toLocaleDateString("zh-CN");
    }
  };

  const getPreviewText = (content: string) => {
    const text = content.replace(/[#*`\[\]]/g, "").trim();
    return text.slice(0, 60) + (text.length > 60 ? "..." : "");
  };

  const handleNoteClick = (note: Note) => {
    setCurrentNote(note);
  };

  const handleDeleteNote = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (confirm("确定要删除这条笔记吗？")) {
      deleteNote(noteId);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside
      className={
        "w-80 flex flex-col border-r transition-all duration-300 " +
        (theme === "dark"
          ? "bg-gray-900/95 border-white/10"
          : "bg-white/80 border-gray-200")
      }
      style={{ backdropFilter: "blur(20px)" }}
    >
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm shadow-lg">
              📝
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
              AI Notes
            </h1>
          </div>
        </div>

        <div className="mb-3">
          <ModelSelector />
        </div>

        <div className="mb-3">
          <TemplateSelector />
        </div>

        <div className="relative">
          <div className={
            "absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 " +
            (isSearchFocused ? "text-violet-400" : "text-gray-400")
          }>
            <SearchIcon />
          </div>
          <input
            ref={searchRef}
            type="text"
            placeholder="搜索笔记... (⌘+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={
              "w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition-all duration-300 border outline-none " +
              (theme === "dark"
                ? "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:bg-white/10 focus:border-violet-500/50"
                : "bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-violet-500")
            }
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => setShowFavorites(false)}
            className={
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 " +
              (!showFavorites
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "text-gray-400 hover:bg-white/5 border border-transparent")
            }
          >
            <AllNotesIcon />
            <span>全部</span>
          </button>
          <button
            onClick={() => setShowFavorites(true)}
            className={
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 " +
              (showFavorites
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "text-gray-400 hover:bg-white/5 border border-transparent")
            }
          >
            <FavoritesIcon />
            <span>收藏</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-white/10">
        <AIToolSelector onSelectPrompt={() => {}} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm">
              {searchQuery ? "未找到相关笔记" : "暂无笔记"}
            </p>
            <p className="text-xs mt-1 text-gray-400">
              {searchQuery ? "尝试其他搜索词" : "点击上方模板创建新笔记"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className={
                  "group relative p-3 rounded-xl cursor-pointer transition-all duration-300 " +
                  (currentNote?.id === note.id
                    ? "bg-violet-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10"
                    : "hover:bg-white/5 border border-transparent hover:border-white/10")
                }
              >
                <div className="absolute top-3 right-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(note.id);
                    }}
                    className={
                      "p-1 rounded-full transition-all duration-200 " +
                      (note.isFavorite
                        ? "text-yellow-400 scale-110"
                        : "text-gray-500 opacity-0 group-hover:opacity-100 hover:text-yellow-400")
                    }
                  >
                    <StarIcon filled={note.isFavorite} />
                  </button>
                </div>

                <div className="pr-6">
                  <h3 className={
                    "font-medium text-sm truncate pr-2 " +
                    (currentNote?.id === note.id
                      ? "text-violet-300"
                      : theme === "dark" ? "text-white" : "text-gray-900")
                  }>
                    {note.title || "无标题笔记"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-2">
                    <span>{formatDate(note.updatedAt)}</span>
                    {note.content && (
                      <>
                        <span className="text-gray-300 dark:text-gray-600">•</span>
                        <span className="truncate flex-1">{getPreviewText(note.content)}</span>
                      </>
                    )}
                  </p>
                </div>

                <button
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  className={
                    "absolute bottom-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  }
                  title="删除笔记"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={
        "p-4 border-t text-xs text-center " +
        (theme === "dark" ? "text-gray-500 border-white/10" : "text-gray-400 border-gray-200")
      }>
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
          AI 智能笔记助手
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
