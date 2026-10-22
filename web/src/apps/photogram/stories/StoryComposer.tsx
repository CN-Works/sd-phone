import { useLayoutEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

import { t } from '@/i18n';
import { failText, type Envelope } from '@/core/api';
import type { User } from '../data';
import type { NewStory } from '../photogramApi';
import { isVideoUrl } from '../create/Media';
import { DEFAULT_STORY_BACKGROUND, STORY_BACKGROUNDS, storyBackground } from './backgrounds';
import { useStatusBarLight } from '@/shell/useStatusBarLight';
import { StatusBarSpacer } from '@/ui/StatusBarSpacer';

export function StoryComposer({ media, me, onClose, onShare }: {
    media?:  string;
    me:      User | null;
    onClose: () => void;
    onShare: (story: NewStory) => Promise<Envelope>;
}) {
    const [caption, setCaption] = useState('');
    const [text,    setText]    = useState('');
    const [bg,      setBg]      = useState(DEFAULT_STORY_BACKGROUND);
    const [sharing, setSharing] = useState(false);
    const [error,   setError]   = useState('');
    const textRef = useRef<HTMLTextAreaElement>(null);
    useStatusBarLight(true);

    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) return;
        el.style.height = '0px';
        el.style.height = `${el.scrollHeight}px`;
    }, [text]);

    const ready = media ? true : text.trim() !== '';

    async function share() {
        if (sharing || !ready) return;
        setSharing(true);
        setError('');
        const res = await onShare(media ? { image: media, caption: caption.trim() || undefined } : { text: text.trim(), bg });
        if (!res.success) {
            setError(failText(res, t('photogram.storyCreateFailed', 'Could not share your story')));
            setSharing(false);
        }
    }

    return (
        <div className="absolute inset-0 z-50 flex flex-col bg-black font-sf" style={{ animation: 'ios-sheet-up 0.32s cubic-bezier(0.32,0.72,0,1)', willChange: 'transform' }}>
            <StatusBarSpacer />

            <div className="relative mx-2 mt-1 min-h-0 flex-1 overflow-hidden rounded-[18px]" style={media ? { background: '#111' } : { background: storyBackground(bg) }}>
                {media ? (
                    isVideoUrl(media)
                        ? <video src={media} autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover" />
                        : <img src={media} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center px-8 pb-20 pt-16">
                        <textarea
                            ref={textRef}
                            value={text}
                            onChange={e => setText(e.target.value)}
                            maxLength={500}
                            rows={1}
                            autoFocus
                            dir="auto"
                            placeholder={t('photogram.writeStory', 'Start typing…')}
                            className="max-h-full w-full resize-none overflow-y-auto no-scrollbar bg-transparent text-center text-[26px] font-semibold leading-snug text-white outline-none placeholder:text-white/70"
                        />
                    </div>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    aria-label={t('common.close', 'Close')}
                    className="absolute start-3 top-3 flex h-[38px] w-[38px] items-center justify-center rounded-full bg-black/35 text-white active:opacity-60"
                >
                    <X className="h-[24px] w-[24px]" strokeWidth={2.2} />
                </button>

                {media ? (
                    <div className="absolute inset-x-0 bottom-5 px-5">
                        <input
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            maxLength={200}
                            dir="auto"
                            placeholder={t('photogram.addCaption', 'Add a caption…')}
                            className="w-full rounded-[12px] bg-black/50 px-4 py-3 text-center text-[17px] text-white outline-none placeholder:text-white/70"
                        />
                    </div>
                ) : (
                    <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3.5">
                        {Object.entries(STORY_BACKGROUNDS).map(([key, css], i) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setBg(key)}
                                aria-label={t('photogram.storyBackground', 'Background {n}', { n: i + 1 })}
                                className={`h-[34px] w-[34px] rounded-full active:scale-90 ${key === bg ? 'border-[3px] border-white' : 'border-2 border-white/45'}`}
                                style={{ background: css }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {error && <div className="px-5 pt-3 text-center text-[14px] text-white/85">{error}</div>}

            <div className="flex shrink-0 justify-end px-4 pb-9 pt-3">
                <button
                    type="button"
                    onClick={() => { void share(); }}
                    disabled={!ready || sharing}
                    className="flex items-center gap-2.5 rounded-full bg-white py-2 pe-5 ps-2 active:opacity-70 disabled:opacity-40"
                >
                    {me?.avatar
                        ? <img src={me.avatar} alt="" draggable={false} className="h-[30px] w-[30px] rounded-full object-cover" />
                        : <span className="h-[30px] w-[30px] rounded-full bg-black/15" />}
                    <span className="text-[16px] font-semibold text-black">
                        {sharing ? t('photogram.sharing', 'Sharing…') : t('photogram.yourStory', 'Your Story')}
                    </span>
                </button>
            </div>
        </div>
    );
}
