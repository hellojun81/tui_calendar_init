import React, { useEffect, useRef, useCallback, useState } from "react";

/** #{} -> <span> 하이라이트 */
const highlightVariables = (text: string) => {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = esc(text).replace(/#\{([^}]+)\}/g, (_m, p1) => {
    return `<span class="tpl-var">{${p1}}</span>`;
  });
  return html.replace(/\n/g, "<br/>");
};

type EditableMessageProps = {
  value: string; // 원본(plain text)
  onChange: (next: string) => void;
  placeholder?: string;
};

export function EditableMessage({ value, onChange, placeholder }: EditableMessageProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);

  /** 현재 커서의 plain-text 오프셋 구하기 */
  const getCaretOffset = useCallback(() => {
    const el = divRef.current;
    if (!el) return 0;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0).cloneRange();

    const preRange = document.createRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.endContainer, range.endOffset);

    const tmp = document.createElement("div");
    tmp.appendChild(preRange.cloneContents());
    const text = tmp.innerText.replace(/\u200B/g, "");
    return text.length;
  }, []);

  /** plain-text 오프셋으로 커서 복원 */
  const setCaretOffset = useCallback((offset: number) => {
    const el = divRef.current;
    if (!el) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    let remaining = offset;
    let node: Node | null = null;

    while ((node = walker.nextNode())) {
      const len = (node.nodeValue ?? "").length;
      if (remaining <= len) {
        const range = document.createRange();
        range.setStart(node, remaining);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        return;
      }
      remaining -= len;
    }

    // 마지막 위치로
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  /** 외부 value 변화 -> 하이라이트 반영 + 커서 보존
   *  👉 타이핑 중(isTyping=true)에는 DOM을 건드리지 않음
   */
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    // 포커스가 여기 있고, 타이핑 중이면 React 쪽에서 DOM 건드리지 않음
    if (isTyping && document.activeElement === el) {
      return;
    }

    const caret = getCaretOffset();
    const html = highlightVariables(value);

    if (el.innerHTML !== html) {
      el.innerHTML = html || "";
      setCaretOffset(Math.min(caret, (el.innerText || "").length));
    }
  }, [value, isTyping, getCaretOffset, setCaretOffset]);

  /** 입력 처리: plain text로 onChange 호출 */
  const handleInput = useCallback(() => {
    const el = divRef.current;
    if (!el) return;

    if (!isTyping) setIsTyping(true);

    const next = el.innerText.replace(/\u200B/g, "");
    onChange(next);
  }, [onChange, isTyping]);

  /** 포커스를 잃었을 때 다시 하이라이트 동기화 허용 */
  const handleBlur = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
    }
  }, [isTyping]);

  /** 붙여넣기: 서식 제거(순수 텍스트만) */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  return (
    <div
      ref={divRef}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      spellCheck={false}
      onInput={handleInput}
      onPaste={handlePaste}
      onBlur={handleBlur}
      data-placeholder={placeholder || ""}
      style={{
        minHeight: 160,
        padding: 12,
        border: "1px solid #ddd",
        borderRadius: 8,
        lineHeight: 1.5,
        fontSize: "0.95rem",
        whiteSpace: "pre-wrap",
        outline: "none",
        fontFamily: "inherit",
      }}
      className="editable-message"
    />
  );
}
