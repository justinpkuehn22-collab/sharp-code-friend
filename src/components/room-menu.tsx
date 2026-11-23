import { BarChart3, BookOpen, ClipboardPaste, Copy, Eye, EyeOff, Keyboard, LogOut, Menu, Palette, Share2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roomThemes, useLoungeStore, type RoomTheme } from "@/stores/lounge-store";

interface RoomMenuProps {
  isOwner: boolean;
  viewAsGuest: boolean;
  className: string;
  onShare: () => void;
  onLibrary?: () => void;
  onInsights: () => void;
  onToggleGuestView: () => void;
  onCopyAll: () => void;
  onPaste: () => void;
  onLeave: () => void;
}

const content = "z-[70] w-56 border-amber-300/25 bg-stone-950/95 text-amber-100";
const item = "gap-2 focus:bg-white/10 focus:text-amber-50";

// Everything that isn't writing lives here, so the room stays uncluttered
export const RoomMenu = ({ isOwner, viewAsGuest, className, onShare, onLibrary, onInsights, onToggleGuestView, onCopyAll, onPaste, onLeave }: RoomMenuProps) => {
  const { roomTheme, setRoomTheme, typewriterSounds, setTypewriterSounds } = useLoungeStore();
  const owner = isOwner && !viewAsGuest;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={className}>
          <Menu size={12} aria-hidden="true" /> Menu
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={content}>
        {owner && (
          <>
            {onLibrary && (
              <DropdownMenuItem className={item} onSelect={onLibrary}>
                <BookOpen size={14} aria-hidden="true" /> The library
              </DropdownMenuItem>
            )}
            <DropdownMenuItem className={item} onSelect={onShare}>
              <Share2 size={14} aria-hidden="true" /> Share with a friend
            </DropdownMenuItem>
            <DropdownMenuItem className={item} onSelect={onInsights}>
              <BarChart3 size={14} aria-hidden="true" /> Insights
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-amber-100/10" />
          </>
        )}
        {isOwner && (
          <DropdownMenuItem className={item} onSelect={onToggleGuestView}>
            {viewAsGuest ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
            {viewAsGuest ? "Back to admin view" : "View as guest"}
          </DropdownMenuItem>
        )}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={item}>
            <Palette size={14} aria-hidden="true" /> Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className={content}>
            <DropdownMenuRadioGroup value={roomTheme} onValueChange={(v) => setRoomTheme(v as RoomTheme)}>
              {roomThemes.map((t) => (
                <DropdownMenuRadioItem key={t.id} value={t.id} className={item}>
                  {t.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {owner && (
          <>
            <DropdownMenuCheckboxItem className={item} checked={typewriterSounds} onCheckedChange={(v) => setTypewriterSounds(v === true)}>
              <Keyboard size={14} aria-hidden="true" /> Typewriter sounds
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-amber-100/10" />
            <DropdownMenuItem className={item} onSelect={onCopyAll}>
              <Copy size={14} aria-hidden="true" /> Copy all my poems
            </DropdownMenuItem>
            <DropdownMenuItem className={item} onSelect={onPaste}>
              <ClipboardPaste size={14} aria-hidden="true" /> Paste poems
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-amber-100/10" />
        <DropdownMenuItem className={item} onSelect={onLeave}>
          <LogOut size={14} aria-hidden="true" /> Leave
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
