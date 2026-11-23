import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Send, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchReaderCode, inviteLink } from "@/services/shelf-service";
import { copyText } from "@/lib/poem-clipboard";

interface ShareInviteProps {
  token: string;
  className: string;
}

export const inviteMessage = (link: string, code: string): string =>
  `I'd love for you to read my poems. This link lets you straight in: ${link}\nIf it ever asks for the word, it's: ${code}`;

// Admin only: a link (and the reader's code) to send to friends
export const ShareInvite = ({ token, className }: ShareInviteProps) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const code = useQuery({
    queryKey: ["reader-code", token],
    queryFn: () => fetchReaderCode(token),
    enabled: open,
    staleTime: 60_000,
  });
  const link = code.data ? inviteLink(window.location.origin, code.data) : "";
  const message = code.data ? inviteMessage(link, code.data) : "";

  const copy = (what: "link" | "message") => {
    copyText(what === "link" ? link : message)
      .then(() => {
        setCopied(what);
        toast.success(what === "link" ? "Invite link copied." : "Invite copied. Paste it in a text to a friend.");
        window.setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => toast.error("Couldn't copy. Please try again."));
  };

  const share = () => {
    if (!navigator.share) return copy("message");
    navigator.share({ title: "Poems by JK", text: message }).catch(() => undefined);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <Share2 size={12} aria-hidden="true" /> Share with a friend
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-amber-200/15 bg-[hsl(20,18%,9%)] text-amber-50">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-amber-100">Invite a friend in</DialogTitle>
            <DialogDescription className="text-amber-100/60">
              The link opens the door for them as a guest: they can read and search, but never edit.
            </DialogDescription>
          </DialogHeader>

          {code.isLoading ? (
            <p className="text-sm text-amber-100/60">Getting your invite ready…</p>
          ) : code.isError ? (
            <p className="text-sm text-red-300">Couldn't get the reader's code. Leave and sign in again, then try once more.</p>
          ) : !code.data ? (
            <p className="text-sm text-amber-100/70">
              There's no reader's code set yet. Add a secret named <code className="text-amber-300">READER_CODE</code> in Lovable → Cloud → Secrets, then
              come back here.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wider text-amber-100/50">The word</p>
                <p className="font-display text-2xl tracking-[0.15em] text-amber-50">{code.data}</p>
              </div>
              <div>
                <p className="mb-1 text-[11px] uppercase tracking-wider text-amber-100/50">Invite link</p>
                <div className="flex items-center gap-2 rounded-md border border-amber-100/15 bg-black/30 px-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-xs text-amber-100/80">{link}</span>
                  <button type="button" onClick={() => copy("link")} className="text-amber-100/70 hover:text-amber-50" aria-label="Copy invite link">
                    {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="rounded-md border border-amber-100/10 bg-white/[0.03] p-3 text-sm text-amber-100/80 whitespace-pre-wrap">{message}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copy("message")}
                  className="brass-plate flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold text-stone-900"
                >
                  {copied === "message" ? <Check size={14} /> : <Copy size={14} />} Copy invite
                </button>
                {typeof navigator !== "undefined" && "share" in navigator && (
                  <button
                    type="button"
                    onClick={share}
                    className="flex items-center gap-1.5 rounded-full border border-amber-100/20 px-4 py-1.5 text-sm text-amber-100 hover:text-amber-50"
                  >
                    <Send size={14} /> Send…
                  </button>
                )}
              </div>
              <p className="text-xs text-amber-100/45">
                Anyone with this link can read your shelf. To lock old links out, change <code>READER_CODE</code> in Lovable; everyone gets signed out and needs the new word.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
