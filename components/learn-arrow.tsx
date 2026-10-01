export function LearnArrow({ back = false }: { back?: boolean }) {
  return <svg className={back ? "learn-arrow learn-arrow-back" : "learn-arrow"} viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
