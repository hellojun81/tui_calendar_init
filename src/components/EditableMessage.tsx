import React, { useEffect, useRef, useCallback } from "react";

/** {변수} -> <span> 하이라이트 */
const highlightVariables = (text: string) => {
  // XSS 방지: 먼저 <> 등 이스케이프
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // {foo} 패턴만 <span>으로 감싸기
  const html = esc(text).replace(/\{([^}]+)\}/g, (_m, p1) => {
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

  /** 현재 커서의 plain-text 오프셋 구하기 */
  const getCaretOffset = useCallback(() => {
    const el = divRef.current;
    if (!el) return 0;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return 0;
    const range = sel.getRangeAt(0).cloneRange();

    // div 시작부터 현재 커서까지 텍스트 길이 합산
    const preRange = document.createRange();
    preRange.selectNodeContents(el);
    preRange.setEnd(range.endContainer, range.endOffset);
    const tmp = document.createElement("div");
    tmp.appendChild(preRange.cloneContents());
    // <br>는 개행으로 취급
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
    // 끝으로
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, []);

  /** 외부 value 변화 -> 하이라이트 반영 + 커서 보존 */
  useEffect(() => {
    const el = divRef.current;
    if (!el) return;
    const caret = getCaretOffset();
    const html = highlightVariables(value);
    if (el.innerHTML !== html) {
      el.innerHTML = html || ""; // 렌더
      setCaretOffset(Math.min(caret, (el.innerText || "").length));
    }
  }, [value, getCaretOffset, setCaretOffset]);

  /** 입력 처리: plain text로 onChange 호출 */
  const handleInput = useCallback(() => {
    const el = divRef.current;
    if (!el) return;
    // innerText가 <br>를 \n로 처리해줌
    const next = el.innerText.replace(/\u200B/g, "");
    // 커서 위치 저장
    const caret = getCaretOffset();
    onChange(next);
    // onChange -> value 업데이트 후 useEffect에서 커서 복원됨
    // (즉시 복원 필요 시 setTimeout 0으로 지연복원도 가능)
  }, [onChange, getCaretOffset]);

  /** 붙여넣기: 서식 제거(순수 텍스트만) */
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text); // deprecated이지만 광범위 호환
  }, []);

  return (
    <div
      ref={divRef}
      contentEditable
      role="textbox"
      aria-multiline="true"
      spellCheck={false}
      onInput={handleInput}
      onPaste={handlePaste}
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
      // 초기 렌더 대비
      dangerouslySetInnerHTML={{ __html: highlightVariables(value) }}
      className="editable-message"
    />
  );
}
